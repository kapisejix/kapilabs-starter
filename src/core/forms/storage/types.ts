export type FormSubmission = {
  id: string;
  formId: string;
  formTitle: string;
  emailTo?: string;
  pageUrl?: string;
  values: Record<string, unknown>;
  createdAt: string;
};

export type FormSubmissionFilters = {
  search?: string;
  form?: string;
};

export type FormStorageAdapter = {
  saveSubmission: (submission: FormSubmission) => Promise<FormSubmission>;
  listSubmissions: (filters?: FormSubmissionFilters) => Promise<FormSubmission[]>;
};
