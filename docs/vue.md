# Vue 3 Integration

Integrate cmdk-wc with Vue 3. Learn how to properly bind properties, listen to custom events, and configure Vue to recognize web components.

## The Core Problem

Vue has specific requirements for working with web components:

**Vue warns "Unknown custom element" for unregistered elements.** By default, Vue logs a warning for any unknown tag. You must configure Vue to recognize cmdk-\* elements as custom elements.

**Vue v-bind uses attribute binding by default for objects.** When you write `:pages="data"`, Vue tries to sync the data as an attribute, which doesn't work for objects. You need either the `.prop` modifier or ref-based assignment.

**CustomEvents need the `on:` prefix with hyphenated names.** Vue doesn't recognize `@cmdk-select` directly. You must use `@cmdk-select` or programmatically attach listeners.

## Installation

```shell
npm install cmdk-wc
```

## installation + Vite Config

Configure `vite.config.ts` to tell Vue that cmdk-\* is a custom element:

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('cmdk-'),
        },
      },
    }),
  ],
});
```

Without this, Vue logs warnings for every cmdk-\* tag in your templates.

## TypeScript Setup

Augment Vue's type system to recognize cmdk-\* components. Add to `src/types/cmdk-wc.d.ts`:

```typescript
import { GlobalComponents } from '@vue/runtime-core';

declare module '@vue/runtime-core' {
  interface GlobalComponents {
    'cmdk-palette': any;
    'cmdk-input': any;
    'cmdk-list': any;
    'cmdk-group': any;
    'cmdk-item': any;
    'cmdk-free-search-action': any;
  }
}

declare global {
  interface CmdkItemData {
    id: string;
    label: string;
    icon?: string;
    href?: string;
    page?: string;
    closeOnSelect?: boolean;
    onClick?: () => void;
  }

  interface CmdkListData {
    id: string;
    heading: string;
    items: CmdkItemData[];
  }

  interface CmdkPageData {
    id: string;
    lists: CmdkListData[];
  }

  interface CmdkPaletteElement extends HTMLElement {
    pages: CmdkPageData[];
    open: boolean;
    page: string;
  }
}

export {};
```

## Property Binding

There are two approaches for binding complex objects to web component properties in Vue:

**Approach A: Using `.prop` modifier** — Tell Vue to bind as a property, not attribute:

```vue
<template>
  <cmdk-palette :pages.prop="pages" :open.prop="open" />
</template>
```

This is concise but has limitations with reactivity on nested changes.

**Approach B: Using `ref` with `watchEffect`** (recommended) — Imperatively sync the data:

```vue
<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import 'cmdk-wc';

const paletteRef = ref<CmdkPaletteElement | null>(null);
const pages = ref<CmdkPageData[]>([...]);
const open = ref(false);

// Sync pages to the element
watchEffect(() => {
  if (paletteRef.value) {
    paletteRef.value.pages = pages.value;
  }
});

// Sync open to the element
watchEffect(() => {
  if (paletteRef.value) {
    paletteRef.value.open = open.value;
  }
});
</script>

<template>
  <cmdk-palette ref="paletteRef" />
</template>
```

Approach B is more reliable for complex nested data because it bypasses Vue's attribute binding entirely.

## Event Binding

Vue's `@` syntax works with hyphenated event names:

```vue
<template>
  <cmdk-palette
    @cmdk-select="onSelect"
    @cmdk-page="onPage"
    @cmdk-search="onSearch"
  />
</template>

<script setup lang="ts">
const onSelect = (e: CustomEvent) => {
  console.log('Selected:', e.detail.label);
};

const onPage = (e: CustomEvent) => {
  console.log('Page changed to:', e.detail.page);
};

const onSearch = (e: CustomEvent) => {
  console.log('Search query:', e.detail.query);
};
</script>
```

The handler receives a `CustomEvent` object; access the data via `e.detail`.

## Full Example

Complete `src/App.vue` (Composition API + `<script setup>`) replicating the vanilla example:

```vue
<template>
  <div class="app">
    <div class="container">
      <h1>cmdk-wc Vue 3 Demo</h1>
      <p class="subtitle">A command palette built with native web components</p>

      <div class="instructions">
        <p>
          Press <code>Cmd+K</code> (Mac) or <code>Ctrl+K</code> (Windows/Linux)
          to open, or click the button below.
        </p>
      </div>

      <div class="controls">
        <button @click="open = !open">
          {{ open ? 'Close Palette' : 'Open Palette (Cmd+K)' }}
        </button>
        <button @click="eventLog = []">Clear Log</button>
        <button @click="darkMode = !darkMode">Toggle Dark Mode</button>
      </div>

      <div class="event-log">
        <h2>Event Log</h2>
        <div v-if="eventLog.length === 0" class="event-log-empty">
          Waiting for events...
        </div>
        <div v-for="(entry, i) in eventLog" :key="i" class="event-log-entry">
          <span class="badge">{{ entry.event }}</span>
          <span>{{ entry.time }} — {{ JSON.stringify(entry.detail) }}</span>
        </div>
      </div>
    </div>

    <cmdk-palette
      ref="paletteRef"
      @cmdk-select="onSelect"
      @cmdk-page="onPage"
      @cmdk-search="onSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, onUnmounted } from 'vue';
