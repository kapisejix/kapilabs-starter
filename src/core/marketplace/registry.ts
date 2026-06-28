/**
 * Marketplace Registry — local JSON-based package registry.
 *
 * Manages a local registry JSON file that lists all available packages.
 * Supports listing, searching, filtering, and metadata lookup.
 * The CLI install command uses this to find packages.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import type {
  KapiPackageEntry,
  KapiPackageQuery,
  KapiPackageType,
  KapiInstallResult,
} from "./types";

/**
 * Default path to the local registry file.
 */
const DEFAULT_REGISTRY_PATH = resolve(process.cwd(), "marketplace", "registry.json");

/**
 * Load packages from the local registry file.
 */
export function loadRegistry(
  registryPath: string = DEFAULT_REGISTRY_PATH
): KapiPackageEntry[] {
  if (!existsSync(registryPath)) {
    return [];
  }

  try {
    const content = readFileSync(registryPath, "utf-8");
    const data = JSON.parse(content);

    if (Array.isArray(data)) return data as KapiPackageEntry[];
    if (data.packages && Array.isArray(data.packages))
      return data.packages as KapiPackageEntry[];

    return [];
  } catch (err) {
    console.warn(`[Marketplace] Failed to load registry: ${err}`);
    return [];
  }
}

/**
 * Save packages to the local registry file.
 */
export function saveRegistry(
  packages: KapiPackageEntry[],
  registryPath: string = DEFAULT_REGISTRY_PATH
): void {
  const dir = resolve(registryPath, "..");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const data = {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    totalPackages: packages.length,
    packages,
  };

  writeFileSync(registryPath, JSON.stringify(data, null, 2) + "\n");
}

/**
 * List all packages in the registry, optionally filtered.
 */
export function listPackages(
  query?: KapiPackageQuery,
  registryPath?: string
): { packages: KapiPackageEntry[]; total: number } {
  let all = loadRegistry(registryPath);

  // Apply filters
  if (query?.type) {
    all = all.filter((p) => p.manifest.type === query.type);
  }

  if (query?.search) {
    const term = query.search.toLowerCase();
    all = all.filter(
      (p) =>
        p.manifest.name.toLowerCase().includes(term) ||
        p.manifest.label.toLowerCase().includes(term) ||
        p.manifest.description.toLowerCase().includes(term) ||
        (p.manifest.keywords || []).some((k) => k.toLowerCase().includes(term))
    );
  }

  if (query?.tags && query.tags.length > 0) {
    all = all.filter((p) =>
      query.tags!.some((tag) => (p.manifest.keywords || []).includes(tag))
    );
  }

  // Sort
  const sortField = query?.sort || "name";
  const order = query?.order || "asc";

  all.sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "downloads":
        cmp = a.registry.downloads - b.registry.downloads;
        break;
      case "rating":
        cmp = a.registry.rating - b.registry.rating;
        break;
      case "updated":
        cmp = a.registry.updatedAt.localeCompare(b.registry.updatedAt);
        break;
      case "created":
        cmp = a.registry.createdAt.localeCompare(b.registry.createdAt);
        break;
      case "name":
      default:
        cmp = a.manifest.name.localeCompare(b.manifest.name);
        break;
    }
    return order === "asc" ? cmp : -cmp;
  });

  const total = all.length;

  // Paginate
  if (query?.limit && query.limit > 0) {
    const offset = query?.offset || 0;
    all = all.slice(offset, offset + query.limit);
  }

  return { packages: all, total };
}

/**
 * Find a single package by name.
 */
export function findPackage(
  name: string,
  registryPath?: string
): KapiPackageEntry | undefined {
  const all = loadRegistry(registryPath);
  return all.find(
    (p) =>
      p.manifest.name === name ||
      p.manifest.name.replace(/^kapilabs-/, "") === name
  );
}

/**
 * Get packages of a specific type.
 */
export function getPackagesByType(
  type: KapiPackageType,
  registryPath?: string
): KapiPackageEntry[] {
  return listPackages({ type }, registryPath).packages;
}

