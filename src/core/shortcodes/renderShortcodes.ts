import { renderRegisteredShortcode } from "./registry";
import { resolveShortcodeData } from "./resolver";

/**
 * Synchronous shortcode renderer (legacy).
 * Renders shortcodes to placeholder HTML synchronously.
 */
export function renderShortcodes(content = "") {
  return content.replace(/\[([a-zA-Z0-9_]+)([^\]]*)\]/g, (_, name, attrs) => {
    return renderRegisteredShortcode(name, attrs);
  });
}

/**
 * Async shortcode renderer.
 * Resolves shortcodes that need CMS data at SSR time.
 * Falls back to synchronous rendering for simple shortcodes.
 */
export async function renderShortcodesAsync(content = "") {
  const shortcodeRegex = /\[([a-zA-Z0-9_]+)([^\]]*)\]/g;
  let result = "";
  let lastIndex = 0;
  let match;

  while ((match = shortcodeRegex.exec(content)) !== null) {
    // Add text before this shortcode
    result += content.slice(lastIndex, match.index);

    const [fullMatch, name, attrs] = match;
    const parsed = parseAttrs(attrs);

    // Try async resolution first
    const resolved = await resolveShortcodeData(name, parsed);

    if (resolved !== null) {
      result += resolved;
    } else {
      // Fall back to synchronous registered handler
      result += renderRegisteredShortcode(name, attrs);
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text after last shortcode
  result += content.slice(lastIndex);

  return result;
}

function parseAttrs(input = "") {
  const attrs: Record<string, string> = {};

  input.replace(/(\w+)="([^"]*)"/g, (_, key, value) => {
    attrs[key] = value;
    return "";
  });

  return attrs;
}

