import { ApiError } from "./ApiError.js";

/**
 * Validates `data` against a Zod schema, throwing a 400 ApiError with a flat
 * field->message map when validation fails.
 */
export function parseOrThrow(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "_";
      details[key] = issue.message;
    }
    throw ApiError.badRequest("Validation failed", details);
  }
  return result.data;
}
