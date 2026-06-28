import {
  getPosts,
  getTeamMembers,
  getGlobalSections,
  getForms,
} from "@kapi/cms";

export type ShortcodeDataResult = string | null;

/**
 * Shortcode data resolver.
 * Maps shortcode names + attributes to real rendered HTML with CMS data.
 * Returns null if the shortcode should fall back to the sync handler.
 */
export async function resolveShortcodeData(
  name: string,
  attrs: Record<string, string>
): Promise<ShortcodeDataResult> {
  switch (name) {
    case "kapi_posts":
      return resolvePostsShortcode(attrs);
    case "kapi_team":
      return resolveTeamShortcode(attrs);
    case "kapi_testimonials":
      return resolveTestimonialsShortcode(attrs);
    case "kapi_services":
      return resolveServicesShortcode(attrs);
    case "kapi_cta":
      return resolveCtaShortcode(attrs);
    case "kapi_section":
      return resolveSectionShortcode(attrs);
    case "kapi_gallery":
      return resolveGalleryShortcode(attrs);
    case "kapi_video":
      return resolveVideoShortcode(attrs);
    case "kapi_form":
      return resolveFormShortcode(attrs);
    default:
      return null; // Fall back to sync handler
  }
}

/**
 * Resolve [kapi_posts limit="3" layout="grid" columns="3"]
 */
async function resolvePostsShortcode(
  attrs: Record<string, string>
): Promise<string> {
  const limit = parseInt(attrs.limit || "3", 10);
  const layout = attrs.layout || "grid";
  const cols = attrs.columns || "3";
  const posts = (await getPosts()).slice(0, limit);

  if (posts.length === 0)
    return '<div class="kapi-shortcode-empty">No posts found.</div>';

  let html = '<div class="kapi-shortcode-posts">';

  if (layout === "list") {
    html += '<ul class="kapi-post-list">';
    for (const post of posts) {
      html += `<li><a href="/blog/${post.slug}">${escapeHtml(post.title)}</a></li>`;
    }
    html += "</ul>";
  } else {
    html += `<div class="kapi-post-grid" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:1.5rem;">`;
    for (const post of posts) {
      html += `<article class="kapi-post-card" style="border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;">`;
      if (post.featuredImage && typeof post.featuredImage !== "string") {
        html += `<img src="${escapeHtml(post.featuredImage.src)}" alt="${escapeHtml(post.featuredImage.alt || post.title)}" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:0.5rem;margin-bottom:1rem;" loading="lazy" />`;
      }
      html += `<h3 style="margin:0 0 0.5rem;"><a href="/blog/${post.slug}">${escapeHtml(post.title)}</a></h3>`;
      if (post.excerpt) {
        html += `<p style="color:#6b7280;margin:0;">${escapeHtml(post.excerpt.substring(0, 150))}</p>`;
      }
      html += "</article>";
    }
    html += "</div>";
  }

  html += "</div>";
  return html;
}

/**
 * Resolve [kapi_team limit="4"]
 */
async function resolveTeamShortcode(
  attrs: Record<string, string>
): Promise<string> {
  const limit = parseInt(attrs.limit || "4", 10);
  const members = (await getTeamMembers()).slice(0, limit);

  if (members.length === 0)
    return '<div class="kapi-shortcode-empty">No team members found.</div>';

  let html =
    '<div class="kapi-shortcode-team" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1.5rem;">';
  for (const member of members) {
    html += '<div class="kapi-team-card" style="border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;text-align:center;">';
    if (member.photo && typeof member.photo !== "string") {
      html += `<img src="${escapeHtml(member.photo.src)}" alt="${escapeHtml(member.photo.alt || member.name)}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin:0 auto 1rem;" loading="lazy" />`;
    }
    html += `<h3 style="margin:0 0 0.25rem;">${escapeHtml(member.name)}</h3>`;
    if (member.role)
      html += `<p style="color:#6b7280;margin:0;">${escapeHtml(member.role)}</p>`;
    html += "</div>";
  }
  html += "</div>";
  return html;
}

