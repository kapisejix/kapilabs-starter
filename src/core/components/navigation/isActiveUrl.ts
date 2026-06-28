export function isActiveUrl(currentPath: string, itemUrl: string) {
  if (!itemUrl || itemUrl === "#") return false;

  const normalize = (url: string) =>
    url.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/";

  const current = normalize(currentPath);
  const target = normalize(itemUrl);

  if (target === "/") return current === "/";

  return current === target || current.startsWith(`${target}/`);
}
