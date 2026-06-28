import type { NormalizedPost } from "@kapi/cms";

export function getAllCategories(posts: NormalizedPost[]) {
  return Array.from(
    new Set(posts.flatMap((post) => post.categories || []))
  ).sort();
}

export function getAllTags(posts: NormalizedPost[]) {
  return Array.from(
    new Set(posts.flatMap((post) => post.tags || []))
  ).sort();
}