/**
 * Resolve [kapi_testimonials limit="3"]
 */
async function resolveTestimonialsShortcode(
  attrs: Record<string, string>
): Promise<string> {
  const limit = parseInt(attrs.limit || "3", 10);
  const sections = await getGlobalSections();
  const testimonialSections = sections.filter(
    (s) => s.sectionType === "testimonials"
  );

  if (testimonialSections.length === 0)
    return '<div class="kapi-shortcode-empty">No testimonials found.</div>';

  const items = Array.isArray(testimonialSections[0]?.content?.items)
    ? testimonialSections[0].content.items.slice(0, limit)
    : [];

  if (items.length === 0)
    return '<div class="kapi-shortcode-empty">No testimonial items found.</div>';

  let html =
    '<div class="kapi-shortcode-testimonials" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem;">';
  for (const item of items) {
    html += '<figure style="border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;margin:0;">';
    if (item.quote)
      html += `<blockquote style="margin:0 0 1rem;font-style:italic;">${item.quote}</blockquote>`;
    html += "<figcaption>";
    if (item.name) html += `<strong>${escapeHtml(item.name)}</strong>`;
    if (item.role) html += `<span style="color:#6b7280;display:block;">${escapeHtml(item.role)}</span>`;
    html += "</figcaption></figure>";
  }
  html += "</div>";
  return html;
}

/**
 * Resolve [kapi_services limit="6"]
 */
async function resolveServicesShortcode(
  attrs: Record<string, string>
): Promise<string> {
  const limit = parseInt(attrs.limit || "6", 10);
  const sections = await getGlobalSections();
  const serviceSections = sections.filter(
    (s) => s.sectionType === "services"
  );

  if (serviceSections.length === 0)
    return '<div class="kapi-shortcode-empty">No services found.</div>';

  const items = Array.isArray(serviceSections[0]?.content?.items)
    ? serviceSections[0].content.items.slice(0, limit)
    : [];

  if (items.length === 0)
    return '<div class="kapi-shortcode-empty">No service items found.</div>';

  let html =
    '<div class="kapi-shortcode-services" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;">';
  for (const item of items) {
    html += '<div style="border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;">';
    if (item.title) html += `<h3 style="margin:0 0 0.5rem;">${escapeHtml(item.title)}</h3>`;
    if (item.text) html += `<p style="color:#6b7280;margin:0 0 1rem;">${item.text}</p>`;
    if (item.url)
      html += `<a href="${escapeHtml(item.url)}" style="font-weight:700;">Learn more</a>`;
    html += "</div>";
  }
  html += "</div>";
  return html;
}

/**
 * Resolve [kapi_cta id="contact"]
 */
async function resolveCtaShortcode(
  attrs: Record<string, string>
): Promise<string> {
  const label = attrs.label || "Get in touch";
  const url = attrs.url || "/contact";

  return `<div class="kapi-shortcode-cta" style="text-align:center;padding:2rem;background:#f9fafb;border-radius:1rem;">
    <p style="margin:0 0 1rem;font-size:1.25rem;">${escapeHtml(label)}</p>
    <a href="${escapeHtml(url)}" style="display:inline-block;background:#111827;color:#fff;padding:0.75rem 1.5rem;border-radius:999px;text-decoration:none;font-weight:700;">${escapeHtml(label)}</a>
  </div>`;
}

/**
 * Resolve [kapi_section key="hero-about"]
 */
async function resolveSectionShortcode(
  attrs: Record<string, string>
): Promise<string> {
  const key = attrs.key || "";
  if (!key)
    return '<div class="kapi-shortcode-error">Missing section key.</div>';

  const sections = await getGlobalSections();
  const section = sections.find((s) => s.key === key);

  if (!section)
    return `<div class="kapi-shortcode-error">Section "${escapeHtml(key)}" not found.</div>`;

  // For now, render a placeholder with the section title
  // Full section rendering would require direct Astro component invocation
  return `<div class="kapi-shortcode-section" data-section-key="${escapeHtml(key)}">
    <div style="border:2px dashed #e5e7eb;border-radius:0.75rem;padding:2rem;text-align:center;color:#6b7280;">
      <strong>Section: ${escapeHtml(section.title)}</strong><br/>
      <span>Type: ${escapeHtml(section.sectionType)}</span>
    </div>
  </div>`;
}

