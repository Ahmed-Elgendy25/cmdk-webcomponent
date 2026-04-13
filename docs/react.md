# React Integration

Integrate cmdk-wc with React. Learn how to work around React's limitations with web components and custom events.

## The Core Problem

React treats web components differently than native HTML elements in three crucial ways:

**React passes props as DOM attributes.** When you write `<cmdk-palette pages={data} />`, React attempts to set `pages` as an HTML attribute, not a JavaScript property. Since attributes only accept strings, your object becomes the string `"[object Object]"`. This breaks the component because it expects a real array.

**React doesn't recognize CustomEvents.** Event handlers like `onCmdkSelect` don't exist in React's type system. React only knows about standard DOM events. When the palette emits a `cmdk-select` CustomEvent, React's default event handling ignores it entirely.

**TypeScript has no types for custom elements.** Without type declarations, `<cmdk-palette>` is unknown to the JSX compiler, TypeScript complains, and you lose autocomplete.

The solution: use `useRef` to imperatively assign properties, `addEventListener` for custom events, and TypeScript type declarations.

## Installation

```shell
npm install cmdk-wc
```

Or from a local monorepo:

```shell
npm install ../path/to/cmdk-wc
```

## TypeScript Setup

Create or update `src/types/cmdk-wc.d.ts`:

```typescript
// Type definitions for cmdk-wc components
declare module 'cmdk-wc' {}

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

  // Palette element type
  interface CmdkPaletteElement extends HTMLElement {
    pages: CmdkPageData[];
    open: boolean;
    page: string;
  }

  // JSX namespace augmentation for all cmdk-* components
  namespace JSX {
    interface IntrinsicElements {
      'cmdk-palette': CustomElement<CmdkPaletteElement>;
      'cmdk-input': CustomElement<HTMLElement>;
      'cmdk-list': CustomElement<HTMLElement>;
      'cmdk-group': CustomElement<HTMLElement>;
      'cmdk-item': CustomElement<HTMLElement>;
      'cmdk-free-search-action': CustomElement<HTMLElement>;
    }
  }

  // Generic type for custom elements in React
  type CustomElement<T> = React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement> & {
      ref?: React.Ref<T>;
    },
    HTMLElement
  >;
}

export {};
```

## Registering the Components

In `src/main.tsx`, import the package at the top _before_ any other application code:

```typescript
import 'cmdk-wc';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

The side-effect import registers all custom elements globally.

## Basic Usage

Here's a minimal example showing the required patterns:

```typescript
import { useRef, useState, useEffect } from 'react';

export default function App() {
  const paletteRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // Assign pages data imperatively
  useEffect(() => {
    if (paletteRef.current) {
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
              ]
            }
          ]
        }
      ];
    }
  }, []);

  // Sync open state
  useEffect(() => {
    if (paletteRef.current) {
      paletteRef.current.open = open;
    }
  }, [open]);

  // Attach event listeners
  useEffect(() => {
    const palette = paletteRef.current;
    if (!palette) return;

    const handleSelect = (e: Event) => {
      const event = e as CustomEvent;
      console.log('Selected:', event.detail.label);
      setOpen(false);
    };

    palette.addEventListener('cmdk-select', handleSelect);
    return () => palette.removeEventListener('cmdk-select', handleSelect);
  }, []);

  return (
    <>
      <button onClick={() => setOpen(!open)}>
        Open Palette
      </button>
      {/* Note: open is set as a boolean property or 'undefined', not as an attribute */}
      <cmdk-palette ref={paletteRef} open={open || undefined} />
    </>
  );
}
```

## Full Example

Complete `src/App.tsx` with all features:

```typescript
import { useRef, useState, useEffect } from 'react';
import './App.css';

interface EventLogEntry {
  time: string;
  event: string;
  detail: Record<string, unknown>;
}

