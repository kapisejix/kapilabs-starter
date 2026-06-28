import sanitizeHtml from "sanitize-html";

/**
 * For CMS rich content and page content fields.
 * Allows all common editorial HTML. Strips scripts, event handlers, JS URLs.
 */
const CONTENT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "strong", "b", "em", "i", "u", "s", "del", "ins", "mark", "small", "sub", "sup",
    "a", "img",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
    "figure", "figcaption",
    "div", "span", "section", "article", "aside", "header", "footer", "main", "nav",
    "details", "summary",
    "abbr", "cite", "time", "address",
  ],
  allowedAttributes: {
    "*": ["class", "id", "style"],
    "a": ["href", "title", "target", "rel", "aria-label"],
    "img": ["src", "alt", "title", "width", "height", "loading", "decoding"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan", "scope"],
    "time": ["datetime"],
    "abbr": ["title"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  disallowedTagsMode: "discard",
  allowedStyles: {
    "*": {
      "color": [/.*/],
      "background-color": [/.*/],
      "text-align": [/^(left|right|center|justify)$/],
      "font-weight": [/.*/],
      "font-style": [/^(normal|italic)$/],
      "text-decoration": [/.*/],
    },
  },
};

/**
 * For raw HTML embed blocks (HtmlSection).
 * Permits iframes for YouTube/maps/embeds but still strips scripts and events.
 */
const EMBED_OPTIONS: sanitizeHtml.IOptions = {
  ...CONTENT_OPTIONS,
  allowedTags: [
    ...(CONTENT_OPTIONS.allowedTags as string[]),
    "iframe", "video", "audio", "source", "track",
  ],
  allowedAttributes: {
    ...CONTENT_OPTIONS.allowedAttributes,
    "iframe": ["src", "width", "height", "frameborder", "allowfullscreen", "allow", "loading", "title"],
    "video": ["src", "controls", "width", "height", "poster", "preload", "autoplay", "muted", "loop"],
    "audio": ["src", "controls", "preload"],
    "source": ["src", "type"],
    "track": ["src", "kind", "srclang", "label"],
  },
  allowedSchemes: ["http", "https"],
};

export function sanitizeContent(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, CONTENT_OPTIONS);
}

export function sanitizeEmbed(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, EMBED_OPTIONS);
}
