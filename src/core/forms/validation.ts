/**
 * Form Input Validation — Zod schemas for validating form submissions.
 *
 * Each form field type has a corresponding schema.
 * The fields array from the CMS form definition drives which schema is used.
 */

import { z } from "zod";

/**
 * Schema for a single form field value.
 */
const fieldValueSchema = z.string().max(10000, "Field value too large").optional().default("");

/**
 * Schema for a checkbox field.
 */
const checkboxSchema = z.enum(["yes", "on", ""]).optional().default("");

/**
 * Schema for an email field.
 */
const emailSchema = z
  .string()
  .max(500, "Email too long")
  .email("Invalid email address")
  .optional()
  .or(z.literal(""));

/**
 * Schema for a phone/tel field.
 */
const phoneSchema = z
  .string()
  .max(30, "Phone number too long")
  .regex(/^[\d\s\-+()]*$/, "Invalid phone number format")
  .optional()
  .or(z.literal(""));

/**
 * Schema for a number field.
 */
const numberSchema = z
  .string()
  .max(20, "Number too long")
  .regex(/^-?\d*\.?\d*$/, "Must be a valid number")
  .optional()
  .or(z.literal(""));

/**
 * Schema for a URL field.
 */
const urlSchema = z
  .string()
  .max(2000, "URL too long")
  .url("Invalid URL")
  .optional()
  .or(z.literal(""));

/**
 * Schema for a textarea field (long text).
 */
const textareaSchema = z
  .string()
  .max(50000, "Field value too large")
  .optional()
  .default("");

/**
 * Get the Zod schema for a given field type.
 */
export function getFieldSchema(
  type: string,
  required?: boolean,
  options?: string[]
): z.ZodType<any> {
  let schema: z.ZodType<any>;

  switch (type) {
    case "email":
      schema = emailSchema;
      break;
    case "tel":
    case "phone":
      schema = phoneSchema;
      break;
    case "number":
      schema = numberSchema;
      break;
    case "url":
      schema = urlSchema;
      break;
    case "textarea":
      schema = textareaSchema;
      break;
    case "checkbox":
      schema = checkboxSchema;
      break;
    case "select":
      if (options && options.length > 0) {
        schema = z.enum(options as [string, ...string[]]).or(z.literal(""));
      } else {
        schema = fieldValueSchema;
      }
      break;
    default:
      schema = fieldValueSchema;
  }

  if (required) {
    // For required fields, ensure at least some value
    if (type === "checkbox") {
      return schema.refine((v) => v === "yes" || v === "on", {
        message: "This field is required",
      });
    }
    return schema.refine((v) => v && v.trim().length > 0, {
      message: "This field is required",
    });
  }

  return schema;
}

/**
 * Form submission payload schema.
 */
export const formSubmissionSchema = z.object({
  formId: z.string().min(1, "Form ID is required").max(200),
  formTitle: z.string().max(500).optional().default(""),
  emailTo: z.string().email("Invalid email").max(500).optional().or(z.literal("")),
  values: z.record(z.unknown()),
  pageUrl: z.string().max(2000).optional().or(z.literal("")),

  csrfToken: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export type FormSubmissionPayload = z.infer<typeof formSubmissionSchema>;

/**
 * Validate a form's field values against their CMS-defined schemas.
 * Returns validated values (which are always strings) and/or errors.
 */
export function validateFieldValues(
  values: Record<string, unknown>,
  fields?: Array<{
    name: string;
    type: string;
    required?: boolean;
    options?: string[];
  }>
): { data: Record<string, string>; errors: Record<string, string> } {
  const data: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const [key, rawValue] of Object.entries(values)) {
    // Skip internal fields
    if (key.startsWith("kapi_") || key === "formId" || key === "formTitle" || key === "emailTo" || key === "pageUrl" || key === "csrfToken" || key === "turnstileToken") {
      data[key] = String(rawValue ?? "");
      continue;
    }

    const fieldDef = fields?.find((f) => f.name === key);
    const fieldType = fieldDef?.type || "text";
    const required = fieldDef?.required || false;

    const fieldSchema = getFieldSchema(fieldType, required, fieldDef?.options);
    const result = fieldSchema.safeParse(rawValue);

    if (result.success) {
      data[key] = result.data;
    } else {
      errors[key] = result.error.errors[0]?.message || "Invalid value";
      // Still include the value to avoid data loss
      data[key] = String(rawValue ?? "");
    }
  }

  return { data, errors };
}

/**
 * Sanitize a string value — strip dangerous content.
 */
export function sanitizeValue(value: string): string {
  return value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")  // Strip script tags
    .replace(/<[^>]*on\w+\s*=[^>]*>/gi, "")             // Strip event handlers
    .replace(/javascript\s*:/gi, "blocked:")             // Block javascript: URLs
    .trim();
}

/**
 * Recursively sanitize all string values in an object.
 */
export function sanitizeValues(
  values: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    result[key] = sanitizeValue(value);
  }
  return result;
}
