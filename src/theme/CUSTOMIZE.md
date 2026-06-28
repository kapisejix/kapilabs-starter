# Theme Customization Guide

Override any `src/core/` file by creating the same relative path under `src/theme/`.

The `@kapi/` resolver checks `src/theme/` first, then falls back to `src/core/`.
Your overrides survive framework updates — `src/core/` is replaced; `src/theme/` is never touched.

## How to override

```bash
# Copy the file you want to edit
cp src/core/components/Header.astro src/theme/components/Header.astro

# Edit your copy
# The resolver now serves src/theme/components/Header.astro automatically
```

---

## All overridable files

### Components

| Copy from | Copy to | Purpose |
|-----------|---------|---------|
| `src/core/components/Header.astro` | `src/theme/components/Header.astro` | Site header, logo, nav |
| `src/core/components/Footer.astro` | `src/theme/components/Footer.astro` | Site footer |
| `src/core/components/TopBar.astro` | `src/theme/components/TopBar.astro` | Above-header announcement bar area |
| `src/core/components/AnnouncementBar.astro` | `src/theme/components/AnnouncementBar.astro` | Announcement bar content |
| `src/core/components/Sidebar.astro` | `src/theme/components/Sidebar.astro` | Generic sidebar |
| `src/core/components/PrimarySidebar.astro` | `src/theme/components/PrimarySidebar.astro` | Primary sidebar (blog, pages) |
| `src/core/components/SecondarySidebar.astro` | `src/theme/components/SecondarySidebar.astro` | Secondary sidebar |
| `src/core/components/WidgetArea.astro` | `src/theme/components/WidgetArea.astro` | Widget area renderer |
| `src/core/components/PostCard.astro` | `src/theme/components/PostCard.astro` | Blog post card in listings |
| `src/core/components/AuthorBox.astro` | `src/theme/components/AuthorBox.astro` | Author bio box on posts |
| `src/core/components/RelatedContent.astro` | `src/theme/components/RelatedContent.astro` | Related posts/pages block |
| `src/core/components/CmsImage.astro` | `src/theme/components/CmsImage.astro` | CMS image wrapper |

### Navigation

| Copy from | Copy to | Purpose |
|-----------|---------|---------|
| `src/core/components/navigation/DesktopMenu.astro` | `src/theme/components/navigation/DesktopMenu.astro` | Desktop nav menu |
| `src/core/components/navigation/MobileMenu.astro` | `src/theme/components/navigation/MobileMenu.astro` | Mobile hamburger menu |
| `src/core/components/navigation/MenuItem.astro` | `src/theme/components/navigation/MenuItem.astro` | Single nav menu item |
| `src/core/components/navigation/Breadcrumbs.astro` | `src/theme/components/navigation/Breadcrumbs.astro` | Breadcrumb trail |

### Content Components

| Copy from | Copy to | Purpose |
|-----------|---------|---------|
| `src/core/components/content/ContentBody.astro` | `src/theme/components/content/ContentBody.astro` | Rich content body wrapper |
| `src/core/components/content/RichContent.astro` | `src/theme/components/content/RichContent.astro` | Portable text / rich content renderer |
| `src/core/components/content/CmsImage.astro` | `src/theme/components/content/CmsImage.astro` | CMS image inside content |

### Layouts

| Copy from | Copy to | Purpose |
|-----------|---------|---------|
| `src/core/layouts/BaseLayout.astro` | `src/theme/layouts/BaseLayout.astro` | HTML shell (`<html>`, `<head>`, `<body>`) |
| `src/core/layouts/SiteLayout.astro` | `src/theme/layouts/SiteLayout.astro` | Full site layout (header + footer + SEO) |
| `src/core/layouts/KapiLayout.astro` | `src/theme/layouts/KapiLayout.astro` | Main layout wrapper |
| `src/core/layouts/ContentSidebarLayout.astro` | `src/theme/layouts/ContentSidebarLayout.astro` | Two-column content + sidebar |
| `src/core/layouts/FullWidthLayout.astro` | `src/theme/layouts/FullWidthLayout.astro` | Full-width no sidebar |
| `src/core/layouts/LandingLayout.astro` | `src/theme/layouts/LandingLayout.astro` | Landing page (no header/footer) |

### Page Templates

| Copy from | Copy to | Purpose |
|-----------|---------|---------|
| `src/core/page-templates/DefaultPage.astro` | `src/theme/page-templates/DefaultPage.astro` | Standard CMS page |
| `src/core/page-templates/LandingPage.astro` | `src/theme/page-templates/LandingPage.astro` | Landing page with sections |
| `src/core/page-templates/SimplePage.astro` | `src/theme/page-templates/SimplePage.astro` | Minimal page, no sidebar |
| `src/core/page-templates/resolvePageTemplate.ts` | `src/theme/page-templates/resolvePageTemplate.ts` | Add custom template types |

### Blog Templates

| Copy from | Copy to | Purpose |
|-----------|---------|---------|
| `src/core/blog-templates/BlogArchive.astro` | `src/theme/blog-templates/BlogArchive.astro` | Blog listing page |
| `src/core/blog-templates/BlogSingle.astro` | `src/theme/blog-templates/BlogSingle.astro` | Single blog post |

### Page Builder Sections

