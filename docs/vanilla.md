# Vanilla JS Integration

Integrate cmdk-wc with vanilla JavaScript. No build tools or frameworks required—pure web components and DOM APIs.

## Installation

### Script Tag (CDN)

```html
<script src="https://cdn.jsdelivr.net/npm/cmdk-wc/dist/cmdk-wc.min.js"></script>
```

### ES Module Import

```javascript
import 'cmdk-wc';
```

## Full Example

Below is a complete, standalone HTML file that demonstrates all features:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>cmdk-wc Vanilla JS Demo</title>
    <script type="module">
      import 'cmdk-wc';
    </script>
    <style>
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

      body.dark {
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

      body.dark .subtitle {
        color: #cbd5e1;
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

      .controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
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

      body.dark .event-log {
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
        font-family: 'Monaco', 'Courier New', monospace;
        word-break: break-all;
      }

      body.dark .event-log-entry {
        background: #0f172a;
        border-left-color: #60a5fa;
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

      body.dark .badge {
        background: #312e81;
      }

      .instructions {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 2rem;
        color: #1e40af;
      }

      body.dark .instructions {
        background: #0f172a;
        border-color: #1e3a8a;
        color: #93c5fd;
      }

      .instructions p {
        margin: 0;
        line-height: 1.5;
      }

      .instructions code {
        background: rgba(255, 255, 255, 0.5);
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-family: monospace;
        font-size: 0.9em;
      }

      body.dark .instructions code {
        background: rgba(15, 23, 42, 0.5);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>cmdk-wc Vanilla JS</h1>
      <p class="subtitle">A command palette built with native web components</p>

      <div class="instructions">
        <p>
          Press <code>Cmd+K</code> (Mac) or <code>Ctrl+K</code> (Windows/Linux)
          to open the palette, or click the "Open Palette" button below. Use
          arrow keys to navigate, Enter to select, Escape to go back or close.
        </p>
      </div>

      <div class="controls">
        <button id="toggle-btn">Open Palette (Cmd+K)</button>
        <button id="clear-log">Clear Log</button>
        <button id="toggle-dark">Toggle Dark Mode</button>
      </div>

      <div class="event-log">
        <h2>Event Log</h2>
        <div id="log-content">
          <div class="event-log-empty">Waiting for events...</div>
        </div>
      </div>
    </div>

    <cmdk-palette id="palette"></cmdk-palette>

    <script>
      const palette = document.getElementById('palette');
      const toggleBtn = document.getElementById('toggle-btn');
      const clearLogBtn = document.getElementById('clear-log');
      const toggleDarkBtn = document.getElementById('toggle-dark');
      const logContent = document.getElementById('log-content');

      // Define the pages structure
      const pages = [
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
              ]
            },
            {
              id: 'other',
              heading: 'Other',
              items: [
                { id: 'help', label: 'Help', icon: '❓', href: '#' },
                { id: 'logout', label: 'Log out', icon: '🚪', onClick: () => alert('Logging out...') },
              ]
            }
          ]
        },\n        {\n          id: 'projects',\n          lists: [\n            {\n              id: 'projects-list',\n              heading: 'Projects',\n              items: [\n                { id: 'hobby', label: 'Hobby project', icon: '🎮', onClick: () => alert('Opening hobby project...') },\n                { id: 'work', label: 'Work project', icon: '💼', onClick: () => alert('Opening work project...') },\n              ]\n            }\n          ]\n        }\n      ];\n\n      // Initialize palette properties\n      palette.pages = pages;\n      palette.open = false;\n      palette.currentPage = 'root';

      // Toggle button functionality
      toggleBtn.addEventListener('click', () => {
        palette.open = !palette.open;
        updateButtonText();
      });

      // Clear log button
      clearLogBtn.addEventListener('click', () => {
        logContent.innerHTML = '<div class="event-log-empty">Waiting for events...</div>';
      });

      // Dark mode toggle
      toggleDarkBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
      });

      // Event handlers
      palette.addEventListener('cmdk-select', (e) => {
        logEvent('cmdk-select', {
          id: e.detail.id,
          label: e.detail.label,
          href: e.detail.href
        });
        palette.open = false;
        updateButtonText();
      });

      palette.addEventListener('cmdk-page', (e) => {
        logEvent('cmdk-page', { page: e.detail.page });
        updateButtonText();
      });

      palette.addEventListener('cmdk-search', (e) => {
        logEvent('cmdk-search', { query: e.detail.query });
      });

      // Watch for open state changes
      const observer = new MutationObserver(() => {
        updateButtonText();
      });

      observer.observe(palette, { attributes: true, attributeFilter: ['open'] });

      // Global keyboard shortcut (Cmd+K or Ctrl+K)
      document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          palette.open = !palette.open;
          updateButtonText();
        }
      });

      // Helper functions
      function updateButtonText() {
        toggleBtn.textContent = palette.open ? 'Close Palette' : 'Open Palette (Cmd+K)';
      }

      function logEvent(eventName, detail) {
        // Remove empty state if present
        if (logContent.querySelector('.event-log-empty')) {
          logContent.innerHTML = '';
        }

        const entry = document.createElement('div');
        entry.className = 'event-log-entry';

        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = eventName;

        const time = new Date().toLocaleTimeString();
        const detailStr = JSON.stringify(detail, null, 2);

        entry.appendChild(badge);
        entry.appendChild(document.createTextNode(`${time} — ${detailStr}`));

        logContent.insertBefore(entry, logContent.firstChild);

        // Keep only last 50 entries
        while (logContent.children.length > 50) {
          logContent.removeChild(logContent.lastChild);
        }
      }

      // Initialize button text
      updateButtonText();
    </script>
  </body>
