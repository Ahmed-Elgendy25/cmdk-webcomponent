# Theming

All colors, spacing, and sizing in cmdk-wc are controlled via CSS custom properties. This guide covers how to customize every aspect of the palette's appearance.

## How It Works

Every visual aspect of the palette is driven by CSS custom properties set on the `cmdk-palette` element itself. Change a property, and the palette updates instantly. Dark mode is automatic via `prefers-color-scheme: dark`, but you can override it manually.

This includes all UI elements such as:

- Input field and search area
- Item list and groups
- **Keyboard shortcuts footer** (displays available keyboard shortcuts with visual indicators)
- Hover states and selections
- Focus indicators

## Scoping a Theme to One Instance

To theme a specific palette instance, set custom properties on that element only:

```css
#my-palette {
  --cmdk-accent: #8b5cf6;
  --cmdk-accent-hover: #7c3aed;
  --cmdk-bg: #1e1b4b;
  --cmdk-text: #f3e8ff;
}
```

Then in HTML:

```html
<cmdk-palette id="my-palette"></cmdk-palette>
```

## Global Theme

To apply a theme to all palette instances on the page, set custom properties on `:root`:

```css
:root {
  --cmdk-accent: #8b5cf6;
  --cmdk-accent-hover: #7c3aed;
  --cmdk-bg: #1e1b4b;
  --cmdk-text: #f3e8ff;
}
```

## Built-in Dark Mode

The palette automatically detects `prefers-color-scheme: dark` and adjusts colors accordingly. The default dark mode colors are:

```css
@media (prefers-color-scheme: dark) {
  cmdk-palette {
    --cmdk-accent: #60a5fa;
    --cmdk-accent-hover: #3b82f6;
    --cmdk-text: #f1f5f9;
    --cmdk-muted: #94a3b8;
    --cmdk-border: #334155;
    --cmdk-surface: #1e293b;
    --cmdk-bg: #0f172a;
    --cmdk-overlay: rgba(0, 0, 0, 0.6);
  }
}
```

To force dark mode manually, set the color-scheme property:

```css
cmdk-palette {
  color-scheme: dark;
}
```

Or override the custom properties directly:

```css
cmdk-palette {
  --cmdk-bg: #0f172a;
  --cmdk-text: #f1f5f9;
  --cmdk-accent: #60a5fa;
}
```

## CSS Custom Properties Reference

| Property                 | Default (Light)   | Default (Dark)    | Description                                                    |
| ------------------------ | ----------------- | ----------------- | -------------------------------------------------------------- |
| `--cmdk-accent`          | `#3b82f6`         | `#60a5fa`         | Primary accent color for buttons, selected items, focus states |
| `--cmdk-accent-hover`    | `#2563eb`         | `#3b82f6`         | Accent color on hover                                          |
| `--cmdk-text`            | `#0f172a`         | `#f1f5f9`         | Primary text color                                             |
| `--cmdk-muted`           | `#64748b`         | `#94a3b8`         | Secondary text, labels, and muted text                         |
| `--cmdk-border`          | `#e2e8f0`         | `#334155`         | Border color for dividers and edges                            |
| `--cmdk-surface`         | `#f8fafc`         | `#1e293b`         | Background color for item hover states                         |
| `--cmdk-bg`              | `#ffffff`         | `#0f172a`         | Primary background color (input, list container)               |
| `--cmdk-overlay`         | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.6)` | Semi-transparent backdrop behind the palette                   |
| `--cmdk-radius`          | `8px`             | `8px`             | Border radius for palette, buttons, and input                  |
| `--cmdk-list-max-height` | `400px`           | `400px`           | Maximum height of the scrollable items list                    |

## Theme Examples

### Default: Blue (Light & Dark)

```css
/* Light mode (default, applies at prefers-color-scheme: light or no media query) */
cmdk-palette {
  --cmdk-accent: #3b82f6;
  --cmdk-accent-hover: #2563eb;
  --cmdk-text: #0f172a;
  --cmdk-muted: #64748b;
  --cmdk-border: #e2e8f0;
  --cmdk-surface: #f8fafc;
  --cmdk-bg: #ffffff;
  --cmdk-overlay: rgba(0, 0, 0, 0.4);
  --cmdk-radius: 8px;
  --cmdk-list-max-height: 400px;
}

/* Dark mode (applies at prefers-color-scheme: dark) */
@media (prefers-color-scheme: dark) {
  cmdk-palette {
    --cmdk-accent: #60a5fa;
    --cmdk-accent-hover: #3b82f6;
    --cmdk-text: #f1f5f9;
    --cmdk-muted: #94a3b8;
    --cmdk-border: #334155;
    --cmdk-surface: #1e293b;
    --cmdk-bg: #0f172a;
    --cmdk-overlay: rgba(0, 0, 0, 0.6);
  }
}
```

### Dark Purple Theme

```css
cmdk-palette {
  --cmdk-accent: #a855f7;
  --cmdk-accent-hover: #9333ea;
  --cmdk-text: #fafafa;
  --cmdk-muted: #d8b4fe;
  --cmdk-border: #7c3aed;
  --cmdk-surface: #6d28d9;
  --cmdk-bg: #3f0f63;
  --cmdk-overlay: rgba(0, 0, 0, 0.7);
  --cmdk-radius: 12px;
  --cmdk-list-max-height: 500px;
}
```

### High Contrast Theme

```css
cmdk-palette {
  --cmdk-accent: #000000;
  --cmdk-accent-hover: #333333;
  --cmdk-text: #000000;
  --cmdk-muted: #666666;
  --cmdk-border: #000000;
  --cmdk-surface: #eeeeee;
  --cmdk-bg: #ffffff;
  --cmdk-overlay: rgba(0, 0, 0, 0.8);
  --cmdk-radius: 0px;
  --cmdk-list-max-height: 600px;
}

