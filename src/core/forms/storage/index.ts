import { jsonFormStorageAdapter } from "./json";
import { sanityFormStorageAdapter } from "./sanity";
import { cloudflareD1FormStorageAdapter } from "./cloudflare-d1";
import type { FormStorageAdapter } from "./types";

const backend =
  import.meta.env.FORM_STORAGE_BACKEND ||
  process.env.FORM_STORAGE_BACKEND ||
  "json";

const adapters: Record<string, FormStorageAdapter> = {
  json: jsonFormStorageAdapter,
  sanity: sanityFormStorageAdapter,
  "cloudflare-d1": cloudflareD1FormStorageAdapter,
};

export const formStorage = adapters[backend] || jsonFormStorageAdapter;

export type {
  FormStorageAdapter,
  FormSubmission,
  FormSubmissionFilters,
} from "./types";
