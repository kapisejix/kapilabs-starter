import { defineField, defineType } from "sanity";

export const formSubmissionType = defineType({
  name: "formSubmission",
  title: "Form Submission",
  type: "document",
  fields: [
    defineField({ name: "formId", title: "Form ID", type: "string" }),
    defineField({ name: "formTitle", title: "Form Title", type: "string" }),
    defineField({ name: "emailTo", title: "Email To", type: "string" }),
    defineField({ name: "pageUrl", title: "Page URL", type: "string" }),
    defineField({
      name: "values",
      title: "Values",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "key", title: "Field", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
          ],
          preview: {
            select: { title: "key", subtitle: "value" },
          },
        },
      ],
    }),
    defineField({ name: "submittedAt", title: "Submitted At", type: "datetime" }),
  ],
  preview: {
    select: { title: "formTitle", subtitle: "submittedAt" },
  },
});