@media (prefers-color-scheme: dark) {
  cmdk-palette {
    --cmdk-accent: #ffffff;
    --cmdk-accent-hover: #cccccc;
    --cmdk-text: #ffffff;
    --cmdk-muted: #999999;
    --cmdk-border: #ffffff;
    --cmdk-surface: #333333;
    --cmdk-bg: #000000;
    --cmdk-overlay: rgba(0, 0, 0, 0.9);
  }
}
```

### Minimal Monochrome Theme

```css
cmdk-palette {
  --cmdk-accent: #1f2937;
  --cmdk-accent-hover: #111827;
  --cmdk-text: #1f2937;
  --cmdk-muted: #6b7280;
  --cmdk-border: #d1d5db;
  --cmdk-surface: #f3f4f6;
  --cmdk-bg: #ffffff;
  --cmdk-overlay: rgba(0, 0, 0, 0.3);
  --cmdk-radius: 6px;
  --cmdk-list-max-height: 400px;
}

@media (prefers-color-scheme: dark) {
  cmdk-palette {
    --cmdk-accent: #e5e7eb;
    --cmdk-accent-hover: #f3f4f6;
    --cmdk-text: #e5e7eb;
    --cmdk-muted: #9ca3af;
    --cmdk-border: #374151;
    --cmdk-surface: #1f2937;
    --cmdk-bg: #111827;
    --cmdk-overlay: rgba(0, 0, 0, 0.5);
  }
}
```

## Using Theming with Frameworks

### Vanilla JavaScript

Define your theme as a CSS rule and include it in your stylesheet:

```html
<style>
  cmdk-palette {
    --cmdk-accent: #a855f7;
    --cmdk-bg: #3f0f63;
  }
</style>
```

### React

Add theme styles to your global CSS file or scoped component styles:

```css
/* App.css */
cmdk-palette {
  --cmdk-accent: #a855f7;
  --cmdk-accent-hover: #9333ea;
  --cmdk-bg: #3f0f63;
  --cmdk-text: #fafafa;
}
```

Then import in your component:

```typescript
import './App.css';

export default function App() {
  // ... component code
}
```

Or use inline styles:

```typescript
<style>{`
  cmdk-palette {
    --cmdk-accent: #a855f7;
    --cmdk-bg: #3f0f63;
  }
`}</style>
```

### Vue 3

Define theme in a `<style>` block (scoped or global):

```vue
<style scoped>
cmdk-palette {
  --cmdk-accent: #a855f7;
  --cmdk-accent-hover: #9333ea;
  --cmdk-bg: #3f0f63;
  --cmdk-text: #fafafa;
}
</style>
```

Or globally in `src/style.css`:

```css
cmdk-palette {
  --cmdk-accent: #a855f7;
  --cmdk-bg: #3f0f63;
}
```

### Svelte

Add theme styles in your component or global CSS:

```svelte
<style global>
  cmdk-palette {
    --cmdk-accent: #a855f7;
    --cmdk-accent-hover: #9333ea;
    --cmdk-bg: #3f0f63;
    --cmdk-text: #fafafa;
  }
</style>
```

## Dynamic Theme Switching

To allow users to switch themes at runtime, toggle CSS classes that set different custom properties:

```css
body.light-theme cmdk-palette {
  --cmdk-accent: #3b82f6;
  --cmdk-bg: #ffffff;
  --cmdk-text: #0f172a;
}

body.dark-theme cmdk-palette {
  --cmdk-accent: #60a5fa;
  --cmdk-bg: #0f172a;
  --cmdk-text: #f1f5f9;
}
```

Then in JavaScript, toggle the class:

```javascript
document.body.classList.add('dark-theme');
document.body.classList.remove('light-theme');
```

In React:

```typescript
const [theme, setTheme] = useState('light');

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
```

## Common Mistakes

**Forgetting that custom properties must be set on `cmdk-palette` or `:root`.** If you set `--cmdk-accent` on a parent div, it won't apply to the palette inside its Shadow DOM. You must set properties directly on the `cmdk-palette` element or on `:root` for global scope.

**Using `!important` unnecessarily.** With correct scoping, `!important` is never needed. If your theme isn't applying, check that you're targeting the right element (`cmdk-palette`, not a wrapper div).

**Mixing hex, rgb, and hsl color formats inconsistently.** All custom properties accept any valid CSS color format (hex, rgb, hsl, etc.), but stick to one format for consistency and maintainability.

**Hardcoding colors in your app that clash with the palette.** If your app has its own primary color, avoid hardcoding it. Use consistent custom properties across your entire application.

**Assuming dark mode overrides light mode by default.** light mode is the default. The dark mode media query applies _on top_ of light mode. Always define both if you want to support both color schemes.

**Not testing keyboard focus states.** When you customize `--cmdk-accent`, ensure the focus state is visible. Use sufficient contrast for accessibility.
