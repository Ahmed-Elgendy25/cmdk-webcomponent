# Solid.js Integration (Props-Based Approach)

Use cmdk-wc web components in Solid.js by passing data as props.

## Installation

```shell
npm install cmdk-wc
```

## Setup

In `src/index.tsx`:

```typescript
import 'cmdk-wc';
import { render } from 'solid-js/web';
import App from './App';

render(() => <App />, document.getElementById('root')!);
```

## Basic Usage with Props

Use the component in your Solid component:

```typescript
import { createSignal } from 'solid-js';
import type { CmdkPageData } from 'cmdk-wc';

export default function App() {
  const [open, setOpen] = createSignal(true);
  const [currentPage, setCurrentPage] = createSignal('root');

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

  const handleSelect = (event: CustomEvent) => {
    const { id, label } = event.detail;
    console.log(`Selected: ${label} (${id})`);
  };

  const handlePageChange = (event: CustomEvent) => {
    const { page } = event.detail;
    setCurrentPage(page);
    console.log(`Navigated to: ${page}`);
  };

  return (
    <cmdk-palette
      open={open()}
      pages={pages}
      currentPage={currentPage()}
      placeholder="Search commands..."
      onCmdkSelect={handleSelect}
      onCmdkPage={handlePageChange}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    />
  );
}
```

## Event Handlers

- `onCmdkSelect` - User selected an item
- `onCmdkPage` - User navigated to a page
- `onCmdkInput` - Search input changed
- `onOpen` - Palette opened
- `onClose` - Palette closed

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
