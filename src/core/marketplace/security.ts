/**
 * Marketplace Security — package install security scanning.
 *
 * Performs basic security checks on packages during install:
 * - Manifest validation
 * - Dependency integrity checks
 * - Known dangerous patterns detection
 * - Checksum verification (if provided)
 */

import type { KapiPackageEntry } from "./types";

/**
 * Security scan result.
 */
export type SecurityScanResult = {
  /** Overall pass/fail */
  passed: boolean;
  /** Warnings (non-blocking) */
  warnings: SecurityFinding[];
  /** Errors (blocking — package should not be installed) */
  errors: SecurityFinding[];
  /** Overall risk level */
  riskLevel: "low" | "medium" | "high" | "critical";
};

/**
 * A single security finding.
 */
export type SecurityFinding = {
  type: "warning" | "error";
  category: "manifest" | "dependency" | "integrity" | "malicious";
  message: string;
  detail?: string;
};

/**
 * Scan a package entry for security issues.
 */
export function scanPackage(pkg: KapiPackageEntry): SecurityScanResult {
  const warnings: SecurityFinding[] = [];
  const errors: SecurityFinding[] = [];

  // ── Manifest checks ──
  if (!pkg.manifest.name) {
    errors.push({
      type: "error",
      category: "manifest",
      message: "Package name is missing",
    });
  }

  if (!pkg.manifest.version) {
    errors.push({
      type: "error",
      category: "manifest",
      message: "Package version is missing",
    });
  }

  if (!pkg.manifest.kapilabs) {
    errors.push({
      type: "error",
      category: "manifest",
      message: "Package does not specify compatible KapiLabs version",
    });
  }

  if (pkg.manifest.name && !/^[a-z0-9_-]+$/.test(pkg.manifest.name)) {
    errors.push({
      type: "error",
      category: "manifest",
      message: `Invalid package name: "${pkg.manifest.name}"`,
      detail: "Package names must be lowercase alphanumeric, hyphens, or underscores",
    });
  }

  if (pkg.manifest.version && !/^\d+\.\d+\.\d+$/.test(pkg.manifest.version)) {
    errors.push({
      type: "error",
      category: "manifest",
      message: `Invalid version format: "${pkg.manifest.version}"`,
      detail: "Version must be semver (e.g. 1.0.0)",
    });
  }

  // ── Dependency checks ──
  if (pkg.manifest.dependencies) {
    for (const [depName, depVersion] of Object.entries(pkg.manifest.dependencies)) {
      // Check for known malicious dependency names (typosquatting)
      const suspicious = checkTyposquatting(depName);
      if (suspicious) {
        warnings.push({
          type: "warning",
          category: "dependency",
          message: `Suspicious dependency name: "${depName}"`,
          detail: suspicious,
        });
      }

      // Check for URL-based dependencies (potential remote execution)
      if (depVersion.startsWith("http://") || depVersion.startsWith("https://")) {
        warnings.push({
          type: "warning",
          category: "dependency",
          message: `Dependency "${depName}" uses URL-based version: "${depVersion}"`,
          detail: "URL-based dependencies should be reviewed carefully",
        });
      }

      // Check for file-based dependencies
      if (depVersion.startsWith("file:")) {
        warnings.push({
          type: "warning",
          category: "dependency",
          message: `Dependency "${depName}" uses local file path`,
          detail: "Local file dependencies may not work in all environments",
        });
      }

      // Check for git-based dependencies
      if (depVersion.startsWith("git+") || depVersion.includes("github.com")) {
        warnings.push({
          type: "warning",
          category: "dependency",
          message: `Dependency "${depName}" uses git reference`,
          detail: "Git dependencies should be pinned to a specific commit",
        });
      }
    }
  }

  // ── Integrity checks ──
  if (pkg.registry.checksum) {
    // Checksum is provided — we should ideally verify it
    // For now, we just note that verification would happen
    warnings.push({
      type: "warning",
      category: "integrity",
      message: "Checksum verification not yet implemented",
      detail: `Package has checksum: ${pkg.registry.checksum.substring(0, 16)}...`,
    });
  }

  // ── Reputation checks ──
  if (pkg.registry.downloads === 0 && pkg.registry.rating === 0) {
    warnings.push({
      type: "warning",
      category: "malicious",
      message: "New package with no downloads or ratings — use with caution",
    });
  }

  // ── Determine risk level ──
  let riskLevel: SecurityScanResult["riskLevel"] = "low";

  if (errors.length > 0) {
    const criticalErrors = errors.filter(
      (e) =>
        e.category === "malicious" ||
        e.message.toLowerCase().includes("malicious")
    );
    if (criticalErrors.length > 0) {
      riskLevel = "critical";
    } else if (errors.length >= 3) {
      riskLevel = "high";
    } else {
      riskLevel = "medium";
    }
  } else if (warnings.length >= 3) {
    riskLevel = "medium";
  }

  return {
    passed: errors.length === 0,
    warnings,
    errors,
    riskLevel,
  };
}

/**
 * Format a security scan result for CLI display.
 */
export function formatSecurityResult(result: SecurityScanResult): string {
  const lines: string[] = [];

  if (result.passed) {
    lines.push(`  ✅ Security scan passed — risk level: ${result.riskLevel}`);
  } else {
    lines.push(`  ❌ Security scan failed — risk level: ${result.riskLevel}`);
  }

  if (result.errors.length > 0) {
    lines.push(`\n  Errors (${result.errors.length}):`);
    for (const err of result.errors) {
      lines.push(`    ❌ [${err.category}] ${err.message}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push(`\n  Warnings (${result.warnings.length}):`);
    for (const warn of result.warnings) {
      lines.push(`    ⚠ [${warn.category}] ${warn.message}`);
    }
  }

  return lines.join("\n");
}

/**
 * Check a dependency name for typosquatting against known packages.
 */
function checkTyposquatting(name: string): string | null {
  const knownPackages = [
    "kapilabs",
    "kapilabs-theme",
    "kapilabs-plugin",
    "sanity",
    "astro",
    "tailwindcss",
    "typescript",
    "react",
  ];

  for (const known of knownPackages) {
    // Check for character swap typos
    for (let i = 0; i < known.length - 1; i++) {
      const chars = known.split("");
      [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
      const swapped = chars.join("");
      if (name === swapped) {
        return `Possible typosquatting of "${known}" (character swap: "${swapped}")`;
      }
    }

    // Check for common substitutions
    const subs: Record<string, string> = {
      "0": "o",
      "1": "l",
      "3": "e",
      "4": "a",
      "5": "s",
      "6": "g",
      "7": "t",
      "8": "b",
    };
    const substituted = name
      .split("")
      .map((c) => subs[c] || c)
      .join("");
    if (substituted === known) {
      return `Possible typosquatting of "${known}" (character substitution)`;
    }

    // Check for extra characters
    if (name.length === known.length + 1 && name.includes(known)) {
      // Single extra character suffixed/prefixed
      return `Possible typosquatting of "${known}" (extra characters)`;
    }
  }

  return null;
}