/**
 * Resolve [kapi_gallery images="img1,img2,img3" columns="3"]
 */
async function resolveGalleryShortcode(
  attrs: Record<string, string>
): Promise<string> {
  const images = (attrs.images || "").split(",").map((s) => s.trim()).filter(Boolean);
  const columns = attrs.columns || "3";

  if (images.length === 0)
    return '<div class="kapi-shortcode-empty">No images provided.</div>';

  let html = `<div class="kapi-shortcode-gallery" style="display:grid;grid-template-columns:repeat(${columns},1fr);gap:1rem;">`;
  for (const img of images) {
    html += `<div style="overflow:hidden;border-radius:0.5rem;"><img src="${escapeHtml(img)}" alt="" style="width:100%;height:200px;object-fit:cover;" loading="lazy" /></div>`;
  }
  html += "</div>";
  return html;
}

/**
 * Resolve [kapi_video url="https://youtube.com/watch?v=..." title="..."]
 */
async function resolveVideoShortcode(
  attrs: Record<string, string>
): Promise<string> {
  const url = attrs.url || "";
  const title = attrs.title || "Video";

  if (!url) return '<div class="kapi-shortcode-error">Missing video URL.</div>';

  let embedUrl = url;

  // Convert YouTube watch URLs to embed URLs
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (youtubeMatch) {
    embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Convert Vimeo URLs
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return `<div class="kapi-shortcode-video" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:0.75rem;">
    <iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(title)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen loading="lazy"></iframe>
  </div>`;
}

/**
 * Resolve [kapi_form id="contact-form"]
 */
async function resolveFormShortcode(
  attrs: Record<string, string>
): Promise<string> {
  const id = attrs.id || "";
  if (!id)
    return '<div class="kapi-shortcode-error">Missing form id.</div>';

  const forms = await getForms();
  const form = forms.find((f) => f.id === id);

  if (!form)
    return `<div class="kapi-shortcode-error">Form "${escapeHtml(id)}" not found.</div>`;

  let html = `<form class="kapi-shortcode-form" action="/api/forms/submit" method="POST" style="display:grid;gap:1rem;max-width:600px;">`;
  html += `<input type="hidden" name="formId" value="${escapeHtml(form.id || id)}" />`;

  if (form.fields) {
    for (const field of form.fields) {
      html += `<label style="display:grid;gap:0.25rem;">
        <span>${escapeHtml(field.label)}${field.required ? ' <span style="color:red;">*</span>' : ""}</span>`;

      if (field.type === "textarea") {
        html += `<textarea name="${escapeHtml(field.name)}" placeholder="${escapeHtml(field.placeholder || "")}" ${field.required ? "required" : ""} style="padding:0.5rem;border:1px solid #e5e7eb;border-radius:0.375rem;"></textarea>`;
      } else if (field.type === "select" && field.options) {
        html += `<select name="${escapeHtml(field.name)}" style="padding:0.5rem;border:1px solid #e5e7eb;border-radius:0.375rem;">
          ${field.options.map((opt: string) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join("")}
        </select>`;
      } else {
        html += `<input type="${escapeHtml(field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text")}" name="${escapeHtml(field.name)}" placeholder="${escapeHtml(field.placeholder || "")}" ${field.required ? "required" : ""} style="padding:0.5rem;border:1px solid #e5e7eb;border-radius:0.375rem;" />`;
      }

      html += "</label>";
    }
  }

  html += `<button type="submit" style="background:#111827;color:#fff;border:none;padding:0.75rem 1.5rem;border-radius:0.375rem;font-weight:700;cursor:pointer;">Submit</button>`;
  html += "</form>";

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
