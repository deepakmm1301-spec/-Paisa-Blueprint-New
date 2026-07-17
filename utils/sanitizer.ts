/**
 * Utility functions for input sanitization and XSS prevention
 */

/**
 * Escapes HTML characters in a string to prevent XSS.
 */
export function sanitizeString(val: string): string {
  if (typeof val !== "string") return val;
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Recursively sanitizes any string properties in an object or array.
 */
export function sanitizeInput<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === "string") {
    return sanitizeString(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item)) as unknown as T;
  }

  if (typeof input === "object") {
    const sanitizedObj: any = {};
    for (const key of Object.keys(input)) {
      sanitizedObj[key] = sanitizeInput((input as any)[key]);
    }
    return sanitizedObj as T;
  }

  return input;
}
