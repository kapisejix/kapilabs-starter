import type { SectionQuery, CmsAdapter, CmsPost, CmsTeamMember } from "@kapi/cms/types";

/**
 * Resolve a SectionQuery against a CMS adapter and return the matching content items.
 * This allows sections to dynamically fetch content based on configurable queries.
 */
export async function resolveQuery(
  query: SectionQuery,
  adapter: CmsAdapter
): Promise<(CmsPost | CmsTeamMember)[]> {
  const { contentType, filter, orderBy, limit = 10 } = query;

  switch (contentType) {
    case "post": {
      const posts = await adapter.getPosts();

      let filtered = posts;

      // Apply filters
      if (filter?.category) {
        filtered = filtered.filter(
          (p) => p.categories?.includes(filter.category!)
        );
      }
      if (filter?.tag) {
        filtered = filtered.filter((p) => p.tags?.includes(filter.tag!));
      }
      if (filter?.author) {
        filtered = filtered.filter((p) => p.author?.slug === filter.author);
      }
      if (filter?.manual && filter.manual.length > 0) {
        filtered = filtered.filter((p) => filter.manual!.includes(p.slug));
      }

      // Apply ordering
      if (orderBy === "date") {
        filtered.sort(
          (a, b) =>
            new Date(b.publishedAt || 0).getTime() -
            new Date(a.publishedAt || 0).getTime()
        );
      } else if (orderBy === "random") {
        filtered = filtered.sort(() => Math.random() - 0.5);
      } else if (orderBy === "manual" && filter?.manual) {
        const order = filter.manual;
        filtered.sort(
          (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug)
        );
      }

      return filtered.slice(0, limit);
    }

    case "team": {
      const members = await adapter.getTeamMembers();
      let filtered = members;

      if (filter?.manual && filter.manual.length > 0) {
        filtered = filtered.filter((m) => filter.manual!.includes(m.slug));
      }

      if (orderBy === "random") {
        filtered = filtered.sort(() => Math.random() - 0.5);
      }

      return filtered.slice(0, limit);
    }

    case "testimonial":
    case "service":
    case "caseStudy":
      // These content types not yet implemented as adapter methods.
      // When added to CmsAdapter, update this switch accordingly.
      return [];

    default:
      return [];
  }
}

/**
 * Translate a SectionQuery to a GROQ filter string for Sanity.
 */
export function queryToGroq(query: SectionQuery): string {
  const { contentType, filter, orderBy, limit = 10 } = query;

  let groq = `*[_type == "${contentType}"`;

  const conditions: string[] = [];

  if (filter?.category) {
    conditions.push(`"${filter.category}" in categories[]`);
  }
  if (filter?.tag) {
    conditions.push(`"${filter.tag}" in tags[]`);
  }
  if (filter?.author) {
    conditions.push(`author->slug.current == "${filter.author}"`);
  }
  if (filter?.manual && filter.manual.length > 0) {
    const slugs = filter.manual.map((s) => `"${s}"`).join(", ");
    conditions.push(`slug.current in [${slugs}]`);
  }

  if (conditions.length > 0) {
    groq += ` && ${conditions.join(" && ")}`;
  }

  groq += "]";

  switch (orderBy) {
    case "date":
      groq += " | order(publishedAt desc)";
      break;
    case "popularity":
      groq += " | order(popularity desc)";
      break;
    case "random":
      groq += " | order(random())";
      break;
    default:
      break;
  }

  groq += `[0...${limit}]`;

  return groq;
}