import 'cmdk-wc';

interface EventLogEntry {
  time: string;
  event: string;
  detail: Record<string, unknown>;
}

const paletteRef = ref<CmdkPaletteElement | null>(null);
const open = ref(false);
const darkMode = ref(false);
const eventLog = ref<EventLogEntry[]>([]);

const pages = ref<CmdkPageData[]>([
  {
    id: 'root',
    lists: [
      {
        id: 'actions',
        heading: 'Actions',
        items: [
          { id: 'create', label: 'Create New File', icon: '✨' },
          { id: 'search', label: 'Search...', icon: '🔍' },
          { id: 'settings', label: 'Settings', icon: '⚙️' },
        ],
      },
      {
        id: 'projects',
        heading: 'Projects',
        items: [
          {
            id: 'projects-page',
            label: 'View All Projects',
            icon: '📁',
            page: 'projects',
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
          { id: 'proj-1', label: 'Portfolio Site', icon: '🌐' },
          { id: 'proj-2', label: 'Mobile App', icon: '📱' },
          { id: 'proj-3', label: 'Design System', icon: '🎨' },
        ],
      },
      {
        id: 'archived',
        heading: 'Archived',
        items: [{ id: 'proj-4', label: 'Old Experiment', icon: '🗂️' }],
      },
    ],
  },
]);

// Sync pages to the element
watchEffect(() => {
  if (paletteRef.value) {
    paletteRef.value.pages = pages.value;
  }
});

// Sync open state to the element
watchEffect(() => {
  if (paletteRef.value) {
    paletteRef.value.open = open.value;
  }
});

// Sync dark mode to document
watchEffect(() => {
  if (darkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

// Event handlers
const onSelect = (e: CustomEvent) => {
  addLog('cmdk-select', {
    id: e.detail.id,
    label: e.detail.label,
    href: e.detail.href,
  });
  open.value = false;
};

const onPage = (e: CustomEvent) => {
  addLog('cmdk-page', { page: e.detail.page });
};

const onSearch = (e: CustomEvent) => {
  addLog('cmdk-search', { query: e.detail.query });
};

// Global keyboard shortcut
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    open.value = !open.value;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// Helper functions
const addLog = (event: string, detail: Record<string, unknown>) => {
  const time = new Date().toLocaleTimeString();
  eventLog.value = [{ time, event, detail }, ...eventLog.value].slice(0, 50);
};
</script>

<style scoped>
.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 0.5rem;
  font-size: 2rem;
  color: #0f172a;
}

:global(body.dark) h1 {
  color: #f8fafc;
}

.subtitle {
  color: #64748b;
  margin-bottom: 2rem;
}

:global(body.dark) .subtitle {
  color: #cbd5e1;
}

.instructions {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #1e40af;
}

:global(body.dark) .instructions {
  background: rgba(15, 23, 42, 0.5);
  border-color: #1e3a8a;
  color: #93c5fd;
}

.instructions code {
  background: rgba(255, 255, 255, 0.5);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

:global(body.dark) .instructions code {
  background: rgba(15, 23, 42, 0.5);
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #2563eb;
}

button:active {
  transform: scale(0.98);
}

.event-log {
  margin-top: 2rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

:global(body.dark) .event-log {
  background: #1e293b;
  border-color: #334155;
}

.event-log h2 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: #0f172a;
}

:global(body.dark) .event-log h2 {
  color: #f8fafc;
}

.event-log-entry {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: #f1f5f9;
  border-left: 3px solid #3b82f6;
  font-size: 0.875rem;
  font-family: monospace;
  word-break: break-all;
  color: #0f172a;
}

:global(body.dark) .event-log-entry {
  background: #0f172a;
  border-left-color: #60a5fa;
  color: #e2e8f0;
}

.event-log-empty {
  color: #64748b;
  font-style: italic;
}

:global(body.dark) .event-log-empty {
  color: #cbd5e1;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e0e7ff;
  color: #3b82f6;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.5rem;
}

:global(body.dark) .badge {
  background: #312e81;
  color: #60a5fa;
}
</style>
```

## Keyboard Navigation

The palette responds to these keys:

- **Cmd+K** (Mac) or **Ctrl+K** — Toggle the palette open or closed globally.
- **Arrow Up / Arrow Down** — Move selection between visible items.
- **Enter** — Activate (select) the focused item.
- **Escape** — Go back to the previous page, or close the palette if on root.
- **Backspace** — Go back one page if the search input is empty and not on root.

## Theming

Override CSS custom properties on the `cmdk-palette` element. You can do this globally in `src/style.css` or scoped in your component:

```css
cmdk-palette {
  --cmdk-accent: #7c3aed;
  --cmdk-accent-hover: #6d28d9;
  --cmdk-bg: #581c87;
  --cmdk-text: #f3e8ff;
  --cmdk-muted: #d8b4fe;
  --cmdk-border: #a855f7;
  --cmdk-surface: #6d28d9;
}
```

See [Theming Guide](./theming.md) for complete reference and examples.
