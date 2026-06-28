/**
 * Parse a Cookie header string into a key-value map.
 * Handles multiple cookies, trimmed keys/values, and values containing "=".
 */
export function parseCookies(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  header.split(";").forEach((pair) => {
    const [key, ...rest] = pair.trim().split("=");
    if (key) {
      result[key.trim()] = rest.join("=").trim();
    }
  });
  return result;
}
