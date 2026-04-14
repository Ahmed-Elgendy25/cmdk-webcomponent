# React Integration (Props-Based Approach)

Use cmdk-wc web components in React by passing data as props.

## Installation

```shell
npm install cmdk-wc
```

## Setup

In `src/main.tsx`, import the components at the top:

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

## Basic Usage with Props

Pass data directly as props to the component:

```typescript
import { useState } from 'react';
import type { CmdkPageData } from 'cmdk-wc';

const pages: CmdkPageData[] = [
  {
    id: 'root',
    lists: [
      {
        id: 'main',
        heading: 'Main',
        items: [
          { id: 'home', label: 'Home', icon: '🏠', href: '#' },
          { id: 'settings', label: 'Settings', icon: '⚙️', href: '#' },
          { id: 'projects', label: 'Projects', icon: '📁', page: 'projects', closeOnSelect: false },
        ],
      },
      {
        id: 'other',
        heading: 'Other',
        items: [
          { id: 'help', label: 'Help', icon: '❓', href: '#' },
          { id: 'logout', label: 'Log out', icon: '🚪', onClick: () => alert('Logging out...') },
        ],
      },
    ],
  },
  {
    id: 'projects',
    lists: [
      {
        id: 'projects-list',
        heading: 'Projects',
        items: [
          { id: 'hobby', label: 'Hobby project', icon: '🎮', onClick: () => alert('Opening hobby project...') },
          { id: 'work', label: 'Work project', icon: '💼', onClick: () => alert('Opening work project...') },
        ],
      },
    ],
  },
];

export default function App() {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('root');

  const togglePalette = () => {
    setOpen(!open);
  };

  const handleSelect = (e: any) => {
    console.log('Selected:', e.detail);
  };

  const handlePageChange = (e: any) => {
    setCurrentPage(e.detail.page);
    console.log('Page changed:', e.detail);
  };

  return (
    <div>
      <button onClick={togglePalette}>
        {open ? 'Close Palette' : 'Open Palette'}
      </button>
      <cmdk-palette
        open={open}
        pages={pages}
        currentPage={currentPage}
        placeholder="Search commands..."
        onCmdkSelect={handleSelect}
        onCmdkPage={handlePageChange}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
```

## Event Handlers

The component emits custom events that can be handled via event attributes:

- `onCmdkSelect` - Fired when a user selects an item
- `onCmdkPage` - Fired when navigation to a different page occurs
- `onCmdkInput` - Fired when search input changes
- `onOpen` - Fired when the palette opens
- `onClose` - Fired when the palette closes

Example with full event handling:

```typescript
<cmdk-palette
  open={open}
  pages={pages}
  currentPage="home"
  placeholder="Search..."
  onCmdkSelect={(event: CustomEvent) => {
    const { id, label } = event.detail;
    console.log(`Selected: ${label} (${id})`);
  }}
  onCmdkPage={(event: CustomEvent) => {
    const { page } = event.detail;
    console.log(`Navigated to: ${page}`);
  }}
  onCmdkInput={(event: CustomEvent) => {
    const { query } = event.detail;
    console.log(`Search: ${query}`);
  }}
  onOpen={() => console.log('Opened')}
  onClose={() => console.log('Closed')}
/>
```

## Keyboard Shortcuts

The component supports the following keyboard interactions:

| Key                | Action                                |
| ------------------ | ------------------------------------- |
| `Cmd+K` / `Ctrl+K` | Toggle palette open/closed            |
| `Arrow Up`         | Select previous item                  |
| `Arrow Down`       | Select next item                      |
| `Enter`            | Activate selected item                |
| `Escape`           | Go back to root page or close palette |

Keyboard shortcuts work immediately when the palette is open without requiring additional focus.

## Keyboard Shortcuts Footer

The palette displays a helpful footer with visual indicators for all available keyboard shortcuts:

- **↕️ ↑↓** - Navigate items using arrow keys
- **✓ Enter** - Select the highlighted item
- **⎋ Esc** - Go back to previous page or close palette
- **⌘K** - Toggle palette open/closed (⌘ on Mac, Ctrl on Windows)

This footer is always visible at the bottom of the palette and serves as a quick reference guide for users. It follows accessibility best practices with proper ARIA labels and is fully responsive on mobile devices.

## Props Reference

| Prop          | Type           | Description                     |
| ------------- | -------------- | ------------------------------- |
| `open`        | boolean        | Whether the palette is visible  |
| `pages`       | CmdkPageData[] | Array of page data              |
| `currentPage` | string         | ID of the currently active page |
| `placeholder` | string         | Search input placeholder text   |
| `query`       | string         | Current search query            |
| `isLoading`   | boolean        | Show loading state              |

}, []);

return (
<>
<button onClick={() => setOpen(!open)}>
Open Palette
</button>
{/_ Note: open is set as a boolean property or 'undefined', not as an attribute _/}
<cmdk-palette ref={paletteRef} open={open || undefined} />
</>
);
}

````

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
````
