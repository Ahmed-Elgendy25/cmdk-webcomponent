# Angular Integration (Props-Based Approach)

Use cmdk-wc web components in Angular by passing data as props.

## Installation

```shell
npm install cmdk-wc
```

## Setup

In `app.config.ts` or your main module, ensure the components are loaded:

```typescript
import 'cmdk-wc';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
```

## Basic Usage with Props

Use the component in your Angular template:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { CmdkPageData } from 'cmdk-wc';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <cmdk-palette
      [attr.open]="open"
      [attr.pages]="pages | json"
      [attr.currentPage]="currentPage"
      placeholder="Search commands..."
      (cmdkSelect)="handleSelect($event)"
      (cmdkPage)="handlePageChange($event)"
      (open)="open = true"
      (close)="open = false"
    ></cmdk-palette>
  `,
})
export class AppComponent {
  open = true;
  currentPage = 'root';

  pages: CmdkPageData[] = [
    {
      id: 'root',
      lists: [
        {
          id: 'main',
          heading: 'Main',
          items: [
            { id: 'home', label: 'Home', icon: '🏠', href: '#' },
            { id: 'settings', label: 'Settings', icon: '⚙️', href: '#' },
            {
              id: 'projects',
              label: 'Projects',
              icon: '📁',
              page: 'projects',
              closeOnSelect: false,
            },
          ],
        },
        {
          id: 'other',
          heading: 'Other',
          items: [
            { id: 'help', label: 'Help', icon: '❓', href: '#' },
            {
              id: 'logout',
              label: 'Log out',
              icon: '🚪',
              onClick: () => alert('Logging out...'),
            },
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
            {
              id: 'hobby',
              label: 'Hobby project',
              icon: '🎮',
              onClick: () => alert('Opening hobby project...'),
            },
            {
              id: 'work',
              label: 'Work project',
              icon: '💼',
              onClick: () => alert('Opening work project...'),
            },
          ],
        },
      ],
    },
  ];

  handleSelect(event: CustomEvent) {
    const { id, label } = event.detail;
    console.log(`Selected: ${label} (${id})`);
  }

  handlePageChange(event: CustomEvent) {
    const { page } = event.detail;
    this.currentPage = page;
    console.log(`Navigated to: ${page}`);
  }
}
```

**Note:** Due to Angular's strict property binding, use `[attr.pages]="pages | json"` to pass object data as JSON.

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

## Event Handlers

- `(cmdkSelect)` - User selected an item
- `(cmdkPage)` - User navigated to a page
- `(cmdkInput)` - Search input changed
- `(open)` - Palette opened
- `(close)` - Palette closed

## Props Reference

| Prop          | Type           | Description                     |
| ------------- | -------------- | ------------------------------- |
| `open`        | boolean        | Whether the palette is visible  |
| `pages`       | CmdkPageData[] | Array of page data              |
| `currentPage` | string         | ID of the currently active page |
| `placeholder` | string         | Search input placeholder text   |
| `query`       | string         | Current search query            |
| `isLoading`   | boolean        | Show loading state              |

## Event Handlers

- `(cmdkSelect)` - User selected an item
- `(cmdkPage)` - User navigated to a page
- `(cmdkInput)` - Search input changed
- `(open)` - Palette opened
- `(close)` - Palette closed

## Props Reference

| Prop          | Type           | Description                     |
| ------------- | -------------- | ------------------------------- |
| `open`        | boolean        | Whether the palette is visible  |
| `pages`       | CmdkPageData[] | Array of page data              |
| `currentPage` | string         | ID of the currently active page |
| `placeholder` | string         | Search input placeholder text   |
| `query`       | string         | Current search query            |
| `isLoading`   | boolean        | Show loading state              |