export default function App() {
  const paletteRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);

  // Define the pages structure
  const pages = [
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
            { id: 'projects-page', label: 'View All Projects', icon: '📁', page: 'projects' },
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

  // Assign pages imperatively
  useEffect(() => {
    if (paletteRef.current) {
      paletteRef.current.pages = pages;
    }
  }, []);

  // Sync open state to palette
  useEffect(() => {
    if (paletteRef.current) {
      paletteRef.current.open = open;
    }
  }, [open]);

  // Set up event listeners
  useEffect(() => {
    const palette = paletteRef.current;
    if (!palette) return;

    const handleSelect = (e: Event) => {
      const event = e as CustomEvent;
      addLog('cmdk-select', {
        id: event.detail.id,
        label: event.detail.label,
        href: event.detail.href
      });
      setOpen(false);
    };

    const handlePage = (e: Event) => {
      const event = e as CustomEvent;
      addLog('cmdk-page', { page: event.detail.page });
    };

    const handleSearch = (e: Event) => {
      const event = e as CustomEvent;
      addLog('cmdk-search', { query: event.detail.query });
    };

    palette.addEventListener('cmdk-select', handleSelect);
    palette.addEventListener('cmdk-page', handlePage);
    palette.addEventListener('cmdk-search', handleSearch);

    return () => {
      palette.removeEventListener('cmdk-select', handleSelect);
      palette.removeEventListener('cmdk-page', handlePage);
      palette.removeEventListener('cmdk-search', handleSearch);
    };
  }, []);

  const addLog = (event: string, detail: Record<string, unknown>) => {
    const time = new Date().toLocaleTimeString();
    setEventLog(prev => [
      { time, event, detail },
      ...prev
    ].slice(0, 50));
  };

  const handleGlobalKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(prev => !prev);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  }, []);

  return (
    <div className="app">
      <div className="container">
        <h1>cmdk-wc React Demo</h1>
        <p className="subtitle">
          A command palette built with native web components
        </p>

        <div className="instructions">
          <p>
            Press <code>Cmd+K</code> (Mac) or <code>Ctrl+K</code> (Windows/Linux) to open,
            or click the button below.
          </p>
        </div>

        <div className="controls">
          <button onClick={() => setOpen(!open)}>
            {open ? 'Close Palette' : 'Open Palette (Cmd+K)'}
          </button>
          <button onClick={() => setEventLog([])}>
            Clear Log
          </button>
        </div>

        <div className="event-log">
          <h2>Event Log</h2>
          {eventLog.length === 0 ? (
            <div className="event-log-empty">Waiting for events...</div>
          ) : (
            eventLog.map((entry, i) => (
              <div key={i} className="event-log-entry">
                <span className="badge">{entry.event}</span>
                <span>{entry.time} — {JSON.stringify(entry.detail)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Always render the palette, just hidden by default */}
      <cmdk-palette ref={paletteRef} />

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f8fafc;
          padding: 2rem;
          color: #0f172a;
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

        .controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .instructions {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 2rem;
          color: #1e40af;
        }

        .instructions code {
          background: rgba(255, 255, 255, 0.5);
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: monospace;
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

        .event-log h2 {
          margin-bottom: 1rem;
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

        .event-log-empty {
          color: #64748b;
          font-style: italic;
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
      `}</style>
    </div>
  );
}
```

## Common Errors and Fixes

| Error                                                                    | Cause                                                   | Fix                                                                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `Failed to resolve import "cmdk-wc"`                                     | Package not installed                                   | Run `npm install cmdk-wc` or `npm install ../path/to/cmdk-wc`                         |
| `Cannot find module or type declarations`                                | Missing TypeScript definitions                          | Create `src/types/cmdk-wc.d.ts` with proper `declare module` and `declare global`     |
| `Property 'cmdk-palette' does not exist on type 'JSX.IntrinsicElements'` | Wrong JSX namespace syntax                              | Use `declare module 'react'` with `namespace JSX` (not `declare global`)              |
| `Type 'HTMLElement' is not assignable to type 'CmdkPaletteElement'`      | Type mismatch on ref                                    | Use `useRef<HTMLElement>(null)` not `useRef<CmdkPaletteElement>(null)`                |
| `pages shows "[object Object]" in the DOM`                               | React set pages as attribute                            | Always assign via `ref.current.pages = data` in a `useEffect`, never in JSX           |
| `cmdk-select event never fires`                                          | Using `onCmdkSelect` prop instead of `addEventListener` | Remove `onCmdkSelect` and attach listener with `addEventListener('cmdk-select', ...)` |
| `React Strict Mode renders twice and events fire twice`                  | Event listeners attached twice                          | Use cleanup function: `return () => palette.removeEventListener(...)`                 |

## Pattern: Reusable Wrapper Component

Encapsulate all the boilerplate in a custom component. Create `src/components/CmdkPalette.tsx`:

```typescript
import { useRef, useEffect, ReactNode } from 'react';

interface CmdkPaletteProps {
  pages: CmdkPageData[];
  open: boolean;
  onSelect?: (detail: { id: string; label: string; href?: string }) => void;
  onPageChange?: (page: string) => void;
  onSearch?: (query: string) => void;
}

export function CmdkPalette({
  pages,
  open,
  onSelect,
  onPageChange,
  onSearch
}: CmdkPaletteProps) {
  const paletteRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (paletteRef.current) {
      paletteRef.current.pages = pages;
    }
  }, [pages]);

  useEffect(() => {
    if (paletteRef.current) {
      paletteRef.current.open = open;
    }
  }, [open]);

  useEffect(() => {
    const palette = paletteRef.current;
    if (!palette) return;

    const handleSelect = (e: Event) => onSelect?.((e as CustomEvent).detail);
    const handlePage = (e: Event) => onPageChange?.((e as CustomEvent).detail.page);
    const handleSearch = (e: Event) => onSearch?.((e as CustomEvent).detail.query);

    palette.addEventListener('cmdk-select', handleSelect);
    palette.addEventListener('cmdk-page', handlePage);
    palette.addEventListener('cmdk-search', handleSearch);

    return () => {
      palette.removeEventListener('cmdk-select', handleSelect);
      palette.removeEventListener('cmdk-page', handlePage);
      palette.removeEventListener('cmdk-search', handleSearch);
    };
  }, [onSelect, onPageChange, onSearch]);

  return <cmdk-palette ref={paletteRef} />;
}
```

Now use it simply in your app:

```typescript
<CmdkPalette
  pages={pages}
  open={open}
  onSelect={handleSelect}
  onPageChange={handlePage}
/>
```

## Theming

Pass CSS custom properties to `cmdk-palette`:

```typescript
<style>{`
  cmdk-palette {
    --cmdk-accent: #7c3aed;
    --cmdk-accent-hover: #6d28d9;
    --cmdk-bg: #581c87;
    --cmdk-text: #f3e8ff;
  }
`}</style>
```

See [Theming Guide](./theming.md) for complete reference.
