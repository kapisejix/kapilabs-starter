import imageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "./client";
import type { CmsImage, CmsImageVariant, CmsImageVariantConfig } from "../types";
import type { RawSanityImage } from "./raw-types";

const builder = imageUrlBuilder(sanityClient);

/**
 * Pre-defined variant configurations for common image use cases.
 */
export const IMAGE_VARIANTS: Record<CmsImageVariant, CmsImageVariantConfig> = {
  thumbnail: { width: 150, height: 150, fit: "crop" },
  medium: { width: 400, height: 300, fit: "max" },
  large: { width: 800, height: 600, fit: "max" },
  hero: { width: 1920, height: 800, fit: "crop" },
  og: { width: 1200, height: 630, fit: "crop" },
  twitter: { width: 800, height: 418, fit: "crop" },
  square: { width: 400, height: 400, fit: "crop" },
};

export function mapSanityImage(
  image: RawSanityImage | undefined | null,
  fallbackAlt = ""
): CmsImage | null {
  if (!image?.asset) return null;

  const dimensions = image.asset?.metadata?.dimensions;

  return {
    src: builder.image(image).auto("format").fit("max").url(),
    alt: image.alt || fallbackAlt || "",
    width: dimensions?.width,
    height: dimensions?.height,
    caption: image.caption || "",
    credit: image.credit || "",
    photographer: image.photographer || "",
    copyright: image.copyright || "",
    title: image.title || "",
    description: image.description || "",
    focalPoint: image.hotspot
      ? {
          x: image.hotspot.x,
          y: image.hotspot.y,
        }
      : undefined,
    lqip: image.asset?.metadata?.lqip || "",
  };
}

/**
 * Get a variant URL for a Sanity image.
 */
export function getImageVariantUrl(
  image: RawSanityImage,
  variant: CmsImageVariant | CmsImageVariantConfig,
  format?: "webp" | "avif"
): string {
  const config = typeof variant === "string" ? IMAGE_VARIANTS[variant] : variant;
  const url = builder
    .image(image)
    .width(config.width)
    .height(config.height)
    .fit(config.fit);

  if (format) {
    url.format(format as Parameters<typeof url.format>[0]);
  } else {
    url.auto("format");
  }

  return url.url();
}

/**
 * Get both WebP and AVIF URLs for a Sanity image variant.
 */
export function getImageVariantUrls(
  image: RawSanityImage,
  variant: CmsImageVariant | CmsImageVariantConfig
): { fallback: string; webp?: string; avif?: string } {
  return {
    fallback: getImageVariantUrl(image, variant),
    webp: getImageVariantUrl(image, variant, "webp"),
    avif: getImageVariantUrl(image, variant, "avif"),
  };
}

/**
 * Build a blur data URL from lqip.
 */
export function getBlurDataUrl(lqip?: string): string | undefined {
  if (!lqip) return undefined;
  if (lqip.startsWith("data:")) return lqip;
  return `data:image/jpeg;base64,${lqip}`;
}
