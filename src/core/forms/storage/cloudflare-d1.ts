/**
 * Cloudflare D1 form storage adapter.
 *
 * Stores form submissions in a Cloudflare D1 database table.
 * Requires a `form_submissions` table with this schema:
 *
 *   CREATE TABLE IF NOT EXISTS form_submissions (
 *     id        TEXT PRIMARY KEY,
 *     form_id   TEXT NOT NULL,
 *     form_title TEXT NOT NULL DEFAULT '',
 *     email_to  TEXT,
 *     page_url  TEXT,
 *     values_json TEXT NOT NULL DEFAULT '{}',
 *     created_at TEXT NOT NULL
 *   );
 *
 * Usage in Astro API route:
 *
 *   import { setD1Database, cloudflareD1FormStorageAdapter } from "@kapi/forms/storage/cloudflare-d1";
 *   setD1Database(context.locals.runtime.env.DB);
 *   await cloudflareD1FormStorageAdapter.saveSubmission(data);
 */

import type { D1Database } from "@cloudflare/workers-types";
import type {
  FormStorageAdapter,
  FormSubmission,
  FormSubmissionFilters,
} from "./types";

/** Module-level D1 database instance — set from the API route before use. */
let db: D1Database | null = null;

/**
 * Initialize the D1 database binding.
 * Must be called from the request handler before using the adapter.
 */
export function setD1Database(database: D1Database): void {
  db = database;
}

function getDB(): D1Database {
  if (!db) {
    throw new Error(
      "D1 database not initialized. " +
      "Call setD1Database(context.locals.runtime.env.DB) from your API route first."
    );
  }
  return db;
}

function parseValues(json: string | null | undefined): Record<string, unknown> {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function mapRow(row: Record<string, unknown>): FormSubmission {
  return {
    id: String(row.id ?? ""),
    formId: String(row.form_id ?? ""),
    formTitle: String(row.form_title ?? ""),
    emailTo: row.email_to ? String(row.email_to) : undefined,
    pageUrl: row.page_url ? String(row.page_url) : undefined,
    values: parseValues(String(row.values_json ?? "")),
    createdAt: String(row.created_at ?? ""),
  };
}

export const cloudflareD1FormStorageAdapter: FormStorageAdapter = {
  async saveSubmission(submission: FormSubmission): Promise<FormSubmission> {
    const database = getDB();

    await database
      .prepare(
        `INSERT INTO form_submissions (id, form_id, form_title, email_to, page_url, values_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        submission.id,
        submission.formId,
        submission.formTitle,
        submission.emailTo ?? null,
        submission.pageUrl ?? null,
        JSON.stringify(submission.values),
        submission.createdAt,
      )
      .run();

    return submission;
  },

  async listSubmissions(filters?: FormSubmissionFilters): Promise<FormSubmission[]> {
    const database = getDB();

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters?.form) {
      conditions.push("form_title LIKE ?");
      params.push(`%${filters.form}%`);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const { results } = await database
      .prepare(`SELECT * FROM form_submissions ${whereClause} ORDER BY created_at DESC`)
      .bind(...params)
      .all<Record<string, unknown>>();

    let submissions = (results || []).map(mapRow);

    if (filters?.search) {
      const term = filters.search.toLowerCase();
      submissions = submissions.filter((s: FormSubmission) =>
        JSON.stringify(s).toLowerCase().includes(term)
      );
    }

    return submissions;
  },
};