| Copy from | Copy to | Purpose |
|-----------|---------|---------|
| `src/core/sections/HeroSection.astro` | `src/theme/sections/HeroSection.astro` | Hero / banner section |
| `src/core/sections/ContentSection.astro` | `src/theme/sections/ContentSection.astro` | Rich text content section |
| `src/core/sections/CTASection.astro` | `src/theme/sections/CTASection.astro` | Call-to-action section |
| `src/core/sections/ServicesSection.astro` | `src/theme/sections/ServicesSection.astro` | Services grid |
| `src/core/sections/TestimonialsSection.astro` | `src/theme/sections/TestimonialsSection.astro` | Testimonials / reviews |
| `src/core/sections/FAQSection.astro` | `src/theme/sections/FAQSection.astro` | FAQ accordion |
| `src/core/sections/StatsSection.astro` | `src/theme/sections/StatsSection.astro` | Stats / numbers block |
| `src/core/sections/TeamSection.astro` | `src/theme/sections/TeamSection.astro` | Team members grid |
| `src/core/sections/BlogPreviewSection.astro` | `src/theme/sections/BlogPreviewSection.astro` | Latest posts preview |
| `src/core/sections/FormSection.astro` | `src/theme/sections/FormSection.astro` | Embedded form section |
| `src/core/sections/ContactSection.astro` | `src/theme/sections/ContactSection.astro` | Contact details section |
| `src/core/sections/HtmlSection.astro` | `src/theme/sections/HtmlSection.astro` | Raw HTML embed section |
| `src/core/sections/PageBanner.astro` | `src/theme/sections/PageBanner.astro` | Page title banner |
| `src/core/sections/PageSections.astro` | `src/theme/sections/PageSections.astro` | Section renderer (maps type → component) |

### SEO

| Copy from | Copy to | Purpose |
|-----------|---------|---------|
| `src/core/seo/SeoHead.astro` | `src/theme/seo/SeoHead.astro` | `<head>` meta tags, OG, Twitter |
| *(removed — see SeoHead.astro instead)* | *—* | SEO data builder (removed; use SeoHead.astro) |
| `src/core/seo/schema.ts` | `src/theme/seo/schema.ts` | JSON-LD structured data |

### Theme & Styles

| Copy from | Copy to | Purpose |
|-----------|---------|---------|
| `src/core/styles/global.css` | `src/theme/styles/global.css` | Global CSS (most common override) |
| `src/core/theme/ThemeVariables.astro` | `src/theme/theme/ThemeVariables.astro` | CSS custom properties (colors, fonts, spacing) |
| `src/core/theme/CustomCode.astro` | `src/theme/theme/CustomCode.astro` | Global custom CSS/JS injection |
| `src/core/theme/defaultThemeSettings.ts` | `src/theme/theme/defaultThemeSettings.ts` | Default theme config values |
| `src/core/theme/themeSettings.ts` | `src/theme/theme/themeSettings.ts` | Theme settings fetcher |
| `src/core/theme/headerFooterSettings.ts` | `src/theme/theme/headerFooterSettings.ts` | Header/footer config |
| `src/core/theme/widgetAreas.ts` | `src/theme/theme/widgetAreas.ts` | Register/modify widget areas |

### Forms

| Copy from | Copy to | Purpose |
|-----------|---------|---------|
| `src/core/forms/FormRenderer.astro` | `src/theme/forms/FormRenderer.astro` | Form HTML renderer |
| `src/core/forms/FormField.astro` | `src/theme/forms/FormField.astro` | Individual form field |
| `src/core/forms/storage/index.ts` | `src/theme/forms/storage/index.ts` | Storage backend selector |
| `src/core/forms/storage/json.ts` | `src/theme/forms/storage/json.ts` | JSON file storage |
| `src/core/forms/storage/sanity.ts` | `src/theme/forms/storage/sanity.ts` | Sanity storage adapter |

### Shortcodes

| Copy from | Copy to | Purpose |
|-----------|---------|---------|
| `src/core/shortcodes/registry.ts` | `src/theme/shortcodes/registry.ts` | Add custom shortcodes |
| `src/core/shortcodes/renderShortcodes.ts` | `src/theme/shortcodes/renderShortcodes.ts` | Shortcode render engine |

---

## Most common overrides

```bash
# Styles (start here)
cp src/core/styles/global.css src/theme/styles/global.css
cp src/core/theme/ThemeVariables.astro src/theme/theme/ThemeVariables.astro

# Header & footer
cp src/core/components/Header.astro src/theme/components/Header.astro
cp src/core/components/Footer.astro src/theme/components/Footer.astro

# Blog
cp src/core/blog-templates/BlogSingle.astro src/theme/blog-templates/BlogSingle.astro
cp src/core/blog-templates/BlogArchive.astro src/theme/blog-templates/BlogArchive.astro

# Page builder sections
cp src/core/sections/HeroSection.astro src/theme/sections/HeroSection.astro
```

---

## Windows (PowerShell)

```powershell
Copy-Item src\core\components\Header.astro src\theme\components\Header.astro -Force
Copy-Item src\core\styles\global.css src\theme\styles\global.css -Force
```

Create subfolder first if needed:

```powershell
New-Item -ItemType Directory -Force src\theme\components\navigation
Copy-Item src\core\components\navigation\DesktopMenu.astro src\theme\components\navigation\DesktopMenu.astro
```
