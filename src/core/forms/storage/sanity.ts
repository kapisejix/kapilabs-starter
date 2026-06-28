import { sanityWriteClient } from "@kapi/cms/sanity/writeClient";
import { sanityClient } from "@kapi/cms/sanity/client";
import type {
  FormStorageAdapter,
  FormSubmission,
  FormSubmissionFilters,
} from "./types";

function valuesToObject(
  values: Record<string, unknown> | Array<{ key: string; value: string }> | undefined | null
): Record<string, unknown> {
  if (!values) return {};
  if (Array.isArray(values)) {
    const obj: Record<string, unknown> = {};
    for (const item of values) {
      if (item && typeof item === "object" && "key" in item) {
        obj[item.key] = item.value;
      }
    }
    return obj;
  }
  return values as Record<string, unknown>;
}

function valuesToArray(
  values: Record<string, unknown> | undefined | null
): Array<{ _key: string; key: string; value: string }> {
  if (!values) return [];
  return Object.entries(values).map(([key, value]) => ({
    _key: key,
    key,
    value: String(value ?? ""),
  }));
}

export const sanityFormStorageAdapter: FormStorageAdapter = {
  async saveSubmission(submission: FormSubmission) {
    await sanityWriteClient.create({
      _type: "formSubmission",
      _id: `formSubmission-${submission.id}`,
      formId: submission.formId,
      formTitle: submission.formTitle,
      emailTo: submission.emailTo,
      pageUrl: submission.pageUrl,
      values: valuesToArray(submission.values),
      submittedAt: submission.createdAt,
    });

    return submission;
  },

  async listSubmissions(filters?: FormSubmissionFilters) {
    let query = `*[_type == "formSubmission"]`;
    const params: Record<string, string> = {};

    if (filters?.form) {
      query = `*[_type == "formSubmission" && formTitle match $form + "*"]`;
      params.form = filters.form;
    }

    query += ` | order(submittedAt desc){ "id": _id, formId, formTitle, emailTo, pageUrl, values, "createdAt": submittedAt }`;

    const results = await sanityClient.fetch(query, params);

    const all: FormSubmission[] = (results || []).map((r: any) => ({
      id: (r.id || "").replace("formSubmission-", ""),
      formId: r.formId || "",
      formTitle: r.formTitle || "",
      emailTo: r.emailTo,
      pageUrl: r.pageUrl,
      values: valuesToObject(r.values),
      createdAt: r.createdAt || "",
    }));

    if (filters?.search) {
      const term = filters.search.toLowerCase();
      return all.filter((s) => JSON.stringify(s).toLowerCase().includes(term));
    }

    return all;
  },
};
