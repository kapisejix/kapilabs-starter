import { defineField, defineType } from "sanity";

export const formType = defineType({
  name: "form",
  title: "Forms",
  type: "document",
  groups: [
    { name: "setup", title: "Setup", default: true },
    { name: "fields", title: "Fields" },
    { name: "actions", title: "Submit Actions" },
  ],
  fields: [
    // ── Setup ──
    defineField({
      name: "title",
      title: "Form Title",
      type: "string",
      group: "setup",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "formType",
      title: "Form Type",
      type: "string",
      group: "setup",
      options: {
        list: [
          { title: "Contact Form", value: "contact" },
          { title: "Lead Form", value: "lead" },
          { title: "Newsletter Form", value: "newsletter" },
          { title: "Booking / Appointment", value: "booking" },
          { title: "Registration", value: "registration" },
          { title: "Survey / Feedback", value: "survey" },
          { title: "Quote Request", value: "quote" },
          { title: "Custom Form", value: "custom" },
        ],
      },
      initialValue: "contact",
    }),
    defineField({
      name: "submitLabel",
      title: "Submit Button Label",
      type: "string",
      group: "setup",
      initialValue: "Send Message",
    }),
    defineField({
      name: "successMessage",
      title: "Success Message",
      type: "text",
      rows: 2,
      group: "setup",
      initialValue: "Thank you. Your message has been sent.",
    }),
    defineField({
      name: "redirectUrl",
      title: "Redirect URL After Submit",
      type: "string",
      group: "setup",
      description: "Optional. Redirect to this path or URL after successful submission instead of showing success message.",
    }),

    // ── Fields ──
    defineField({
      name: "fields",
      title: "Form Fields",
      type: "array",
      group: "fields",
      of: [
        {
          type: "object",
          preview: {
            select: { title: "label", subtitle: "type" },
            prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
              return { title: title || "(untitled)", subtitle: subtitle || "text" };
            },
          },
          groups: [
            { name: "main", title: "Field", default: true },
            { name: "advanced", title: "Advanced" },
          ],
          fields: [
            defineField({ name: "label", title: "Label", type: "string", group: "main" }),
            defineField({
              name: "name",
              title: "Field Name (key)",
              type: "string",
              group: "main",
              description: "Unique machine-readable key. No spaces. e.g. first_name",
            }),
            defineField({
              name: "type",
              title: "Field Type",
              type: "string",
              group: "main",
              options: {
                list: [
                  // Text
                  { title: "Text", value: "text" },
                  { title: "Email", value: "email" },
                  { title: "Phone / Tel", value: "tel" },
                  { title: "Number", value: "number" },
                  { title: "URL", value: "url" },
                  { title: "Password", value: "password" },
                  // Multi-line
                  { title: "Textarea (multi-line)", value: "textarea" },
                  // Choice
                  { title: "Select (dropdown)", value: "select" },
                  { title: "Radio Buttons", value: "radio" },
                  { title: "Checkbox (single agree)", value: "checkbox" },
                  { title: "Checkbox Group (multi-select)", value: "checkbox-group" },
                  // Date / Time
                  { title: "Date", value: "date" },
                  { title: "Time", value: "time" },
                  { title: "Date & Time", value: "datetime-local" },
                  // File
                  { title: "File Upload", value: "file" },
                  // Other
                  { title: "Range Slider", value: "range" },
                  { title: "Color Picker", value: "color" },
                  { title: "Star Rating (1–5)", value: "rating" },
                  { title: "Hidden (not shown to user)", value: "hidden" },
                  // Layout
                  { title: "Section Heading / Divider", value: "heading" },
                ],
              },
              initialValue: "text",
            }),
            defineField({
              name: "placeholder",
              title: "Placeholder Text",
              type: "string",
              group: "main",
            }),
            defineField({
              name: "helpText",
              title: "Help Text",
              type: "string",
              group: "main",
              description: "Small hint shown below the field to guide the user.",
            }),
            defineField({
              name: "required",
              title: "Required Field",
              type: "boolean",
              group: "main",
              initialValue: false,
            }),
            defineField({
              name: "width",
              title: "Field Width",
              type: "string",
              group: "main",
              description: "Column width in multi-column form layouts.",
              options: {
                list: [
                  { title: "Full width", value: "full" },
                  { title: "Half (1/2)", value: "half" },
                  { title: "Third (1/3)", value: "third" },
                  { title: "Two thirds (2/3)", value: "two-thirds" },
                  { title: "Quarter (1/4)", value: "quarter" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              initialValue: "full",
            }),
            // Options for select / radio / checkbox-group
            defineField({
              name: "options",
              title: "Options",
              type: "array",
              group: "main",
              description: "Add choices for select, radio, or checkbox-group fields.",
              of: [
                {
                  type: "object",
                  preview: {
                    select: { title: "label", subtitle: "value" },
                  },
                  fields: [
                    defineField({ name: "label", title: "Label (shown to user)", type: "string" }),
                    defineField({ name: "value", title: "Value (submitted)", type: "string" }),
                  ],
                },
              ],
            }),

            // ── Advanced ──
            defineField({
              name: "defaultValue",
              title: "Default / Hidden Value",
              type: "string",
              group: "advanced",
              description: "Pre-filled value. For hidden fields this is the static value submitted with the form.",
            }),
            defineField({
              name: "rows",
              title: "Textarea Rows",
              type: "number",
              group: "advanced",
              description: "Visible row height. Applies to Textarea only.",
              initialValue: 4,
            }),
            defineField({
              name: "min",
              title: "Min Value",
              type: "string",
              group: "advanced",
              description: "Minimum value. Applies to number, range, date, time.",
            }),
            defineField({
              name: "max",
              title: "Max Value",
              type: "string",
              group: "advanced",
              description: "Maximum value. Applies to number, range, date, time.",
            }),
            defineField({
              name: "step",
              title: "Step",
              type: "string",
              group: "advanced",
              description: "Increment step. Applies to number and range fields.",
            }),
            defineField({
              name: "accept",
              title: "Accepted File Types",
              type: "string",
              group: "advanced",
              description: "Comma-separated MIME types or extensions. e.g. image/*,.pdf,.docx — File Upload only.",
            }),
            defineField({
              name: "multiple",
              title: "Allow Multiple Files",
              type: "boolean",
              group: "advanced",
              description: "Allow uploading more than one file. File Upload only.",
              initialValue: false,
            }),
            defineField({
              name: "maxFileSize",
              title: "Max File Size (MB)",
              type: "number",
              group: "advanced",
              description: "Maximum allowed file size in megabytes. File Upload only.",
            }),
            defineField({
              name: "autocomplete",
              title: "Autocomplete Hint",
              type: "string",
              group: "advanced",
              description: "HTML autocomplete attribute. e.g. name, email, tel, street-address",
            }),
            defineField({
              name: "pattern",
              title: "Validation Pattern (regex)",
              type: "string",
              group: "advanced",
              description: "HTML pattern attribute. e.g. [A-Za-z]{3,}",
            }),
            defineField({
              name: "cssClass",
              title: "CSS Class",
              type: "string",
              group: "advanced",
              description: "Extra CSS class added to this field wrapper for custom styling.",
            }),
          ],
        },
      ],
      initialValue: [
        { label: "Name", name: "name", type: "text", required: true, width: "full" },
        { label: "Email", name: "email", type: "email", required: true, width: "half" },
        { label: "Phone", name: "phone", type: "tel", required: false, width: "half" },
        { label: "Company", name: "company", type: "text", required: false, width: "full" },
        { label: "Subject", name: "subject", type: "text", required: false, width: "full" },
        { label: "Message", name: "message", type: "textarea", required: true, rows: 5, width: "full" },
      ],
    }),

    // ── Submit Actions ──
    defineField({
      name: "emailTo",
      title: "Notification Email Address",
      type: "string",
      group: "actions",
      description: "Send submission notification to this address. Falls back to FORM_EMAIL_TO env variable.",
    }),
    defineField({
      name: "emailSubject",
      title: "Notification Email Subject",
      type: "string",
      group: "actions",
      description: "Email subject line. Leave blank for auto-generated.",
    }),
    defineField({
      name: "webhookUrl",
      title: "Webhook URL",
      type: "url",
      group: "actions",
      description: "POST submission JSON to this URL on every successful submit.",
    }),
    defineField({
      name: "storeSubmissions",
      title: "Store Submissions in CMS",
      type: "boolean",
      group: "actions",
      description: "Save each submission as a Form Submission document viewable in Sanity Studio.",
      initialValue: true,
    }),
  ],
});
