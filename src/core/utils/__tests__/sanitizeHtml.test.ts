import { describe, it, expect } from "vitest";
import { sanitizeContent, sanitizeEmbed } from "../sanitizeHtml";

describe("sanitizeContent", () => {
  it("strips <script> tags", () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeContent(input)).toBe("<p>Hello</p>");
  });

  it("strips inline event handlers", () => {
    const input = '<a href="#" onclick="alert(1)">click</a>';
    expect(sanitizeContent(input)).toBe('<a href="#">click</a>');
  });

  it("strips javascript: URLs", () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    expect(sanitizeContent(input)).toBe("<a>click</a>");
  });

  it("strips <iframe> in content mode", () => {
    const input = '<p>Text</p><iframe src="https://example.com"></iframe>';
    expect(sanitizeContent(input)).toBe("<p>Text</p>");
  });

  it("strips <video> in content mode", () => {
    const input = '<p>Text</p><video src="movie.mp4"></video>';
    expect(sanitizeContent(input)).toBe("<p>Text</p>");
  });

  it("preserves safe HTML tags", () => {
    const input = "<h1>Title</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em>.</p><ul><li>Item</li></ul>";
    const result = sanitizeContent(input);
    expect(result).toContain("<h1>");
    expect(result).toContain("<strong>");
    expect(result).toContain("<em>");
    expect(result).toContain("<ul>");
    expect(result).toContain("<li>");
  });

  it("preserves safe attributes on <a> tags", () => {
    const input = '<a href="https://example.com" title="Example" target="_blank" rel="noopener">link</a>';
    expect(sanitizeContent(input)).toContain('href="https://example.com"');
    expect(sanitizeContent(input)).toContain('target="_blank"');
    expect(sanitizeContent(input)).toContain('rel="noopener"');
  });

  it("preserves <img> with safe attributes", () => {
    const input = '<img src="https://example.com/photo.jpg" alt="A photo" width="800" height="600" loading="lazy">';
    const result = sanitizeContent(input);
    expect(result).toContain('src="https://example.com/photo.jpg"');
    expect(result).toContain('alt="A photo"');
  });

  it("allows safe schemes: http, https, mailto, tel", () => {
    const input = '<a href="mailto:test@example.com">email</a><a href="tel:+12345">phone</a>';
    const result = sanitizeContent(input);
    expect(result).toContain('href="mailto:test@example.com"');
    expect(result).toContain('href="tel:+12345"');
  });

  it("strips ftp: and data: URLs", () => {
    const input = '<a href="ftp://files.example.com">file</a><a href="data:text/html,base64">data</a>';
    // sanitize-html strips disallowed schemes entirely
    const result = sanitizeContent(input);
    expect(result).not.toContain("ftp://");
    expect(result).not.toContain("data:");
  });

  it("returns empty string for null input", () => {
    expect(sanitizeContent(null)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(sanitizeContent(undefined)).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeContent("")).toBe("");
  });

  it("strips <style> tags", () => {
    const input = '<p>Hello</p><style>.xss{color:red}</style>';
    // style is not in the allowedTags list, so it gets discarded
    expect(sanitizeContent(input)).toBe("<p>Hello</p>");
  });

  it("preserves inline CSS styles for allowed properties", () => {
    const input = '<p style="color: red; text-align: center;">Styled</p>';
    const result = sanitizeContent(input);
    // sanitize-html normalizes to "color:red" (no space after colon)
    expect(result).toContain("color:red");
    // sanitize-html normalizes CSS (no space after colon)
    expect(result).toContain("text-align:center");
  });

  it("strips disallowed style properties", () => {
    const input = '<p style="position: absolute; background-image: url(javascript:alert(1))">Hack</p>';
    const result = sanitizeContent(input);
    expect(result).not.toContain("position");
  });
});

describe("sanitizeEmbed", () => {
  it("preserves <iframe> tags", () => {
    const input = '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="315" allowfullscreen></iframe>';
    const result = sanitizeEmbed(input);
    expect(result).toContain("<iframe");
    expect(result).toContain("allowfullscreen");
  });

  it("preserves <video> tags", () => {
    const input = '<video src="movie.mp4" controls width="640"></video>';
    const result = sanitizeEmbed(input);
    expect(result).toContain("<video");
    expect(result).toContain("controls");
  });

  it("preserves <audio> tags", () => {
    const input = '<audio src="podcast.mp3" controls></audio>';
    const result = sanitizeEmbed(input);
    expect(result).toContain("<audio");
  });

  it("strips <script> tags even in embed mode", () => {
    const input = '<iframe src="https://example.com"></iframe><script>alert("xss")</script>';
    expect(sanitizeEmbed(input)).not.toContain("<script>");
  });

  it("strips event handlers in embed mode", () => {
    const input = '<iframe src="https://example.com" onload="alert(1)"></iframe>';
    const result = sanitizeEmbed(input);
    expect(result).toContain("<iframe");
    expect(result).not.toContain("onload");
  });

  it("allows safe embed attributes", () => {
    const input = '<iframe src="https://maps.google.com" width="100%" height="400" frameborder="0" allow="geolocation" loading="lazy"></iframe>';
    const result = sanitizeEmbed(input);
    expect(result).toContain('src="https://maps.google.com"');
    expect(result).toContain('width="100%"');
    expect(result).toContain('allow="geolocation"');
  });

  it("strips javascript: URLs in embed mode", () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    expect(sanitizeEmbed(input)).toBe("<a>click</a>");
  });

  it("returns empty string for null input", () => {
    expect(sanitizeEmbed(null)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(sanitizeEmbed(undefined)).toBe("");
  });
});
