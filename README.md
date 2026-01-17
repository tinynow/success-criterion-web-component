# Success Criterion

A web component for displaying WCAG 2.2 success criteria. No build step required.

## Installation

### CDN

```html
<!-- Minified (recommended for production) -->
<script src="https://unpkg.com/success-criterion/success-criterion.min.js"></script>

<!-- Or readable version -->
<script src="https://unpkg.com/success-criterion"></script>
```

### npm

```bash
npm install success-criterion
```

```js
import 'success-criterion'
```

## Usage

```html
<!-- Detailed view (default) -->
<success-criterion data-number="1.4.3"></success-criterion>

<!-- Simple inline reference -->
<success-criterion data-mode="simple" data-number="1.4.3"></success-criterion>

<!-- Tiny link -->
<success-criterion data-mode="tiny" data-number="1.4.3"></success-criterion>
```

### Attributes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-number` | WCAG SC number (e.g., `1.4.3`) | The success criterion to display |
| `data-mode` | `detailed`, `simple`, `tiny` | Controls how much information is shown |

### Display Modes

- **detailed** (default): Shows title, level, description, special cases, and reference links
- **simple**: Inline link with SC number and title
- **tiny**: Minimal inline link with just the SC number

### Styling

The component inherits `font`, `line-height`, and `color` from its parent. All other values can be customized with CSS custom properties:

```css
success-criterion {
  /* Detailed mode */
  --sc-title-size: 1.125em;
  --sc-level-size: 0.625em;
  --sc-level-padding: 1px 4px;
  --sc-level-radius: 3px;
  --sc-icon-size: 0.75em;
  --sc-spacing: 0.5em;
  --sc-indent: 1em;
  --sc-gap: 1em;

  /* Picker (when no data-number) */
  --sc-select-padding: 0.25em 0.5em;
  --sc-select-radius: 3px;
}
```

## Development

```bash
# Start local server
npm run serve

# Build (fetches latest WCAG data and generates both JS files)
npm run build

# Run tests
npm test
```

## How It Works

WCAG data is fetched from the [official W3C WCAG 2.2 JSON](https://www.w3.org/WAI/WCAG22/wcag.json) and embedded directly in the component. No runtime fetching required.

## License

MIT