/**
 * List available package types with counts.
 */
export function getPackageCategories(
  registryPath?: string
): Array<{ type: KapiPackageType; count: number }> {
  const all = loadRegistry(registryPath);
  const counts = new Map<KapiPackageType, number>();

  for (const pkg of all) {
    counts.set(pkg.manifest.type, (counts.get(pkg.manifest.type) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Update package metadata in the registry (increment downloads, update rating, etc.).
 */
export function updatePackageStats(
  name: string,
  updates: Partial<KapiPackageEntry["registry"]>,
  registryPath?: string
): boolean {
  const all = loadRegistry(registryPath);
  const index = all.findIndex(
    (p) =>
      p.manifest.name === name ||
      p.manifest.name.replace(/^kapilabs-/, "") === name
  );

  if (index === -1) return false;

  all[index] = {
    ...all[index],
    registry: {
      ...all[index].registry,
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  };

  saveRegistry(all, registryPath);
  return true;
}

/**
 * Install a package from the registry — copies template/scaffold files.
 * Returns the install result with warnings/errors.
 */
export function installPackage(
  name: string,
  registryPath?: string
): KapiInstallResult {
  const pkg = findPackage(name, registryPath);

  if (!pkg) {
    return {
      success: false,
      packageName: name,
      packageType: "plugin",
      targetPath: "",
      message: `Package "${name}" not found in registry.`,
      errors: [`Package "${name}" not found`],
    };
  }

  const warnings: string[] = [];
  const errors: string[] = [];

  // Determine target directory based on package type
  const type = pkg.manifest.type;
  let targetPath: string;

  switch (type) {
    case "theme":
    case "child-theme":
      targetPath = resolve(process.cwd(), "src", "theme");
      break;
    case "plugin":
      targetPath = resolve(process.cwd(), "plugins", pkg.manifest.name.replace("kapilabs-plugin-", ""));
      break;
    case "section-pack":
      targetPath = resolve(process.cwd(), "src", "theme", "sections");
      break;
    case "widget-pack":
      targetPath = resolve(process.cwd(), "src", "theme", "components", "widgets");
      break;
    case "starter":
      targetPath = resolve(process.cwd(), ".");
      break;
    case "blueprint":
      targetPath = resolve(process.cwd(), "blueprints", pkg.manifest.name);
      break;
    default:
      targetPath = resolve(process.cwd(), "vendor", pkg.manifest.name);
  }

  // Check if target already exists
  if (existsSync(targetPath)) {
    warnings.push(
      `Target path "${targetPath}" already exists. Files may be overwritten.`
    );
  }

  // Create target directory
  try {
    mkdirSync(targetPath, { recursive: true });
  } catch (err) {
    errors.push(`Failed to create target directory: ${err}`);
    return {
      success: false,
      packageName: pkg.manifest.name,
      packageType: type,
      targetPath: "",
      message: `Failed to create directory: ${targetPath}`,
      errors,
    };
  }

  // Increment download count
  updatePackageStats(name, { downloads: pkg.registry.downloads + 1 }, registryPath);

  return {
    success: true,
    packageName: pkg.manifest.name,
    packageType: type,
    targetPath,
    message: `Package "${pkg.manifest.label}" installed to ${targetPath}`,
    warnings: warnings.length > 0 ? warnings : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Format a package entry for display in the CLI.
 */
export function formatPackageEntry(pkg: KapiPackageEntry): string {
  const stars = "★".repeat(Math.round(pkg.registry.rating)) +
    "☆".repeat(5 - Math.round(pkg.registry.rating));
  return [
    `  ${pkg.manifest.label}`,
    `    ${pkg.manifest.description}`,
    `    Type: ${pkg.manifest.type}  |  v${pkg.manifest.version}  |  ${stars}  |  ${pkg.registry.downloads} downloads`,
    `    Keywords: ${(pkg.manifest.keywords || []).join(", ") || "—"}`,
  ].join("\n");
}
