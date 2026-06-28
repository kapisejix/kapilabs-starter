/**
 * Marketplace Foundation — Package manifest schema and types.
 *
 * Defines the KapiPackage manifest format (kapilabs-package.json)
 * and all related types for the marketplace ecosystem.
 */

/**
 * Package types available in the marketplace.
 */
export type KapiPackageType =
  | "theme"
  | "child-theme"
  | "plugin"
  | "section-pack"
  | "widget-pack"
  | "blueprint"
  | "starter";

/**
 * Package visibility / access level.
 */
export type KapiPackageAccess = "public" | "private" | "unlisted";

/**
 * Package install source.
 */
export type KapiInstallSource = "registry" | "url" | "local" | "npm";

/**
 * KapiPackage manifest schema (kapilabs-package.json).
 */
export type KapiPackageManifest = {
  /** Unique package identifier (e.g. "kapilabs-theme-business") */
  name: string;

  /** Human-readable label */
  label: string;

  /** Package type */
  type: KapiPackageType;

  /** Semver version string */
  version: string;

  /** Description of what this package provides */
  description: string;

  /** Package author */
  author?: string;

  /** Package homepage URL */
  homepage?: string;

  /** Repository URL */
  repository?: string;

  /** License identifier (e.g. "MIT", "GPL-3.0") */
  license?: string;

  /** Compatible KapiLabs version range (e.g. ">=2.0.0") */
  kapilabs: string;

  /** Package dependencies (name → version range) */
  dependencies?: Record<string, string>;

  /** Tags / keywords for search */
  keywords?: string[];

  /** Screenshot URLs (for themes) */
  screenshots?: string[];

  /** Icon URL */
  icon?: string;

  /** Minimum required Astro version */
  astro?: string;

  /** CMS compatibility */
  cms?: ("sanity" | "emdash" | "wordpress" | "contentful")[];
};

/**
 * Full package entry stored in the registry, including metadata
 * that is not part of the manifest.
 */
export type KapiPackageEntry = {
  /** The package manifest */
  manifest: KapiPackageManifest;

  /** Registry-managed fields */
  registry: {
    /** Unique registry ID */
    id: string;
    /** When this package was first added */
    createdAt: string;
    /** When this package was last updated */
    updatedAt: string;
    /** Download count */
    downloads: number;
    /** Rating (0-5) */
    rating: number;
    /** Package access level */
    access: KapiPackageAccess;
    /** Download URL for the package archive */
    downloadUrl?: string;
    /** Package size in bytes */
    size?: number;
    /** Checksum (SHA-256) for integrity verification */
    checksum?: string;
    /** Compatible KapiLabs versions */
    verifiedOn?: string[];
  };
};

/**
 * Package query filters for listing/searching.
 */
export type KapiPackageQuery = {
  type?: KapiPackageType;
  search?: string;
  tags?: string[];
  sort?: "name" | "downloads" | "rating" | "updated" | "created";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

/**
 * Local registry configuration.
 */
export type KapiRegistryConfig = {
  /** Path to the local registry JSON file */
  registryPath: string;
  /** Whether to check for updates on startup */
  checkUpdates: boolean;
  /** Custom registry URLs (for future hosted registries) */
  registries?: string[];
};

/**
 * Install result.
 */
export type KapiInstallResult = {
  success: boolean;
  packageName: string;
  packageType: KapiPackageType;
  targetPath: string;
  message: string;
  warnings?: string[];
  errors?: string[];
};
