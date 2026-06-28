/**
 * Advanced Search — faceted search query builder and response formatter.
 *
 * This module provides the search query construction logic used by CMS
 * adapters to support full faceted search with category/tag/type filtering,
 * date ranges, sorting, and pagination.
 */

import type { CmsSearchFilter, CmsSearchResult } from "../cms/types";

/**
 * Build a GROQ filter expression from a CmsSearchFilter for faceted Sanity queries.
 */
export function buildSearchFilter(
  query: string,
  filter?: CmsSearchFilter
): { primaryFilter: string; countFilter: string; params: Record<string, unknown> } {
  const params: Record<string, unknown> = {};

  // Escape special regex characters and build the search pattern
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const searchPattern = `*${safeQuery}*`;

  // Build the base WHERE clauses
  const whereClauses: string[] = [];

  // Type filter: handled by which query we run, not GROQ WHERE
  // Category filter
  if (filter?.category) {
    whereClauses.push(`$category in categories[]`);
    params.category = filter.category;
  }

  // Tag filter
  if (filter?.tag) {
    whereClauses.push(`$tag in tags[]`);
    params.tag = filter.tag;
  }

  // Date range filter
  if (filter?.dateFrom) {
    whereClauses.push(`publishedAt >= $dateFrom`);
    params.dateFrom = filter.dateFrom;
  }
  if (filter?.dateTo) {
    whereClauses.push(`publishedAt <= $dateTo`);
    params.dateTo = filter.dateTo;
  }

  const where = whereClauses.length > 0 ? ` && ${whereClauses.join(" && ")}` : "";

  return {
    primaryFilter: `title match $searchPattern${where}`,
    countFilter: `title match $searchPattern${where}`,
    params: { ...params, searchPattern },
  };
}

/**
 * Build the sort expression from a CmsSearchFilter sort option.
 */
export function buildSortExpression(sort?: string): string {
  switch (sort) {
    case "date-asc":
      return "publishedAt asc";
    case "date-desc":
      return "publishedAt desc";
    case "title-asc":
      return "title asc";
    case "title-desc":
      return "title desc";
    case "relevance":
    default:
      return "title asc";
  }
}

/**
 * Paginate an array of results.
 */
export function paginateResults<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 20
): { items: T[]; total: number; page: number; pageSize: number } {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const sliced = items.slice(start, start + pageSize);

  return { items: sliced, total, page, pageSize };
}

/**
 * Extract facets from a flat list of search results with their metadata.
 */
export function extractFacets(
  _results: CmsSearchResult[],
  typeCounts: Record<string, number>,
  categoryCounts: Record<string, number>,
  tagCounts: Record<string, number>,
  dateCounts: { label: string; from?: string; to?: string; count: number }[]
) {
  return {
    types: Object.entries(typeCounts).map(([name, count]) => ({ name, count })),
    categories: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
    tags: Object.entries(tagCounts).map(([name, count]) => ({ name, count })),
    dateRanges: dateCounts,
  };
}
