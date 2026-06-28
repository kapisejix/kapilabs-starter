import type { PluginManifest, KapiPlugin } from "./types";

/**
 * Validate a plugin manifest schema.
 */
export function validateManifest(manifest: PluginManifest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!manifest.name) errors.push("Missing required field: name");
  if (!manifest.version) errors.push("Missing required field: version");
  if (!manifest.kapilabs) errors.push("Missing required field: kapilabs (compatible version)");

  if (manifest.name && !/^[a-z0-9_-]+$/.test(manifest.name)) {
    errors.push("Plugin name must be lowercase alphanumeric, hyphens, or underscores only");
  }

  if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    errors.push("Version must be semver format (e.g. 1.0.0)");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a KapiPlugin object at build time.
 */
export function validatePlugin(plugin: KapiPlugin): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!plugin.name) errors.push("Missing required field: name");
  if (!plugin.version) errors.push("Missing required field: version");
  if (typeof plugin.register !== "function") errors.push("Plugin must have a register() function");

  return { valid: errors.length === 0, errors };
}
