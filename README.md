# Success Criterion

A web component for displaying WCAG 2.2 success criteria. No build step required.

## Installation

### CDN

```html
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

## Development

```bash
# Start local server
npm run serve

# Update WCAG data (when WCAG spec updates)
npm run update-data
```

## How It Works

WCAG data from [tenon-io/wcag-as-json](https://github.com/tenon-io/wcag-as-json) is embedded directly in `success-criterion.js`. No runtime fetching required.

## License

MIT
