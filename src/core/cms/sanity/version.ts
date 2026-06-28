/**
 * Shared Sanity API version constant.
 *
 * Update this file to change the API version used across all Sanity clients.
 * This replaces the hardcoded "2025-02-19" strings that were duplicated across
 * client.ts, writeClient.ts, and adapterFactory.ts.
 *
 * The env var PUBLIC_SANITY_API_VERSION takes precedence over this default.
 */

export const SANITY_API_VERSION = "2025-02-19";
