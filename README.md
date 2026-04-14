# cmdk-wc

**A framework-agnostic command palette web component.** Built as native Web Components with full TypeScript support, works in React, Vue, Svelte, Angular, and vanilla JavaScript. Inspired by [cmdk](https://github.com/pacocoursey/cmdk), reimagined for any framework.

[![npm version](https://img.shields.io/npm/v/cmdk-wc?style=flat-square)](https://www.npmjs.com/package/cmdk-wc)
[![npm downloads](https://img.shields.io/npm/dm/cmdk-wc?style=flat-square)](https://www.npmjs.com/package/cmdk-wc)
[![MIT License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Built with Lit](https://img.shields.io/badge/built%20with-Lit-purple?style=flat-square)](https://lit.dev)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents-published-blue?style=flat-square)](https://webcomponents.org/element/cmdk-wc)

---

## Table of Contents

- [Features](#features)
- [About cmdk-wc](#about-cmdk-wc)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Component API](#component-api)
- [Data Structure](#data-structure)
- [Theming](#theming)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [TypeScript Support](#typescript-support)
- [Browser Support](#browser-support)
- [Advanced Usage](#advanced-usage)
- [Framework Guides](#framework-guides)
- [Building from Source](#building-from-source)
- [Contributing](#contributing)
- [License](#license)
- [Support & Issues](#support--issues)

---

## Features

- 🎯 **Native Web Components** — Works across any framework or vanilla JS
- ⌨️ **Keyboard Navigation** — Full Cmd+K support, arrow keys, enter to select, escape to close with built-in visual keyboard shortcuts footer
- 🔄 **Multi-Page Navigation** — Drill-down into categories with breadcrumb support
- 🎨 **Themeable** — 14 CSS custom properties for complete visual customization, built-in dark mode
- 📦 **Lightweight** — ~15KB minified, zero external dependencies beyond Lit
- 🧩 **Accessible** — ARIA roles, screen reader support, semantic HTML, keyboard shortcuts footer with aria-labels
- ✨ **TypeScript** — Full type definitions included for all components and interfaces
- 🚀 **Framework Agnostic** — Drop into React, Vue, Svelte, Angular, or any framework

---

## About cmdk-wc

**cmdk-wc** is a framework-agnostic command palette web component that works with any JavaScript framework or vanilla JavaScript. 

- **Published on NPM**: [npmjs.com/package/cmdk-wc](https://www.npmjs.com/package/cmdk-wc)
- **License**: [MIT (Open Source Initiative)](https://opensource.org/licenses/MIT)
- **Repository**: [GitHub - AhmedAshraf-GPT/cmdk](https://github.com/AhmedAshraf-GPT/cmdk)
- **Built with**: [Lit 3.x](https://lit.dev) - Web Components framework
- **Type Support**: Full TypeScript type definitions included

This component follows **Web Components Standards** (Custom Elements, Shadow DOM, Slot API) and is compatible with all modern browsers.

---

## Installation

```bash
npm install cmdk-wc
```

Or with your favorite package manager:

```bash
pnpm add cmdk-wc
yarn add cmdk-wc
bun add cmdk-wc
```

---

## Quick Start

### Vanilla JavaScript

```html
<!-- 1. Import the component -->
<script type="module">
  import 'cmdk-wc';
</script>

<!-- 2. Use it in HTML -->
<cmdk-palette id="palette"></cmdk-palette>

<!-- 3. Provide data via JavaScript -->
<script>
  const palette = document.getElementById('palette');

  palette.pages = [
    {
      id: 'root',
      lists: [
        {
          id: 'actions',
          heading: 'Actions',
          items: [
            { id: 'new', label: 'New File', icon: '✨' },
            { id: 'settings', label: 'Settings', icon: '⚙️' },
          ],
        },
      ],
    },
  ];

  palette.addEventListener('cmdk-select', (event) => {
    console.log('Selected:', event.detail);
  });

  // Open palette
  palette.open = true;
</script>
```

### React

```tsx
import { useRef, useEffect, useState } from 'react';
import 'cmdk-wc';

export default function App() {
  const paletteRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!paletteRef.current) return;

    paletteRef.current.pages = [
      {
        id: 'root',
        lists: [
          {
            id: 'actions',
            heading: 'Actions',
            items: [
              { id: 'new', label: 'New File', icon: '✨' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
            ],
          },
        ],
      },
    ];
  }, []);

  useEffect(() => {
    if (paletteRef.current) {
      paletteRef.current.open = open;
    }
  }, [open]);

  useEffect(() => {
    const handleSelect = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Selected:', customEvent.detail);
    };

    paletteRef.current?.addEventListener('cmdk-select', handleSelect);
    return () =>
      paletteRef.current?.removeEventListener('cmdk-select', handleSelect);
  }, []);

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open Palette</button>
      <cmdk-palette ref={paletteRef}></cmdk-palette>
    </div>
  );
}
```

**Note:** See [React Integration Guide](docs/react.md) for TypeScript setup and detailed patterns.

### Vue 3

```vue
<template>
  <div>
    <button
      @click="palette?.open ? (palette.open = false) : (palette.open = true)"
    >
      Open Palette
    </button>
    <cmdk-palette ref="paletteRef"></cmdk-palette>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import 'cmdk-wc';

const paletteRef = ref<HTMLElement>();

onMounted(() => {
  if (!paletteRef.value) return;

  paletteRef.value.pages = [
    {
      id: 'root',
      lists: [
        {
          id: 'actions',
          heading: 'Actions',
          items: [
            { id: 'new', label: 'New File', icon: '✨' },
            { id: 'settings', label: 'Settings', icon: '⚙️' },
          ],
        },
      ],
    },
  ];

  paletteRef.value.addEventListener('cmdk-select', (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Selected:', customEvent.detail);
  });
});
</script>
```

### Svelte

```svelte
<script lang="ts">
  import 'cmdk-wc';
  import { onMount } from 'svelte';

  let paletteRef: HTMLElement;
  let open = false;

  onMount(() => {
    if (!paletteRef) return;

    paletteRef.pages = [
      {
        id: 'root',
        lists: [
          {
            id: 'actions',
            heading: 'Actions',
            items: [
              { id: 'new', label: 'New File', icon: '✨' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
            ]
          }
        ]
      }
    ];

    paletteRef.addEventListener('cmdk-select', (event) => {
      console.log('Selected:', event.detail);
    });
  });

  $: {
    if (paletteRef) {
      paletteRef.open = open;
    }
  }
</script>

<button on:click={() => (open = !open)}>
  Open Palette
</button>
<cmdk-palette bind:this={paletteRef}></cmdk-palette>
```

### Angular

```typescript
// app.component.ts
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import 'cmdk-wc';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="togglePalette()">Open Palette</button>
    <cmdk-palette #palette></cmdk-palette>
  `,
})
export class AppComponent implements AfterViewInit {
  @ViewChild('palette') paletteRef!: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    const palette = this.paletteRef.nativeElement;

    palette.pages = [
      {
        id: 'root',
        lists: [
          {
            id: 'actions',
            heading: 'Actions',
            items: [
              { id: 'new', label: 'New File', icon: '✨' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
            ],
          },
        ],
      },
    ];

    palette.addEventListener('cmdk-select', (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Selected:', customEvent.detail);
    });
  }

  togglePalette() {
    this.paletteRef.nativeElement.open = !this.paletteRef.nativeElement.open;
  }
}
```

---

## Component API

### `<cmdk-palette>`

The root component that orchestrates state, keyboard navigation, and data filtering.

#### Properties

| Property | Type             | Default  | Description                                       |
| -------- | ---------------- | -------- | ------------------------------------------------- |
| `pages`  | `CmdkPageData[]` | `[]`     | Array of page objects containing groups and items |
| `open`   | `boolean`        | `false`  | Whether the palette is visible                    |
| `page`   | `string`         | `'root'` | Current active page ID for drill-down navigation  |

#### Methods

| Method         | Signature    | Description                             |
| -------------- | ------------ | --------------------------------------- |
| `focusInput()` | `() => void` | Programmatically focus the search input |

#### Events

| Event           | Detail                                         | Fired When                                |
| --------------- | ---------------------------------------------- | ----------------------------------------- |
| `cmdk-select`   | `{ id: string; label: string; href?: string }` | User selects a leaf item (non-navigation) |
| `cmdk-navigate` | `{ pageId: string }`                           | User navigates to a new page              |
| `cmdk-open`     | `{}`                                           | Palette opens                             |
| `cmdk-close`    | `{}`                                           | Palette closes                            |

#### Example

```javascript
const palette = document.querySelector('cmdk-palette');

// Set data
palette.pages = [{ id: 'root', lists: [...] }];

// Open/close
palette.open = true;

// Listen for events
palette.addEventListener('cmdk-select', (event) => {
  console.log('Item selected:', event.detail.label);
});
```

---

### `<cmdk-input>`

The search input field. Automatically rendered inside `<cmdk-palette>`. Handles text input and displays breadcrumb navigation on multi-page palettes.

#### Properties

| Property      | Type     | Default                | Description            |
| ------------- | -------- | ---------------------- | ---------------------- |
| `placeholder` | `string` | `'Search commands...'` | Input placeholder text |

#### Methods

| Method    | Signature    | Description             |
| --------- | ------------ | ----------------------- |
| `focus()` | `() => void` | Focus the input element |
| `blur()`  | `() => void` | Blur the input element  |

#### Events

| Event        | Detail              | Fired When                     |
| ------------ | ------------------- | ------------------------------ |
| `cmdk-input` | `{ value: string }` | User types in the search field |

---

### `<cmdk-list>`

Container for groups and free-search actions. Automatically rendered inside `<cmdk-palette>`. Handles scrolling and ARIA roles for accessibility.

#### Properties

| Property | Type | Default | Description          |
| -------- | ---- | ------- | -------------------- |
| (none)   | -    | -       | No public properties |

---

### `<cmdk-group>`

Groups related items under a heading label. Automatically rendered for each list in the active page.

#### Properties

| Property | Type     | Default | Description        |
| -------- | -------- | ------- | ------------------ |
| `label`  | `string` | `''`    | Group heading text |

#### Slots

| Slot      | Content                |
| --------- | ---------------------- |
| (default) | `<cmdk-item>` children |

---

### `<cmdk-item>`

A single command or action row. Displays an icon (optional), label, and type hint (Link/Action/navigation).

#### Properties

| Property   | Type           | Default | Description                                                       |
| ---------- | -------------- | ------- | ----------------------------------------------------------------- |
| `itemData` | `CmdkItemData` | `{}`    | The full item object (id, label, icon, href, page, onClick, etc.) |
| `selected` | `boolean`      | `false` | Whether this item is currently highlighted                        |

#### Events

| Event             | Detail         | Fired When                               |
| ----------------- | -------------- | ---------------------------------------- |
| `cmdk-item-click` | `CmdkItemData` | User clicks or presses Enter on the item |

#### Example

```typescript
interface CmdkItemData {
  id: string;
  label: string;
  icon?: string; // Icon name or inline SVG
  href?: string; // If set, type hint shows "Link"
  page?: string; // If set, drill down to this page
  closeOnSelect?: boolean; // Default: true
  onClick?: () => void; // Optional side-effect
}
```

---

### `<cmdk-free-search-action>`

Fallback action shown when search yields no results. Allows users to perform a custom action with their search query.

#### Properties

| Property | Type     | Default | Description                   |
| -------- | -------- | ------- | ----------------------------- |
| `query`  | `string` | `''`    | The current search query text |

#### Example

```html
<cmdk-palette id="palette"></cmdk-palette>

<script>
  const palette = document.getElementById('palette');

  palette.pages = [
    {
      id: 'root',
      lists: [
        {
          id: 'actions',
          heading: 'Actions',
          items: [{ id: 'new', label: 'New', icon: '✨' }],
        },
      ],
    },
  ];

  palette.addEventListener('cmdk-select', (event) => {
    if (event.detail.id === 'free-search') {
      console.log('User searched for:', event.detail.query);
    }
  });
</script>
```

---

## Data Structure

All data is provided as a nested structure of pages, groups, and items:

```typescript
interface CmdkPageData {
  id: string; // Unique page identifier
  lists: CmdkListData[]; // Array of groups to display
}

interface CmdkListData {
  id: string; // Unique group identifier
  heading: string; // Label shown above items
  items: CmdkItemData[]; // Array of commands
}

interface CmdkItemData {
  id: string; // Unique item identifier
  label: string; // Display text
  icon?: string; // Icon name or inline SVG
  href?: string; // Optional: if set, item is a link
  page?: string; // Optional: navigate to page with this id
  closeOnSelect?: boolean; // Default: true; set false for navigation items
  onClick?: () => void; // Optional: side-effect on click
}
```

**Example:**

```javascript
const data = [
  {
    id: 'root',
    lists: [
      {
        id: 'navigation',
        heading: 'Navigation',
        items: [
          { id: 'home', label: 'Home', icon: '🏠', href: '/' },
          { id: 'projects', label: 'Projects', icon: '📁', page: 'projects' },
        ],
      },
      {
        id: 'actions',
        heading: 'Actions',
        items: [
          {
            id: 'new',
            label: 'New File',
            icon: '✨',
            onClick: () => createFile(),
          },
        ],
      },
    ],
  },
  {
    id: 'projects',
    lists: [
      {
        id: 'recent',
        heading: 'Recent Projects',
        items: [
          { id: 'proj-1', label: 'My App', icon: '💻' },
          { id: 'proj-2', label: 'Website', icon: '🌐' },
        ],
      },
    ],
  },
];
```

---

## Theming

All visual styling is driven by CSS custom properties. Customize the palette's appearance by setting properties on the `cmdk-palette` element or `:root`.

### CSS Custom Properties

| Property                 | Light Default     | Dark Default      | Description                   |
| ------------------------ | ----------------- | ----------------- | ----------------------------- |
| `--cmdk-accent`          | `#3b82f6`         | `#60a5fa`         | Primary accent color          |
| `--cmdk-accent-hover`    | `#2563eb`         | `#3b82f6`         | Hover state for accent        |
| `--cmdk-text`            | `#0f172a`         | `#f1f5f9`         | Primary text color            |
| `--cmdk-muted`           | `#64748b`         | `#94a3b8`         | Secondary/muted text          |
| `--cmdk-border`          | `#e2e8f0`         | `#334155`         | Border color                  |
| `--cmdk-surface`         | `#f8fafc`         | `#1e293b`         | Item hover background         |
| `--cmdk-bg`              | `#ffffff`         | `#0f172a`         | Primary background            |
| `--cmdk-overlay`         | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.6)` | Backdrop overlay              |
| `--cmdk-radius`          | `8px`             | `8px`             | Border radius                 |
| `--cmdk-list-max-height` | `400px`           | `400px`           | Max height of scrollable list |

### Light Theme Example

```css
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
```

### Dark Theme Example

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
    --cmdk-radius: 8px;
    --cmdk-list-max-height: 400px;
  }
}
```

### Custom Theme (Purple)

```css
cmdk-palette {
  --cmdk-accent: #8b5cf6;
  --cmdk-accent-hover: #7c3aed;
  --cmdk-bg: #fef5ff;
  --cmdk-text: #3f0f5c;
  --cmdk-surface: #f3e8ff;
  --cmdk-border: #e9d5ff;
}

@media (prefers-color-scheme: dark) {
  cmdk-palette {
    --cmdk-accent: #d8b4fe;
    --cmdk-accent-hover: #f0abfc;
    --cmdk-bg: #2d0a4e;
    --cmdk-text: #f3e8ff;
    --cmdk-surface: #4c1d95;
    --cmdk-border: #6b21a8;
  }
}
```

For complete theming guidance, see the [Theming Guide](docs/theming.md).

---

## Keyboard Shortcuts

| Key                                | Behavior                             |
| ---------------------------------- | ------------------------------------ |
| <kbd>Cmd/Ctrl</kbd> + <kbd>K</kbd> | Toggle palette open/closed (global)  |
| <kbd>↑</kbd> / <kbd>↓</kbd>        | Navigate items up/down               |
| <kbd>Enter</kbd>                   | Select highlighted item              |
| <kbd>Esc</kbd>                     | Go back a page or close palette      |
| <kbd>Backspace</kbd>               | Clear search (when input is focused) |

---

## TypeScript Support

Full TypeScript definitions are included. Import types from the package to ensure type safety:

```typescript
import type { CmdkPageData, CmdkListData, CmdkItemData } from 'cmdk-wc';

const pages: CmdkPageData[] = [
  {
    id: 'root',
    lists: [
      {
        id: 'actions',
        heading: 'Actions',
        items: [
          {
            id: 'new',
            label: 'New File',
            icon: '✨',
            onClick: () => console.log('Creating new file'),
          },
        ],
      },
    ],
  },
];
```

### Framework-Specific Setup

- **React**: See [React Integration](docs/react.md) for type declaration setup
- **Vue**: Native support, full IntelliSense in templates
- **Svelte**: Native support, full IntelliSense in templates
- **Angular**: Use `CUSTOM_ELEMENTS_SCHEMA` to avoid template errors

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern mobile browsers

Web Components are widely supported. Check [caniuse.com](https://caniuse.com/custom-elements) for detailed compatibility.

---

## Advanced Usage

### Multi-Page Navigation

Create drill-down experiences by providing multiple pages and using the `page` property on items:

```javascript
const palette = document.querySelector('cmdk-palette');

palette.pages = [
  {
    id: 'root',
    lists: [
      {
        heading: 'Pages',
        items: [{ id: 'go-projects', label: 'Projects', page: 'projects' }],
      },
    ],
  },
  {
    id: 'projects',
    lists: [
      { heading: 'Your Projects', items: [{ id: 'p1', label: 'My App' }] },
    ],
  },
];

palette.open = true;
```

### Custom Actions with onClick

Execute custom side-effects when items are selected:

```javascript
palette.pages = [
  {
    id: 'root',
    lists: [
      {
        heading: 'Actions',
        items: [
          {
            id: 'create',
            label: 'Create New File',
            onClick: () => {
              fs.writeFile('newfile.txt', '', () => {
                console.log('File created!');
              });
            },
          },
        ],
      },
    ],
  },
];
```

### Listening to Events

```javascript
palette.addEventListener('cmdk-select', (event) => {
  console.log('Selected:', event.detail);
  // { id: 'new', label: 'New File', href?: '...' }
});

palette.addEventListener('cmdk-navigate', (event) => {
  console.log('Navigated to page:', event.detail.pageId);
});

palette.addEventListener('cmdk-open', () => console.log('Opened'));
palette.addEventListener('cmdk-close', () => console.log('Closed'));
```

---

## Framework Guides

Detailed integration guides for each framework:

- [Vanilla JavaScript](docs/vanilla.md)
- [React](docs/react.md)
- [Vue](docs/vue.md)
- [Svelte](docs/svelte.md)
- [Angular](docs/angular.md)

---

## Contributing

This repository is currently not open for contributions.  
Please [open an issue](https://github.com/AhmedAshraf-GPT/cmdk/issues) to discuss before submitting any pull requests.

---

## License

**MIT License** ([Open Source Initiative Approved](https://opensource.org/licenses/MIT))

This software is released under the MIT License, which permits commercial use, modification, and distribution.

**You are free to:**
- ✅ Use this software for any purpose (personal, educational, commercial)
- ✅ Modify and distribute modified versions
- ✅ Include this software in proprietary applications

**Conditions:**
- Include a copy of the License and Copyright notice with distributions

See the full [LICENSE](LICENSE) file for details.

---

## Support & Issues

- **Bug Reports**: [GitHub Issues](https://github.com/AhmedAshraf-GPT/cmdk/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/AhmedAshraf-GPT/cmdk/discussions)
- **Documentation**: See [docs/](docs/) for framework-specific guides

---

## Building from Source

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn/bun)

### Setup

```bash
git clone https://github.com/AhmedAshraf-GPT/cmdk.git
cd cmdk
pnpm install
```

### Development

```bash
# Start Vite dev server with hot reload
pnpm dev

# Build library
pnpm build

# Run tests (if applicable)
pnpm test

# Lint code
pnpm lint
```

### Project Structure

```
src/
├── components/          # Web component definitions
│   ├── cmdkpalette.ts   # Main palette orchestrator
│   ├── cmdkinput.ts     # Search input
│   ├── cmdklist.ts      # Item list container
│   ├── cmdkgroup.ts     # Item group
│   ├── cmdkitem.ts      # Individual item
│   └── ...
├── index.ts            # Entry point
└── types.ts            # TypeScript definitions

types/
├── index.d.ts          # Main type definitions
├── react.d.ts          # React integration types
├── vue.d.ts            # Vue integration types
└── ...                 # Other framework types

docs/
├── react.md            # React integration guide
├── vue.md              # Vue 3 integration guide
├── svelte.md           # Svelte integration guide
├── angular.md          # Angular integration guide
├── vanilla.md          # Vanilla JS guide
└── theming.md          # CSS customization guide
```

---

## Maintenance & Updates

This project is actively maintained. For version history and changelog, see [GitHub Releases](https://github.com/AhmedAshraf-GPT/cmdk/releases).

### Current Version

**v1.1.0** - Latest release with full keyboard navigation, accessibility features, and framework integrations.

---

## Inspiration

Inspired by [cmdk](https://github.com/pacocoursey/cmdk) by Paco Coursey, reimagined as a framework-agnostic Web Component.
