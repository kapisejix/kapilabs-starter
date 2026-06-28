import type { CmsPost, CmsSiteSettings } from "@kapi/cms/types";

export function createWebsiteSchema(settings: CmsSiteSettings, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteTitle,
    description: settings.tagline || "",
    url,
  };
}

export function createOrganizationSchema(settings: CmsSiteSettings, url: string) {
  const logo =
    typeof settings.logo === "string" ? settings.logo : settings.logo?.src || "";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteTitle,
    url,
    logo: logo || undefined,
    email: settings.email || undefined,
    telephone: settings.phone || undefined,
    address: settings.address || undefined,
  };
}

export function createArticleSchema(post: CmsPost, url: string, siteName: string) {
  const image =
    typeof post.seo?.image === "string"
      ? post.seo.image
      : post.seo?.image?.src ||
        (typeof post.featuredImage === "string" ? post.featuredImage : post.featuredImage?.src);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || "",
    image: image || undefined,
    datePublished: post.publishedAt || undefined,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
          url: post.author.slug ? `/team/${post.author.slug}` : undefined,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: siteName,
    },
    mainEntityOfPage: url,
  };
}

export function createBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── Extended Schema Types ────────────────────────────────────────────

export function createFaqSchema(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function createHowToSchema(config: {
  name: string;
  description?: string;
  image?: string;
  steps: { name?: string; text: string; image?: string }[];
  totalTime?: string;
  estimatedCost?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: config.name,
    description: config.description,
    image: config.image || undefined,
    totalTime: config.totalTime || undefined,
    estimatedCost: config.estimatedCost || undefined,
    step: config.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name || `Step ${i + 1}`,
      text: step.text,
      image: step.image || undefined,
    })),
  };
}

export function createPersonSchema(config: {
  name: string;
  givenName?: string;
  familyName?: string;
  jobTitle?: string;
  description?: string;
  image?: string;
  url?: string;
  email?: string;
  telephone?: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: config.name,
    givenName: config.givenName || undefined,
    familyName: config.familyName || undefined,
    jobTitle: config.jobTitle || undefined,
    description: config.description || undefined,
    image: config.image || undefined,
    url: config.url || undefined,
    email: config.email || undefined,
    telephone: config.telephone || undefined,
    sameAs: config.sameAs || undefined,
  };
}

export function createServiceSchema(config: {
  name: string;
  description?: string;
  image?: string;
  url?: string;
  providerName?: string;
  category?: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
    description?: string;
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: config.name,
    description: config.description || undefined,
    image: config.image || undefined,
    url: config.url || undefined,
    provider: {
      "@type": "Organization",
      name: config.providerName || undefined,
    },
    category: config.category || undefined,
    offers: config.offers
      ? {
          "@type": "Offer",
          price: config.offers.price || undefined,
          priceCurrency: config.offers.priceCurrency || "USD",
          description: config.offers.description || undefined,
        }
      : undefined,
  };
}

export function createEventSchema(config: {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  locationName?: string;
  locationAddress?: string;
  image?: string;
  url?: string;
  offers?: {
    url?: string;
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
  organizerName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: config.name,
    description: config.description || undefined,
    startDate: config.startDate,
    endDate: config.endDate || undefined,
    image: config.image || undefined,
    url: config.url || undefined,
    location: config.locationName
      ? {
          "@type": "Place",
          name: config.locationName,
          address: config.locationAddress || undefined,
        }
      : undefined,
    offers: config.offers
      ? {
          "@type": "Offer",
          url: config.offers.url || undefined,
          price: config.offers.price || undefined,
          priceCurrency: config.offers.priceCurrency || "USD",
          availability: config.offers.availability || "https://schema.org/InStock",
        }
      : undefined,
    organizer: config.organizerName
      ? {
          "@type": "Organization",
          name: config.organizerName,
        }
      : undefined,
  };
}

export function createLocalBusinessSchema(config: {
  name: string;
  description?: string;
  image?: string;
  url?: string;
  telephone?: string;
  email?: string;
  address?: string;
  priceRange?: string;
  openingHours?: string[];
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: config.name,
    description: config.description || undefined,
    image: config.image || undefined,
    url: config.url || undefined,
    telephone: config.telephone || undefined,
    email: config.email || undefined,
    address: config.address
      ? {
          "@type": "PostalAddress",
          streetAddress: config.address,
        }
      : undefined,
    priceRange: config.priceRange || undefined,
    openingHoursSpecification: config.openingHours?.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      description: hours,
    })),
    sameAs: config.sameAs || undefined,
  };
}
