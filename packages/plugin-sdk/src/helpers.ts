/**
 * Helper utilities for plugin authors.
 */

/**
 * Escape HTML special characters in a string.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Parse shortcode attributes from a raw attribute string.
 * Example: `name="hello" limit="3"` → `{ name: "hello", limit: "3" }`
 */
export function parseAttrs(input = ""): Record<string, string> {
  const attrs: Record<string, string> = {};
  input.replace(/(\w+)="([^"]*)"/g, (_, key: string, value: string) => {
    attrs[key] = value;
    return "";
  });
  return attrs;
}

/**
 * Build a CSS style string from an object.
 */
export function css(obj: Record<string, string | undefined>): string {
  return Object.entries(obj)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
}

/**
 * Build a CSS class list, filtering out falsy values.
 */
export function clsx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Create a simple HTML tag helper.
 */
export function tag(name: string, attrs: Record<string, string> = {}, content = ""): string {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
    .join("");
  return `<${name}${attrStr}>${content}</${name}>`;
}
