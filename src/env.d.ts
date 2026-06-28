/// <reference types="astro/client" />
/// <reference types="@astrojs/cloudflare" />

declare namespace App {
  /**
   * Cloudflare Pages bindings configured in wrangler.toml:
   *   DB     — D1 database (form submissions, structured data)
   *   BUCKET — R2 bucket (images, PDFs, file uploads)
   *   KV     — KV namespace (sessions, cache, feature flags, rate limits)
   */
  interface Env {
    DB: import("@cloudflare/workers-types").D1Database;
    BUCKET: import("@cloudflare/workers-types").R2Bucket;
    KV: import("@cloudflare/workers-types").KVNamespace;
  }

  interface Locals {
    site: import("./core/multisite/types").KapiSiteContext | null;
    runtime: {
      env: Env;
    };
  }
}
