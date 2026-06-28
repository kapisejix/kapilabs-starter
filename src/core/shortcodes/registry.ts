type ShortcodeHandler = (attrs: Record<string, string>) => string;

function parseAttrs(input = "") {
  const attrs: Record<string, string> = {};

  input.replace(/(\w+)="([^"]*)"/g, (_, key, value) => {
    attrs[key] = value;
    return "";
  });

  return attrs;
}

export const shortcodeRegistry: Record<string, ShortcodeHandler> = {
  kapi_cta(attrs) {
    const id = attrs.id || "default";
    return `<div class="kapi-shortcode kapi-shortcode--cta" data-kapi-shortcode="cta" data-id="${id}">
      <div class="kapi-shortcode-placeholder"><span class="kapi-shortcode-label">CTA Block: ${id}</span></div>
    </div>`;
  },

  kapi_widget(attrs) {
    const area = attrs.area || "sidebar";
    return `<div class="kapi-shortcode kapi-shortcode--widget" data-kapi-shortcode="widget" data-area="${area}">
      <div class="kapi-shortcode-placeholder"><span class="kapi-shortcode-label">Widget Area: ${area}</span></div>
    </div>`;
  },

  kapi_menu(attrs) {
    const name = attrs.name || "main";
    return `<nav class="kapi-shortcode kapi-shortcode--menu" data-kapi-shortcode="menu" data-name="${name}" aria-label="${name}">
      <div class="kapi-shortcode-placeholder"><span class="kapi-shortcode-label">Menu: ${name}</span></div>
    </nav>`;
  },

  kapi_testimonials(attrs) {
    const limit = attrs.limit || "3";
    return `<div class="kapi-shortcode kapi-shortcode--testimonials" data-kapi-shortcode="testimonials" data-limit="${limit}">
      <div class="kapi-shortcode-placeholder"><span class="kapi-shortcode-label">Testimonials (limit: ${limit})</span></div>
    </div>`;
  },

  kapi_services(attrs) {
    const limit = attrs.limit || "6";
    return `<div class="kapi-shortcode kapi-shortcode--services" data-kapi-shortcode="services" data-limit="${limit}">
      <div class="kapi-shortcode-placeholder"><span class="kapi-shortcode-label">Services (limit: ${limit})</span></div>
    </div>`;
  },

  kapi_posts(attrs) {
    const limit = attrs.limit || "3";
    return `<div class="kapi-shortcode kapi-shortcode--posts" data-kapi-shortcode="posts" data-limit="${limit}">
      <div class="kapi-shortcode-placeholder"><span class="kapi-shortcode-label">Recent Posts (limit: ${limit})</span></div>
    </div>`;
  },

  kapi_section(attrs) {
    const key = attrs.key || "default";
    return `<div class="kapi-shortcode kapi-shortcode--section" data-kapi-shortcode="section" data-key="${key}">
      <div class="kapi-shortcode-placeholder"><span class="kapi-shortcode-label">Section: ${key}</span></div>
    </div>`;
  },

  kapi_team(attrs) {
    const limit = attrs.limit || "4";
    return `<div class="kapi-shortcode kapi-shortcode--team" data-kapi-shortcode="team" data-limit="${limit}">
      <div class="kapi-shortcode-placeholder"><span class="kapi-shortcode-label">Team (limit: ${limit})</span></div>
    </div>`;
  },

  kapi_gallery(attrs) {
    const columns = attrs.columns || "3";
    return `<div class="kapi-shortcode kapi-shortcode--gallery" data-kapi-shortcode="gallery" data-columns="${columns}">
      <div class="kapi-shortcode-placeholder"><span class="kapi-shortcode-label">Gallery (${columns} cols)</span></div>
    </div>`;
  },

  kapi_video(_attrs) {
    return `<div class="kapi-shortcode kapi-shortcode--video" data-kapi-shortcode="video">
      <div class="kapi-shortcode-placeholder"><span class="kapi-shortcode-label">Video</span></div>
    </div>`;
  },

  kapi_form(attrs) {
    const id = attrs.id || "form";
    return `<div class="kapi-shortcode kapi-shortcode--form" data-kapi-shortcode="form" data-id="${id}">
      <div class="kapi-shortcode-placeholder"><span class="kapi-shortcode-label">Form: ${id}</span></div>
    </div>`;
  },
};

export function renderRegisteredShortcode(name: string, rawAttrs = "") {
  const handler = shortcodeRegistry[name];

  if (!handler) return "";

  return handler(parseAttrs(rawAttrs));
}
