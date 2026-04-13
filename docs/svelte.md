# Svelte Integration

Integrate cmdk-wc with Svelte. Learn how to bind object properties reactively and handle custom events in Svelte.

## The Core Problem

Svelte requires a slightly different approach than other frameworks:

**Svelte doesn't automatically set object properties on custom elements.** When you write `<cmdk-palette pages={data} />`, Svelte binds the data as an attribute, not a property. You need a custom action or manual assignment to set object properties correctly.

**Two-way binding (`bind:`) doesn't work on custom element properties.** Svelte's `bind:` directive doesn't apply to web component properties, only native HTML properties.

**Event naming uses the `on:` prefix with hyphens.** Svelte's event syntax `on:cmdk-select` works for custom events, but you need to ensure the element is registered.

## Installation

```shell
npm install cmdk-wc
```

## Registering the Components

Import the package in your component or in `src/main.ts`:

```typescript
import 'cmdk-wc';
```

This side-effect import registers all custom elements globally.

## Property Binding

Svelte provides actions, which are functions that receive a DOM node. Use an action to set object properties reactively.

**Recommended: Custom action pattern** — Create a reusable action:

```typescript
// src/lib/cmdkProps.ts
export function cmdkProps(node: HTMLElement, props: Record<string, unknown>) {
  Object.assign(node, props);

  return {
    update(newProps: Record<string, unknown>) {
      Object.assign(node, newProps);
    },
  };
}
```

Then use it in your component:

```svelte
<script>
  import 'cmdk-wc';
  import { cmdkProps } from './lib/cmdkProps';

  let pages = [...];
  let open = false;
</script>

<cmdk-palette use:cmdkProps={{ pages, open }} />
```

Whenever `pages` or `open` change, the action updates the element's properties.

**Alternative: onMount + reactive assignment** — Without an action:

```svelte
<script>
  import { onMount } from 'svelte';
  import 'cmdk-wc';

  let paletteEl;
  let pages = [...];
  let open = false;

  onMount(() => {
    paletteEl.pages = pages;
  });

  $: if (paletteEl) paletteEl.pages = pages;
  $: if (paletteEl) paletteEl.open = open;
</script>

<cmdk-palette bind:this={paletteEl} />
```

This approach is more verbose. The action pattern is cleaner.

## Event Binding

Svelte's `on:` directive works with hyphenated event names:

```svelte
<cmdk-palette
  on:cmdk-select={onSelect}
  on:cmdk-page={onPage}
  on:cmdk-search={onSearch}
/>

<script>
  const onSelect = (e) => {
    console.log('Selected:', e.detail.label);
  };

  const onPage = (e) => {
    console.log('Page:', e.detail.page);
  };

  const onSearch = (e) => {
    console.log('Query:', e.detail.query);
  };
</script>
```

The event handler receives a CustomEvent; access data via `e.detail`.

## TypeScript Setup

Augment Svelte's HTML namespace to recognize cmdk-\* components. Add to `src/lib/types/cmdk-wc.d.ts`:

```typescript
declare global {
  // Data model interfaces
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

  // Svelte HTML namespace augmentation
  namespace svelte.JSX {
    interface HTMLAttributes<T> {
      'on:cmdk-select'?: (
        event: CustomEvent<{
          id: string;
          label: string;
          href?: string;
        }>,
      ) => void;
      'on:cmdk-page'?: (event: CustomEvent<{ page: string }>) => void;
      'on:cmdk-search'?: (event: CustomEvent<{ query: string }>) => void;
    }
  }
}

export {};
```

## Full Example

Complete Svelte component replicating the vanilla example:

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import 'cmdk-wc';
  import { cmdkProps } from './lib/cmdkProps';

  interface EventLogEntry {
    time: string;
    event: string;
    detail: Record<string, unknown>;
  }

  let pages: CmdkPageData[] = [
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
          ]
        },
        {
          id: 'projects',
          heading: 'Projects',
          items: [
            {
              id: 'projects-page',
              label: 'View All Projects',
              icon: '📁',
              page: 'projects'
            },
          ]
        }
      ]
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
          ]
        },
        {
          id: 'archived',
          heading: 'Archived',
          items: [
            { id: 'proj-4', label: 'Old Experiment', icon: '🗂️' },
          ]
        }
      ]
    }
  ];

  let open = false;
  let darkMode = false;
  let eventLog: EventLogEntry[] = [];

  const onSelect = (e: CustomEvent) => {
    addLog('cmdk-select', {
      id: e.detail.id,
      label: e.detail.label,
      href: e.detail.href
    });
    open = false;
  };

  const onPage = (e: CustomEvent) => {
    addLog('cmdk-page', { page: e.detail.page });
  };

  const onSearch = (e: CustomEvent) => {
    addLog('cmdk-search', { query: e.detail.query });
  };

  const addLog = (event: string, detail: Record<string, unknown>) => {
    const time = new Date().toLocaleTimeString();
    eventLog = [
      { time, event, detail },
      ...eventLog
    ].slice(0, 50);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      open = !open;
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class:dark-mode={darkMode}>
  <div class="container">
    <h1>cmdk-wc Svelte Demo</h1>
    <p class="subtitle">A command palette built with native web components</p>

    <div class="instructions">
      <p>
        Press <code>Cmd+K</code> (Mac) or <code>Ctrl+K</code> (Windows/Linux) to open,
        or click the button below.
      </p>
    </div>

    <div class="controls">
      <button on:click={() => (open = !open)}>
        {open ? 'Close Palette' : 'Open Palette (Cmd+K)'}
      </button>
      <button on:click={() => (eventLog = [])}>Clear Log</button>
      <button on:click={() => (darkMode = !darkMode)}>Toggle Dark Mode</button>
    </div>

    <div class="event-log">
      <h2>Event Log</h2>
      {#if eventLog.length === 0}
        <div class="event-log-empty">Waiting for events...</div>
      {:else}
        {#each eventLog as entry (entry.time + entry.event)}
          <div class="event-log-entry">
            <span class="badge">{entry.event}</span>
            <span>{entry.time} — {JSON.stringify(entry.detail)}</span>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <cmdk-palette
    use:cmdkProps={{ pages, open }}
    on:cmdk-select={onSelect}
    on:cmdk-page={onPage}
    on:cmdk-search={onSearch}
  />
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f8fafc;
    padding: 2rem;
    color: #0f172a;
  }

  :global(body.dark-mode) {
    background: #0f172a;
    color: #f8fafc;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    margin-bottom: 0.5rem;
    font-size: 2rem;
  }

  .subtitle {
    color: #64748b;
    margin-bottom: 2rem;
  }

  :global(.dark-mode) .subtitle {
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

  :global(.dark-mode) .instructions {
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

  :global(.dark-mode) .instructions code {
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

  :global(.dark-mode) .event-log {
    background: #1e293b;
    border-color: #334155;
  }

  .event-log h2 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
  }

  .event-log-entry {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    background: #f1f5f9;
    border-left: 3px solid #3b82f6;
    font-size: 0.875rem;
    font-family: monospace;
    word-break: break-all;
  }

  :global(.dark-mode) .event-log-entry {
    background: #0f172a;
    border-left-color: #60a5fa;
  }

  .event-log-empty {
    color: #64748b;
    font-style: italic;
  }

  :global(.dark-mode) .event-log-empty {
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

  :global(.dark-mode) .badge {
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

Override CSS custom properties on the `cmdk-palette` element:

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
