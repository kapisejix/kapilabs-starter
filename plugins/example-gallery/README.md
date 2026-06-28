# Gallery Plugin — Example

A KapiLabs plugin that adds an image gallery section type and `[kapi_gallery]` shortcode.

## Features

- Gallery section with configurable columns and images
- `[kapi_gallery images="url1,url2,url3" columns="3" caption="My Gallery"]` shortcode
- Custom CSS variables for styling (`--gallery-border-radius`, `--gallery-gap`, etc.)

## Installation

1. Already registered in `src/core/plugins/loader.ts` as `kapilabs-plugin-gallery`
2. Enable via env var:
   ```
   PUBLIC_KAPI_PLUGINS=kapilabs-plugin-gallery
   ```

## Usage

### Shortcode

```
[kapi_gallery images="https://example.com/img1.jpg,https://example.com/img2.jpg" columns="3"]
```

### CSS customization

Override gallery CSS variables in your theme:

```css
:root {
  --gallery-border-radius: 1rem;
  --gallery-gap: 1.5rem;
  --gallery-aspect-ratio: 16/9;
}
```