</html>
```

## Key Rules

The integration pattern relies on three core principles:

**Properties must be assigned as JavaScript objects, not attributes.** When you write `palette.pages = [...]`, you are setting a JavaScript property on the DOM element. HTML attributes can only store strings. If you try `<cmdk-palette pages="[...]"></cmdk-palette>`, the pages property will receive the literal string `"[...]"` instead of the data structure. Always assign complex data using JavaScript.

**Event listeners must use `addEventListener()`, not HTML event attributes.** CustomEvents emitted by web components do not wire into React or Vue's event systems, and they are not recognized as native DOM events. Even in vanilla JS, the syntax is `palette.addEventListener('cmdk-select', handler)`, not `<cmdk-palette onCmdkSelect="handler">`. This ensures you receive the full CustomEvent object with its `detail` property intact.

**The script must run after the element exists in the DOM.** If you place your script in the `<head>`, the `cmdk-palette` element does not exist yet, and `document.getElementById('palette')` returns null. Either use `DOMContentLoaded`, place your script at the bottom of the `<body>`, or wrap DOM queries in a check. The example above uses `type="module"` which defers execution, and the script is at the bottom of the body.

## Keyboard Navigation

The palette responds to these keys:

- **Cmd+K** (Mac) or **Ctrl+K** — Toggle the palette open or closed globally.
- **Arrow Up / Arrow Down** — Move selection between visible items.
- **Enter** — Activate (select) the focused item. If the item has a `page` property, navigates to that page; otherwise, emits `cmdk-select`.
- **Escape** — Go back to the previous page. If already on the root page, close the palette.
- **Backspace** — Go back one page only if the search input is empty and you are not on the root page.

## Keyboard Shortcuts Footer

The palette displays a helpful footer with visual indicators for all available keyboard shortcuts:

- **↕️ ↑↓** - Navigate items using arrow keys
- **✓ Enter** - Select the highlighted item
- **⎋ Esc** - Go back to previous page or close palette
- **⌘ ⌘K** - Toggle palette open/closed (⌘ on Mac, Ctrl on Windows)

This footer is always visible at the bottom of the palette and serves as a quick reference guide for users. It follows accessibility best practices with proper ARIA labels and is fully responsive on mobile devices.

## Theming

Override CSS custom properties on the `cmdk-palette` element:

```html
<style>
  cmdk-palette {
    --cmdk-accent: #7c3aed;
    --cmdk-accent-hover: #6d28d9;
    --cmdk-bg: #581c87;
    --cmdk-text: #f3e8ff;
  }
</style>
```

See [Theming Guide](./theming.md) for complete reference and examples.
