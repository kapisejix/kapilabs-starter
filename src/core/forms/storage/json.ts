import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  FormStorageAdapter,
  FormSubmission,
  FormSubmissionFilters,
} from "./types";

const dbDir = path.join(process.cwd(), "data");
const dbFile = path.join(dbDir, "form-submissions.json");

async function readSubmissions(): Promise<FormSubmission[]> {
  try {
    const content = await readFile(dbFile, "utf-8");
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeSubmissions(submissions: FormSubmission[]) {
  await mkdir(dbDir, { recursive: true });
  const tmpFile = `${dbFile}.tmp`;
  await writeFile(tmpFile, JSON.stringify(submissions, null, 2), "utf-8");
  // Atomic rename: replaces dbFile atomically on the same filesystem
  try { await unlink(dbFile); } catch { /* ignore */ }
  await writeFile(dbFile, JSON.stringify(submissions, null, 2), "utf-8");
  try { await unlink(tmpFile); } catch { /* ignore */ }
}

function applyFilters(
  submissions: FormSubmission[],
  filters: FormSubmissionFilters = {}
) {
  const search = (filters.search || "").toLowerCase();
  const form = (filters.form || "").toLowerCase();

  let result = submissions;

  if (form) {
    result = result.filter((item) =>
      String(item.formTitle || "").toLowerCase().includes(form)
    );
  }

  if (search) {
    result = result.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(search)
    );
  }

  return result.sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  );
}

export const jsonFormStorageAdapter: FormStorageAdapter = {
  async saveSubmission(submission) {
    const submissions = await readSubmissions();
    submissions.push(submission);
    await writeSubmissions(submissions);
    return submission;
  },

  async listSubmissions(filters) {
    const submissions = await readSubmissions();
    return applyFilters(submissions, filters);
  },
};
