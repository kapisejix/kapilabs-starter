/**
 * @kapilabs/plugin-sdk
 *
 * Public API for building KapiLabs plugins.
 *
 * Usage:
 *   import { definePlugin, type KapiPlugin, type PluginContext } from "@kapilabs/plugin-sdk";
 */

export { definePlugin } from "./types";
export type { KapiPlugin, PluginContext, PluginManifest, NormalizedSection, CmsAdapter } from "./types";

export { escapeHtml, parseAttrs, css, clsx, tag } from "./helpers";
export { validateManifest, validatePlugin } from "./validators";
export { PluginError, PluginRegistrationError, PluginDependencyError } from "./errors";
