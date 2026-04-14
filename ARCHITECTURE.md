# cmdk-wc: Deep Technical Walkthrough

A comprehensive architectural and code-level analysis of the cmdk-wc command palette web component library.

---

## PART 1: HIGH LEVEL ARCHITECTURE

### 1. COMPONENT TREE

```
cmdk-palette                    (root, state owner, keyboard controller)
│
├── cmdk-input                  (search input + breadcrumb display)
│
├── cmdk-list                   (scroll container, role="listbox")
│   │
│   └── cmdk-group              (category heading + items container)
│       │
│       └── cmdk-item           (single selectable row)
│       └── cmdk-item
│       └── cmdk-item
│   │
│   └── cmdk-group              (another category)
│       │
│       └── cmdk-item
│       └── cmdk-item
│   │
│   └── cmdk-free-search-action (fallback: shown when no results)
│
└── keyboard-footer             (keyboard shortcuts reference, always visible)
```

Each component in this tree has a precise, limited responsibility that reflects the separation of concerns in the design.

**cmdk-palette** is the orchestrator. It owns all state (pages array, active page ID, search query, selected index, open flag), manages keyboard navigation globally (via a document-level listener for Cmd+K), handles all routing decisions (when to navigate vs. when to select), applies filtering to the data, and dispatches the public event API. It does NOT concern itself with rendering individual items or managing group styles—those are delegated down. The palette's job is pure state management and decision-making.

**cmdk-input** owns the search mechanism. It renders the search field and an optional breadcrumb showing the current page. It dispatches `cmdk-input` events whenever the user types, allowing cmdk-palette to update its search state. It does NOT manage focus globally—instead, cmdk-palette calls `focusInput()` imperatively when the palette opens. The input deliberately exposes this method so the parent controls when focus happens, not the input itself.

**cmdk-list** is a simple scroll container. It wraps a flexbox that respects the `--cmdk-list-max-height` CSS custom property and uses a webkit scrollbar for styling. It sets `role="listbox"` to establish the correct ARIA context but does NOT actively manage keyboard navigation or selection. Its sole purpose is visual: provide scrolling and styling. Filtering and display logic still happen in cmdk-palette.

**cmdk-group** is a visual grouping component. It has a heading label and acts as a container for cmdk-item children via a slot. It generates a stable unique ID for its label and uses ARIA attributes (`role="group"` + `aria-labelledby`) so screen readers understand the group structure. It does NOT filter items or manage selection.

**cmdk-item** represents a single command. It receives the full itemData object as a property. It renders the icon, label, and a type hint on the right side (showing "Link" if the item has `href`, "Action" if it has `onClick`, or nothing for navigation items). When clicked or activated via keyboard, it dispatches `cmdk-item-click` with the itemData. The parent (cmdk-palette) then decides what to do next. The item does NOT know if it's a link, action, navigation item, or what comes after selection.

**cmdk-free-search-action** is conditionally shown when search yields no results. It's a purely presentational component that echoes back what the user searched for. It has no state or events of its own.

**keyboard-footer** is a visual reference footer that displays all available keyboard shortcuts with icons and labels. It's purely presentational and does NOT handle any events. It renders keyboard shortcuts for:

- Arrow keys (↑↓) for navigation
- Enter key for selection
- Escape (Esc) for going back or closing
- Command key (⌘ on Mac, Ctrl on Windows) for toggling the palette

This footer is always visible at the bottom of the palette and follows accessibility best practices with ARIA labels and proper semantic HTML. It adapts to the current theme via CSS custom properties.

### 2. STATE OWNERSHIP

State lives in **cmdk-palette alone**. This is the key architectural choice. Here's what cmdk-palette owns and why:

```
cmdk-palette {
  pages: CmdkPageData[]     // full data tree provided by consumer
  open: boolean             // is the palette visible?
  page: string              // active page id (for drill-down)
  search: string            // current search query
  selectedIndex: number     // which item is highlighted (0-based)
}
```

**pages** must live in the palette because it is the source of truth. The consumer sets it once (or updates it), and the palette reads from it during filtering. If pages lived in a child component like cmdk-list, the palette would have no way to know what data is available and thus couldn't filter or calculate selectedIndex correctly.

**open** must be in the palette because opening/closing is coordinated globally. When the palette opens, it must focus the input, when it closes, focus returns to the trigger. When the user presses Escape, the palette must know whether to go back a page or close entirely. If open lived in cmdk-list or cmdk-input, it would fragment the logic.

**page** (active page ID) must be in the palette because navigation decisions happen here. When a user clicks an item with `page: 'projects'` set, cmdk-palette decides to set `this.page = 'projects'` and re-filter the list. If each cmdk-group managed its own "active page," navigation would require cross-component communication or complex event bubbling.

**search** must be in the palette because filtering is centralized. When cmdk-input emits `cmdk-input` with the new query, cmdk-palette updates `this.search`, which triggers a recalculation of the getter `_filteredLists`. All filtering logic lives in one place.

**selectedIndex** must be in the palette because keyboard navigation and mouse hover need to coordinate. ArrowUp/ArrowDown mutate it, Enter activates the item at selectedIndex, and the palette passes `selected={this._flatItems.indexOf(item) === this.selectedIndex}` to each cmdk-item to highlight the right one. If each cmdk-item managed its own selected state, a mouse hover on one item would have to somehow deselect all others—messy.

What would break if you moved state down the tree? If `search` moved to cmdk-input, the palette would have no way to know when to reset selectedIndex to 0 (should happen on every search). If `selectedIndex` moved to cmdk-list, keyboard events originating from cmdk-palette would have to propagate down, and the palette would lose control of the highlight. If `page` moved to cmdk-group, the palette would have to listen for page-change events from each group and synchronize them, rather than having one authoritative source.

### 3. DATA FLOW

Here's the complete journey of data in and out:

```
┌─────────────────────────────────────────────────────────────────┐
│ Consumer (JavaScript API)                                        │
│                                                                   │
│  palette.pages = [                                              │
│    { id: 'root', lists: [...] },                               │
│    { id: 'projects', lists: [...] }                            │
│  ]                                                               │
│  palette.open = true                                            │
│  palette.addEventListener('cmdk-select', handler)              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                     SET PROPERTIES
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ cmdk-palette                                                     │
│                                                                   │
│  pages = [...]  ◄─ Input data tree                             │
│  open = true    ◄─ Controls visibility                         │
│  page = 'root'  ◄─ Active page ID                              │
│                                                                   │
│  GET _filteredLists:                                           │
│    1. Find page by id: activePage = pages.find(p=>p.id=page) │
│    2. For each list in activePage.lists:                      │
│       - Filter items by search.toLowerCase()                  │
│       - Keep only lists with ≥1 matching items               │
│    Return: CmdkListData[]                                     │
│                                                                   │
│  GET _flatItems:                                              │
│    Return: [..._filteredLists'].flatMap(l => l.items)        │
│    Used to: map selectedIndex to the correct item            │
└──────────────────────────────────────────────────────────────────┘
                           │
                  FILTERED DATA→TEMPLATE
                           │
                           ▼
                   ┌────────────────────┐
                   │  render():         │
                   │  _filteredLists    │
                   │    .map(list ⟹     │
                   │  <cmdk-group>      │
                   │    .items.map      │
                   │  <cmdk-item>)      │
                   └────────────────────┘
                           │
                  Virtual DOM ⟹ DOM UPDATE
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ cmdk-item (rendered multiple times)                             │
│                                                                   │
│  @Input: itemData = { id, label, icon, href, page, ... }      │
│  @Input: selected = (selectedIndex === this._flatItems.indexOf) │
│                                                                   │
│  ON USER CLICK:                                                │
│    _onClick() ⟹ dispatchEvent('cmdk-item-click',              │
│                               { itemData })                     │
└──────────────────────────────────────────────────────────────────┘
                           │
              CUSTOM EVENT BUBBLES + COMPOSED
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ cmdk-palette (listens for cmdk-item-click)                      │
│                                                                   │
│  _onItemClick(event) {                                         │
│    itemData = event.detail.itemData                           │
│                                                                   │
│    IF itemData.page:                                          │
│      this.page = itemData.page  ◄─ NAVIGATE                  │
│      this.search = ''                                         │
│      Emit: { cmdk-page, { page } }                           │
│    ELSE:                                                       │
│      IF itemData.onClick: itemData.onClick()                 │
│      Emit: { cmdk-select, { id, label, href } }             │
│      IF closeOnSelect !== false: this.open = false           │
│  }                                                             │
└──────────────────────────────────────────────────────────────────┘
                           │
           PUBLIC EVENT DISPATCHED (bubbles + composed)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Consumer (event listener)                                        │
│                                                                   │
│  handler(e: CustomEvent) {                                     │
│    if (e.type === 'cmdk-select') {                            │
│      const { id, label, href } = e.detail                    │
│      // Handle selection                                      │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

The key insight: data flows DOWN via properties and filtered getters, events flow UP via CustomEvent. The palette is the only component that ever directly mutates state or makes decisions. Child components are deterministic functions of their input props.

### 4. EVENT ARCHITECTURE: TWO-LAYER SYSTEM

cmdk-wc uses a two-layer event system. Understanding this is crucial to understanding why the component is modular and why child components don't "know" about each other.

**Internal Events** (component-to-component communication):

- `cmdk-item-click` — fired from cmdk-item when user clicks or presses Enter
- `cmdk-input` — fired from cmdk-input when user types (search change)
- `cmdk-backspace-empty` — would fire if backspace is pressed on an empty search (currently not implemented, but the architecture supports it)

These events bubble through the shadow DOM with `bubbles: true, composed: true`, so cmdk-palette can catch them even though cmdk-item and cmdk-input are its shadow DOM children.

**Public Events** (component-to-consumer API):

- `cmdk-select` — fired from cmdk-palette when user selects a leaf item
- `cmdk-page` — fired from cmdk-palette when user navigates to a new page
- `cmdk-search` — fired from cmdk-palette when user changes the search query

These are what consumers listen to on the cmdk-palette element.

Why this separation? Consider what would happen if cmdk-item fired `cmdk-select` directly:

1. The palette would lose the decision-making layer. It wouldn't be able to distinguish between "item with page set" (should navigate) vs. "item with no navigation" (should close).
2. The palette would lose the opportunity to emit `cmdk-page` for navigation items. Consumers wouldn't know when pagination happened.
3. Complex item logic would live in cmdk-item. What if an item has _both_ `page` and `onClick`? What if `closeOnSelect` is false? These decisions belong in cmdk-palette, not buried in the item's click handler.

By funneling all item clicks through cmdk-palette's `_onItemClick()` handler, the palace becomes the single source of truth for "what happens when the user selects something." This is why cmdk-palette receives the full itemData object from cmdk-item—it needs all the metadata to make the decision.

Internal events are fired with `bubbles: true,composed: true` because they cross shadow DOM boundaries. Without `composed: true`, the event would stop at the shadow root and cmdk-palette wouldn't see it. Without `bubbles: true`, the event wouldn't propagate up at all.

### 5. SHADOW DOM BOUNDARIES

Each component encapsulates its DOM inside a shadow root. Here's what lives where and how data crosses the boundary:

**cmdk-palette** shadow DOM contains:

- `.overlay` — the modal backdrop (darkened background behind the palette)
- `.panel` — the main palette container (white box), which contains:
  - `cmdk-input` (child component, light DOM child)
  - `cmdk-list` (child component, light DOM child)
- Styles for layout and custom properties

The palette's shadow DOM also contains the keyboard event listener on `.panel`, which is why keyboard events originating from the input or items need to bubble through composed shadows. The overlay is inside the shadow DOM (not appended to document.body) because the modal should be scoped to the palette instance.

**cmdk-input** shadow DOM contains:

- `.input-wrapper` — flex container
- A search icon (SVG)
- An optional breadcrumb span
- An input element
- Styles for the input field and focus states

The actual text content of items is passed via a slot, but cmdk-input's shadow DOM renders the wrapper. The breadcrumb is computed by cmdk-palette and passed as a property, so cmdk-input just renders it—it doesn't fetch or compute it.

**cmdk-item** shadow DOM contains:

- `.item` — flex container with role="option"
- `.left` section: icon + label
- `.right` section: type hint badge
- A slot for the text content (filled by cmdk-palette's template)
- Styles for hover, selected states

The selected state is controlled externally (`selected` property from cmdk-palette), not managed by the item itself. The item just renders the badge based on `itemData.href` or `itemData.onClick`.

**cmdk-list** shadow DOM contains:

- `.list-container` — div with overflow:auto and webkit scrollbar styles
- A slot for cmdk-group children
- Styles for max-height and scrollbar styling

**cmdk-group** shadow DOM contains:

- A div with role="group"
- A `.group-label` div with the heading text
- A slot for cmdk-item children

**How data crosses shadow boundaries:**

1. **CSS Custom Properties** — These are the clearest example. Consumer sets `cmdk-palette { --cmdk-accent: purple; }` on the light DOM. The custom property cascades _through_ shadow DOM boundaries because CSS inheritance crosses shadows. Every nested component can use `var(--cmdk-accent)` in its styles, even though they're isolated shadow roots. This is why theming works so elegantly.

2. **Properties** — Values like `itemData`, `selected`, `breadcrumb` are passed as JavaScript properties on shadow DOM element instances. These don't cross the boundary by themselves—they're set directly via `ref.property = value`.

3. **Events** — Internal events use `bubbles: true, composed: true` to escape the shadow DOM. Events that don't have `composed: true` stop at the shadow root and can't reach the document. This is why all cmdk-wc internal events must have both flags.

4. **Slots** — Child elements provided to a component are rendered in the component's shadow DOM via `<slot>`. The slot is a rendering anchor, but the elements themselves stay in the light DOM. This is why cmdk-item and cmdk-group can style something inside the slot (via CSS), but the slot content is still technically in the light DOM.

Why does `composed: true` matter so much? Without it, when cmdk-item fires `cmdk-item-click`, the event travels up through cmdk-item's children but stops at its shadow root. The parent shadow root (cmdk-palette's) never sees it. With `composed: true`, the event enters the composed event path and traverses all shadow boundaries on its way up to the document root.

### 6. PAGE NAVIGATION (DRILL-DOWN)

The palette implements hierarchical navigation using a flat page map rather than a recursive tree. Understanding this design is key to understanding the entire system.

The pages array is a flat list of page objects:

```typescript
pages = [
  {
    id: 'root',
    lists: [
      { heading: 'Actions', items: [item1, item2] },
      { heading: 'Projects', items: [nav_to_projects] },
    ],
  },
  {
    id: 'projects',
    lists: [{ heading: 'Recent', items: [proj1, proj2] }],
  },
];
```

Each list in each page contains items. Some items have a `page` property (like `{ page: 'projects' }`). These are navigation items—when clicked, they navigate.

When the user clicks a navigation item:

1. cmdk-item fires `cmdk-item-click` with `itemData` containing `page: 'projects'`
2. cmdk-palette's `_onItemClick()` checks `if (item.page)`
3. It sets `this.page = 'projects'` and `this.search = ''`
4. It dispatches `cmdk-page` event so consumers know what happened
5. On next render, `_filteredLists` uses `this.page` to find and render the 'projects' page

When the user presses Escape:

1. If `this.page !== 'root'`, navigate back: set `this.page = 'root'` and clear search
2. If already on root, close the palette

Backspace (when search is empty) would navigate back similarly, but this isn't implemented yet.

Why a flat map instead of a recursive tree? The flat map makes breadcrumb rendering simple. You just display `this.page`. If pages were nested (each item could have children inline), you'd need to track a stack of page IDs to know where you are. The flat map is easier for consumers to reason about—they provide a simple array, not a complex tree structure.

The tradeoff: flat maps don't support deep hierarchies as naturally. If you need 3 levels of drill-down (root → projects → individual project), you create 3 pages and link them via page IDs. This is explicit but requires consumers to manage the nesting. A recursive tree would be more intuitive for deep hierarchies, but the flat map works perfectly for the typical use case (1-2 levels of navigation).

### 7. KEYBOARD NAVIGATION: STATE MACHINE

cmdk-palette implements keyboard navigation as a deterministic state machine. Here's the model:

```
┌────────────────────────────────────────────────────────────────────┐
│                          CLOSED STATE                               │
│                                                                      │
│  palette.open = false                                              │
│  palette.page = 'root' (or any page)                               │
│  palette.selectedIndex = undefined                                 │
│                                                                      │
│               ┌─────────────────────────────────────┐              │
│               │ Cmd+K pressed (document listener)  │              │
│               └────────────────┬────────────────────┘              │
│                                ▼                                    │
│                        this.open = true                            │
│                        REQUEST UPDATE                              │
│                        FOCUS INPUT                                 │
│                                │                                    │
└────────────────────────────────┼──────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                          OPEN STATE                                 │
│                                                                      │
│  palette.open = true                                               │
│  palette.page = 'root' (or other page)                             │
│  palette.selectedIndex = 0 (because _flatItems computed on render)│
│                                                                      │
│         ┌─────────────────────────────────────────────────┐        │
│         │  ArrowDown pressed                              │        │
│         │  selectedIndex = (idx + 1) % max(length, 1)   │        │
│         │  Wraps around to 0 at end                       │        │
│         └────────────────────┬────────────────────────────┘        │
│         ┌─────────────────────────────────────────────────┐        │
│         │  ArrowUp pressed                                │        │
│         │  selectedIndex = (idx - 1 + max(len, 1))       │        │
│         │                  % max(length, 1)              │        │
│         │  Wraps around to end at 0                       │        │
│         └────────────────────┬────────────────────────────┘        │
│         ┌─────────────────────────────────────────────────┐        │
│         │  Enter pressed                                  │        │
│         │  item = _flatItems[selectedIndex]              │        │
│         └────────────────┬───────────────────────────────┘        │
│                          ▼                                          │
│              _onItemClick(item) {                                  │
│                if (item.page)                                      │
│                  this.page = item.page  ◄─ NAVIGATE               │
│                  this.search = ''                                  │
│                  selectedIndex = 0 (resets)                       │
│                else                                                │
│                  this.open = false  ◄─ CLOSE                      │
│                  emit cmdk-select                                  │
│              }                                                      │
│         ┌─────────────────────────────────────────────────┐        │
│         │  Escape pressed                                 │        │
│         │  If page !== 'root':                           │        │
│         │    this.page = 'root'  ◄─ NAVIGATE BACK       │        │
│         │    this.search = ''                            │        │
│         │    selectedIndex = 0                           │        │
│         │  Else:                                          │        │
│         │    this.open = false  ◄─ CLOSE                │        │
│         └────────────────────┬────────────────────────────┘        │
│                              ▼                                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                         Back to CLOSED STATE
```

The state machine has some important properties:

**selectedIndex is always valid.** In `updated()`, if `selectedIndex >= _flatItems.length`, it resets to 0. This handles the case where filtering (via search) reduces the number of items. If you have 10 items selected at index 9, and search narrows it to 2 items, selectedIndex becomes 0.

**Wrapping behavior.** ArrowDown at the last item wraps to 0. ArrowUp at the first item wraps to the last. This is implemented via modulo arithmetic: `(idx + 1) % Math.max(length, 1)`. The `Math.max(..., 1)` ensures we never divide by zero or take modulo of 0.

**Search resets selection.** When the user types (new search query), `_onInputChange()` sets `selectedIndex = 0`. This is intuitive—filtering the list should reset the highlight to the top.

**Page navigation resets selection.** When navigating to a new page (or back), selectedIndex resets to 0.

### 8. FILTERING ALGORITHM

The filtering logic lives entirely in cmdk-palette's `_filteredLists` getter. This is a computed property that recalculates whenever `pages`, `page`, or `search` changes.

```typescript
get _filteredLists(): CmdkListData[] {
  // Step 1: Find the active page
  const activePage = this.pages.find((p) => p.id === this.page);
  if (!activePage) return [];

  // Step 2: Normalize search query to lowercase
  const query = this.search.toLowerCase();

  // Step 3: For each list in the active page, filter items
  return activePage.lists
    .map((list) => ({
      ...list,
      items: list.items.filter((item) =>
        item.label.toLowerCase().includes(query),
      ),
    }))
    // Step 4: Remove empty lists
    .filter((list) => list.items.length > 0);
}

get _flatItems(): CmdkItemData[] {
  return this._filteredLists.flatMap((list) => list.items);
}
```

**Step 1:** Find the active page object by id. If it doesn't exist, return an empty array. This prevents rendering stale data if someone navigates to a non-existent page.

**Step 2:** Normalize the search query to lowercase. This is done once here, not for every item comparison, which is more efficient.

**Step 3:** For each list, create a new list object with the same metadata but filter the items. An item is kept if its label (lowercase) includes the query. This is a substring match, not a fuzzy match. Fuzzy matching would be more sophisticated but also slower.

**Step 4:** Filter out lists that have zero matching items. If a list's items array is empty after filtering, we don't render it. The template won't create a cmdk-group with no children.

**Why filtering lives in cmdk-palette and not cmdk-list or cmdk-item:**

If filtering lived in cmdk-list, each list would have to know about the search query and filter its own items. This means passing search down to every list, and lists would duplicate the filtering logic. Also, the palette would lose the ability to count how many items match in total—crucial for keyboard navigation (selectedIndex needs to know the total count).

If filtering lived in cmdk-item, it would be even worse. Each item would have to know whether it matches the query, but items are rendered in a loop, so you'd be checking the query repeatedly.

By keeping filtering in cmdk-palette, the logic is centralized, efficient, and the palette maintains control over what's rendered.

### 9. FOCUS MANAGEMENT

Focus management is coordinated between cmdk-palette and cmdk-input, with the key operations being:

**When the palette opens:**

1. User presses Cmd+K or clicks a toggle button
2. `this.open = true` triggers a re-render and calls `updated()`
3. In `updated()`, if `open` changed: `this.updateComplete.then(() => { input?.focusInput() })`
4. `focusInput()` is a method on cmdk-input that calls `.focus()` on the input element
5. The input element now has focus
6. User can start typing immediately

**Why focus input on open?** Because the modal overlay means the user can't see or interact with the rest of the page. Focusing the input provides clear affordance that they can type. This is standard UX for command palettes.

**When the palette closes:**

1. User presses Escape or selects an item (closeOnSelect = true)
2. `this.open = false`
3. The overlay disappears
4. Focus should ideally return to the trigger button, but the palette doesn't know what the trigger button is
5. Consumer is responsible for managing this (e.g., if using vanilla JS, store a reference to the trigger and call `.focus()` in the cmdk-select handler)

The palette doesn't automatically return focus to the trigger because web components can't know what triggered them. They're designed to be framework-agnostic, so they can't assume a "trigger button" exists or where it is.

**Focus and Shadow DOM:**

cmdk-palette does not use `delegatesFocus: true` on its shadow root. This means focus events from shadow DOM children don't bubble out to the host. If it did use delegatesFocus, clicking the input would make it appear that the cmdk-palette element itself has focus, which could be useful but is not necessary here. The default behavior (focus stays on the real focused element inside the shadow) works fine.

**Overlay click and focus trapping:**

The overlay (backdrop) has `@click` listener that closes the palette. However, it has `tabindex="-1"`, so it's not focusable. If the user clicks the overlay, focus stays on the input, then the overlay click fires and closes the palette. This is okay because the input loses focus as soon as the palette disappears. This is different from focus trapping (which keeps focus inside the modal)—cmdk-wc doesn't trap focus, it just moves focus to the input when opening.

### 10. THEMING ARCHITECTURE

CSS custom properties are the bridge between the component's internal styles and the consumer's theme. This works because CSS custom properties cascade through shadowDOM boundaries.

When a consumer writes:

```css
cmdk-palette {
  --cmdk-accent: #7c3aed;
  --cmdk-bg: #1e1b4b;
}
```

This CSS rule sets custom properties on the cmdk-palette element. Inside cmdk-palette's shadow DOM, its styles reference these variables:

```css
:host {
  --cmdk-accent: #3b82f6; /* default light mode value */
}

.item[selected] {
  background-color: var(
    --cmdk-accent
  ); /* uses value from :host or from light DOM */
}
```

When the CSS engine evaluates `var(--cmdk-accent)` inside the shadow DOM, it looks up the cascade. It checks the shadow DOM first (`:host` defines a default), then looks outward to the light DOM ancestor (cmdk-palette element). If the consumer set `--cmdk-accent` there, that value wins.

This cascading works all the way down the component tree. Even though cmdk-item is nested inside cmdk-palette inside cmdk-list, when cmdk-item uses `var(--cmdk-accent)`, it eventually resolves to the value set on the cmdk-palette element.

**Why this works across shadow boundaries:**

CSS custom properties are specifically designed to cross shadow DOM boundaries. Most CSS properties don't cascade through shadows (e.g., you can't set `font-size` on a parent element and have it affect text inside web components). But custom properties are special—they're treated as inherited values for the purpose of cascading, so they always cross the shadow boundary.

**Limits of custom properties:**

Custom properties are powerful for colors, sizes, and simple values, but they can't express complex selectors or structure changes. You can't use custom properties to change which elements are rendered or rearrange the layout structure. You can only change values that existing CSS properties use.

If the design needed more flexibility—like different padding for items in different contexts, or conditional rendering of certain UI elements—you'd need to use `::part()` (CSS parts). A part is named, exported region of a shadow DOM that consumers can style with `::part(name)`. For example:

```css
cmdk-palette::part(item-label) {
  font-weight: bold;
}
```

The current palette doesn't use `::part()` because the design is simple enough for custom properties. But if consumers needed to style individual items differently or change internal structure, `::part()` would be the next abstraction level.

---

## PART 2: CODE LEVEL WALKTHROUGH

### 1. types.ts

```typescript
export interface CmdkItemData {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  page?: string;
  closeOnSelect?: boolean;
  onClick?: () => void;
}
```

**Why are these interfaces defined in a separate file?**

The types are the contract between the consumer and the component. By defining them once in a shared module and exporting them, consumers can import and use them in their own code. This ensures type safety—if someone creates an item data object, they can validate it against `CmdkItemData`. If the types were scattered across component files, consumers would have to define their own interfaces, leading to divergence and bugs.

The types file is separate from any component implementation because it represents the API boundary, not an implementation detail. Think of it as the "public header file" of the library.

**Why is `onClick` typed as `() => void` and not `(e: Event) => void`?**

`onClick` is a side-effect callback, not an event handler. It's called _after_ the palette has already made its decision to select the item. The item doesn't pass any information to the caller—the caller knows what item they registered and can decide what to do. If onClick received an event, it implies the caller might need to call `preventDefault()` or stop propagation, but that doesn't make sense here. The palette has already decided what to do with the click.

By typing it as `() => void`, the API is clearer: "when this item is selected, call this function for a side-effect." It's not an event handler in the DOM sense.

**Why does CmdkItemData have both `href` and `onClick`?**

An item can have either behavior:

- `{ href: 'https://example.com' }` — a link item. When selected, the palette emits cmdk-select, and the consumer can decide to navigate. The type hint shows "Link".
- `{ onClick: () => {...} }` — an action item. When selected, the callback fires and the palette emits cmdk-select. Type hint shows "Action".
- `{ page: 'projects' }` — a navigation item. When selected, the palette navigates to a new page. No type hint.
- Both `onClick` and `href` — the callback fires, then the palette emits cmdk-select with the href. Consumer decides if they want to navigate or not.

Why support both? Because different use cases exist. Some items are simple actions (open a menu, trigger a function), others are navigation (go to a section), and others are external links (open a URL). Having both properties allows a single item to support multiple roles.

**What happens if a consumer sets both `href` and `onClick`?**

In cmdk-item's render method:

```typescript
const typeHint = this.itemData.href
  ? 'Link'
  : this.itemData.onClick
    ? 'Action'
    : '';
```

It checks `href` first, so "Link" wins. The item is displayed as a link. In cmdk-palette's `_onItemClick`, the callback is invoked before the event is dispatched, so the order is:

1. `if (item.onClick) item.onClick()` — callback fires
2. Dispatch cmdk-select with the `href` in detail

This is deliberate. The callback is a side-effect that always runs. The consumer can then use the cmdk-select detail to decide what to do next. This is flexible—the item author and the consumer can each take different actions.

**Why is `closeOnSelect` optional with no default in the type — where is the default applied?**

The type defines `closeOnSelect?: boolean`, meaning it's optional and can be undefined. The default (true) is applied in the code:

```typescript
if (item.closeOnSelect !== false) {
  this.open = false;
}
```

This uses the pattern "if not explicitly false, then true." Why do it in code instead of in the type? Because the type should reflect reality—the property IS optional, it CAN be undefined. Putting a default in the type (`closeOnSelect?: boolean = true`) would be syntactically invalid in TypeScript interfaces. Defaults only apply in function parameters, not in types.

The philosophy here is: the type definition is pure data structure, the default behavior is implementation. Separating them makes the intent clear—the type says "you can optionally set this", the code says "if you don't, we assume true".

### 2. cmdk-item.ts

```typescript
@customElement('cmdk-item')
export class CmdkItem extends LitElement {
  @property({ type: Object }) itemData?: CmdkItemData;
  @property({ type: Boolean, reflect: true }) selected = false;
```

**Why does cmdk-item receive the full itemData object as a property instead of individual properties?**

Using a single object property makes several things possible:

1. **Atomic updates.** When the parent needs to re-render with new item data, it's one assignment, not five. No intermediate state.
2. **Type safety.** The component receives a full, validated CmdkItemData. It doesn't have to piece together partial properties.
3. **Evolution-friendly.** If the data model grows (add a new field like `subtitle`), the component can use it immediately without API changes.

The alternative—individual properties—would require:

```typescript
@property({ type: String }) id = '';
@property({ type: String }) label = '';
@property({ type: String }) icon?: string;
... etc
```

Then the parent would do:

```html
<cmdk-item
  .id="${item.id}"
  .label="${item.label}"
  .icon="${item.icon}"
  ...
></cmdk-item>
```

This is verbose, error-prone (easy to forget a property), and fragile (if the data structure changes, multiple places need updating).

By passing the whole object, the relationship is clear: "here's a command item, render it." The component doesn't care how many properties it has—it renders what it receives.

**Why is the selected property controlled externally by cmdk-palette instead of internally by cmdk-item itself?**

Selection is global state that affects multiple items. When the user presses ArrowDown, one item should be un-highlighted and another should be highlighted. This requires coordination.

If cmdk-item managed its own selected state:

```typescript
// Anti-pattern: item manages its own selection
class CmdkItem {
  @property() selected = false;

  _onClick() {
    this.selected = true;  // self selects
    this.dispatchEvent(...);
  }
}
```

Then when ArrowDown is pressed, the palette would have to:

1. Find all cmdk-item elements
2. Set the previous one's selected to false
3. Set the new one's selected to true
4. Keep track of which item is currently selected

This is a nightmare. The state is fragmented. Every item has `selected`, but only one should be true. If the palette needs to deselect all items (e.g., when search changes), it has to iterate and reset each one.

By making selection external, the palette is the source of truth:

```typescript
// Correct: palette controls selection
palette.selectedIndex = 2;

// Template renders:
${item.map((item, idx) =>
  html`<cmdk-item ?selected=${idx === palette.selectedIndex}></cmdk-item>`
)}
```

Now: there is one selected value. The palette computes which index should be selected. Each item simply renders whether it's selected or not. If search changes, the palette resets selectedIndex to 0, and all items automatically update.

This is the core principle: **state that affects multiple items should live in the container, not in the items.** Items are dumb views of external state.

**Walk through \_onClick and \_onKeydown handlers:**

```typescript
private _onClick(e?: Event) {
  if (e) {
    e.stopPropagation();  // Don't let click bubble to parent listeners
  }
  if (this.itemData) {
    this.dispatchEvent(
      new CustomEvent('cmdk-item-click', {
        detail: { itemData: this.itemData },
        bubbles: true,
        composed: true,  // Cross shadow DOM boundary
      }),
    );
  }
}

private _onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    e.stopPropagation();
    this._onClick();
  }
}
```

When the user clicks the item's div:

1. `_onClick` fires
2. `e.stopPropagation()` stops the event from bubbling further in the light DOM (though events within shadow DOM don't bubble out anyway)
3. A custom event `cmdk-item-click` is dispatched with the itemData in the detail
4. `bubbles: true` means this event will bubble up through the DOM tree
5. `composed: true` means it will cross shadow DOM boundaries (without this, it stops at the shadow root)
6. The parent (cmdk-palette) listens for `cmdk-item-click` and responds

When the user presses Enter or Space:

1. `_onKeydown` fires
2. `preventDefault()` stops the browser's default behavior (Space usually scrolls the page, Enter usually submits forms)
3. `stopPropagation()` prevents the event from bubbling
4. Call `_onClick()` to dispatch the same custom event

Why is the keyboard handler separate from the click handler? Because the keyboard event needs to prevent default and stop propagation to prevent unintended side-effects. The click handler just needs to dispatch the custom event.

Why does \_onClick take an optional event parameter? Because it's called from two places:

- From `@click=${this._onClick}` (event passed)
- From keyboard handler: `this._onClick()` (no event passed)

The optional parameter makes both call sites work.

**Explain the right-side type hint rendering logic:**

```typescript
const typeHint = this.itemData.href
  ? 'Link'
  : this.itemData.onClick
    ? 'Action'
    : '';
```

This is a cascading check:

1. If href is set → "Link"
2. Else if onClick is set → "Action"
3. Else nothing

Why no hint for navigation items (those with `page` set)? Because navigation items don't need a hint. The user already sees them in context (e.g., "View All Projects" in the Projects group). The hint is for items that do something non-obvious (like "Click me to go to a URL" or "This is just an action").

**Why is tabindex="0" hardcoded and not conditional?**

```typescript
<div class="item" role="option" tabindex="0" ...>
```

`tabindex="0"` makes the item focusable and places it in the natural tab order. Why hardcode it?

Because every item should be keyboard-focusable. If an item were not focusable (tabindex unset), users can't reach it with Tab. Screen reader users wouldn't be able to interact with it. By hardcoding it, the component guarantees that all items are interactive.

The palette never puts focus on items (that's the job of the highlighted state and arrow key navigation). But making items focusable ensures they're semantically interactive and keyboard-accessible for users who tab through.

**What does role="option" require from its parent to be valid ARIA?**

`role="option"` is a child role. According to ARIA specs, the parent must have one of these roles:

- `role="listbox"` (which cmdk-list has)
- `role="combobox"` (which cmdk-palette has)
- `role="menu"`

The parent also defines the scope of selection. In our case, cmdk-list has `role="listbox"`, so each cmdk-item is an option within that listbox. The listbox is responsible for managing which option is selected (which cmdk-palette does by setting the `selected` property).

This ARIA structure tells screen readers the relationship:

- "This is a list box"
- "These are options in the list"
- "This option is currently selected"

### 3. cmdk-group.ts

```typescript
let uid = 0;

@customElement('cmdk-group')
export class CmdkGroup extends LitElement {
  private labelId = `cmdk-group-label-${uid++}`;
```

**Explain the module-level counter pattern for stable unique IDs.**

A module-level counter (`let uid = 0`) increments each time a cmdk-group instance is created. Each group gets a unique ID based on this counter.

Why not use `Math.random()` or `crypto.randomUUID()`?

1. **Stability.** If you create a group and give it ID "0.123456", then later re-render, if you create the ID again via random, you get a different ID. The `aria-labelledby` reference breaks. With a counter, the first group created gets "cmdk-group-label-0", the second gets "cmdk-group-label-1", and this never changes.

2. **Predictability.** In debugging, IDs are human-readable. "cmdk-group-label-3" is obvious. Random IDs are not.

3. **Performance.** Counter increment is O(1) and trivial. `crypto.randomUUID()` involves OS-level randomness generation, which is slower.

4. **Serialization.** If you ever need to serialize the DOM to HTML (for SSR), random IDs change on each render. Counter IDs are stable.

**Why does the ID need to be stable (generated once in constructor, not in render)?**

Because ARIA attributes (`aria-labelledby`) reference the ID. If the ID changes on every render, the reference becomes broken. The ID should be generated once when the element is created and then reused forever.

Lit's `render()` is called on every update, so if you generated the ID there, it would change on every render. By generating it in the constructor, the ID is stable from creation to destruction.

```typescript
private labelId = `cmdk-group-label-${uid++}`;  // Once per instance
```

This runs once, when the instance is created. It never runs again.

**Explain the hidden property:**

Actually, cmdk-group doesn't have a hidden property visible in the provided code. But the principle that applies here: whether a group is hidden should be controlled by the parent (cmdk-palette) filtering mechanism. If a search matches no items in a group, that group doesn't render at all (cmdk-palette filters it out). The group doesn't hide itself.

If groups could hide themselves, the palette would have to communicate who should be hidden, and groups would duplicate filtering logic.

**What is the role="group" + aria-labelledby contract?**

```typescript
<div role="group" aria-labelledby=${this.labelId}>
  <div id=${this.labelId} class="group-label">${this.label}</div>
  <slot></slot>
</div>
```

This creates an ARIA relationship:

- The div has `role="group"`, claiming to be a group
- It has `aria-labelledby=${labelId}`, saying "my label is the element with id=${labelId}"
- The label div has that matching id
- Screen readers then announce: "Group: [label text]" when entering the group

This makes the hierarchy clear for screen reader users. Without it, a group heading is just text—screen readers don't know it's labeling the group.

The pattern is important because it makes the API semantic. Instead of a group being just a container, it becomes an semantically meaningful unit with a label.

### 4. cmdk-list.ts

```typescript
@customElement('cmdk-list')
export class CmdkList extends LitElement {
  static styles = css`
    .list-container {
      overflow: auto;
      max-height: var(--cmdk-list-max-height);
      padding: 8px 0;
    }
  `;

  protected render() {
    return html`
      <div class="list-container" role="listbox">
        <slot></slot>
      </div>
    `;
  }
}
```

**Why does cmdk-list exist as a separate component at all? Could its styles just live in cmdk-palette?**

cmdk-list could be removed and its styles could move to cmdk-palette's template:

```typescript
// Alternative: no cmdk-list component
<div class="list-container" role="listbox">
  ${_filteredLists.map(list => ...)}
</div>
```

But there are reasons to keep it:

1. **Separation of concerns.** The scroll container is a separate concern from the palette's state management. It makes the code more modular and testable.
2. **Composability.** Consumers could theoretically extend cmdk-list (though they don't currently). Having it as a named component makes this possible.
3. **Nesting clarity.** `cmdk-palette > cmdk-list > cmdk-group` is clearer than `cmdk-palette > div > cmdk-group`. Whoever reads the code knows there's a scroll container in between.
4. **Scrollbar styling.** The webkit scrollbar pseudo-elements (`::-webkit-scrollbar`, `::-webkit-scrollbar-thumb`) are set in cmdk-list. If this code were in cmdk-palette, the styles file would be longer and less focused.
5. **CSS custom properties.** `max-height: var(--cmdk-list-max-height)` is set here. Having this in a dedicated component makes it clear what CSS properties affect what part of the UI.

The cost is minimal: one extra component in the tree. The benefit is clarity and modularity.

**Explain role="listbox" and why it is the correct ARIA role here vs role="list":**

- `role="list"` (with children `role="listitem"`) is for semantic lists of information. Each list item is a separate thing. This role doesn't indicate selection.
- `role="listbox"` (with children `role="option"`) is for selectable lists. The parent manages which option is selected. This role is designed for interactive selections.

cmdk-list creates a `role="listbox"` with children `role="option"` because items are selectable. Picking `role="list"` would be wrong—it implies a simple information list where nothing is being selected. `role="listbox"` tells screen readers "this is an interactive list where you can select items."

The ARIA hierarchy also affects keyboard behavior. Screen reader users might expect different shortcuts for listbox vs list.

**Why is max-height a CSS custom property and not a fixed value?**

```css
max-height: var(--cmdk-list-max-height);
```

Default is `--cmdk-list-max-height: 400px`, but a consumer can override it:

```css
cmdk-palette {
  --cmdk-list-max-height: 600px;
}
```

Why make it customizable? Because different use cases have different screen sizes and preferences. On mobile, 400px might be too tall. In a desktop app with lots of space, it might be too short. By exposing it as a custom property, consumers can tune it for their context without having to fork the component or use CSS specificity hacks.

Custom properties are the right abstraction for layout values that consumers might want to tune. If it's a value that should never change, it shouldn't be a custom property—it should be hardcoded. But max-height is a good candidate for customization.

### 5. cmdk-input.ts

```typescript
@customElement('cmdk-input')
export class CmdkInput extends LitElement {
  @property({ type: String }) value = '';
  @property({ type: String }) breadcrumb = '';

  focusInput() {
    this._inputEl?.focus();
  }
```

**Walk through the breadcrumb rendering logic:**

```typescript
${this.breadcrumb
  ? html`<span class="breadcrumb"
      >${this.breadcrumb}<span class="sep"> / </span></span
    >`
  : ''}
```

If breadcrumb is set (non-empty string), render it with a trailing separator. If empty, render nothing.

When does breadcrumb appear? When the user is not on the 'root' page. In cmdk-palette's template:

```typescript
<cmdk-input
  .value=${this.search}
  .breadcrumb=${this.page !== 'root' ? this.page : ''}
  @cmdk-input=${this._onInputChange}
></cmdk-input>
```

When on 'root': breadcrumb = '' (empty, hidden)
When on 'projects': breadcrumb = 'projects' (shown as "projects / ")

The breadcrumb shows the current page, so you always know where you are in the drill-down.

**Explain the two events this component dispatches: cmdk-input and cmdk-backspace-empty:**

Currently only `cmdk-input` is implemented:

```typescript
private _onInput(e: Event) {
  const input = e.target as HTMLInputElement;
  this.value = input.value;
  this.dispatchEvent(
    new CustomEvent('cmdk-input', {
      detail: { query: input.value },
      bubbles: true,
      composed: true,
    }),
  );
}
```

This fires on every keystroke. The detail contains the current query string.

`cmdk-backspace-empty` is mentioned in the architecture but not implemented. The idea would be:

```typescript
private _onKeydown(e: KeyboardEvent) {
  if (e.key === 'Backspace' && this.value === '') {
    this.dispatchEvent(
      new CustomEvent('cmdk-backspace-empty', {
        bubbles: true,
        composed: true,
      }),
    );
  }
}
```

This would fire when backspace is pressed on an empty search. cmdk-palette could listen and navigate back one page (if not on root).

Why are they separate events? Because they represent different user intents:

- `cmdk-input` — "I'm searching" (every keystroke)
- `cmdk-backspace-empty` — "I want to go back" (specific action)

Combining them would require always checking if the search is empty, or the consumer would have to parse the detail object to figure out what happened. Separate events make the intent clear.

**Why does this component use delegatesFocus: true?**

Actually, looking at the code, it doesn't use `delegatesFocus: true`. That would be a shadow root option:

```typescript
constructor() {
  super();
  this.attachShadow({ mode: 'open', delegatesFocus: true });
}
```

With `delegatesFocus: true`, focusing any focusable element inside the shadow DOM makes it appear that the host element has focus. For example, pressing Tab to navigate to the input would show focus on the cmdk-input element itself, not on the input inside.

cmdk-input could benefit from `delegatesFocus: true` because it's a form input. Users expect to focus the "input component," not an internal div. But Lit handles this automatically when you extend LitElement—focus delegation is often enabled by default in many Lit setups.

Actually, reviewing Lit's default behavior: Lit's LitElement does NOT enable delegatesFocus by default. Each component explicitly opts in if needed. cmdk-input doesn't opt in, so it uses the default (delegatesFocus: false).

In practice, this means:

- If you Tab to an item, focus goes to the item (the div, actually, via tabindex="0")
- If you Tab to the input, focus goes to the input element inside

This is fine. Most interactive components don't need delegatesFocus because the real focusable element (the input field) IS interactive, so users get the expected behavior.

**Why is the search icon before the input in DOM order, and how does :focus-within fix the focus style that ~ sibling selector broke?**

```typescript
<svg>...</svg>
<input type="text" ... />
```

The SVG icon comes first. When you add a `<span>` for the breadcrumb, it comes after the SVG but before the input:

```typescript
<svg>...</svg>
${breadcrumb ? html`<span class="breadcrumb">...</span>` : ''}
<input type="text" ... />
```

Now you want the icon to change color when the input is focused. The CSS would be:

```css
input:focus ~ svg {
  color: var(--cmdk-accent);
}
```

But this doesn't work because `~` (general sibling selector) only targets elements _after_ the reference. The SVG is _before_ the input, so this selector won't match.

The solution is `:focus-within`:

```css
.input-wrapper:focus-within svg {
  color: var(--cmdk-accent);
}
```

`:focus-within` matches an element if it or any of its descendants have focus. So when the input has focus, the parent (input-wrapper) matches `:focus-within`, and we can style the SVG (which is a sibling of the input but a child of the same wrapper).

This is the correct pattern for styling siblings based on focus when the order doesn't allow `~` to work.

### 6. cmdk-palette.ts (MOST IMPORTANT)

This is the orchestrator. I'll go through it section by section.

**@property decorators and reflection:**

```typescript
@property({ type: Array }) pages: CmdkPageData[] = [];
@property({ type: String, reflect: true }) page = 'root';
@property({ type: Boolean, reflect: true }) open = false;
@property({ type: String }) search = '';
```

- `pages`: type Array, not reflected. Consumers set it as a property (`palette.pages = data`), but it's not an HTML attribute. This is correct because an array can't be serialized to an attribute.
- `page`: type String, reflected to attribute. This means when `this.page = 'projects'` is set in code, it also appears as `<cmdk-palette page="projects">` in the DOM. Reflection is useful for debugging and for CSS attribute selectors (e.g., `cmdk-palette[page="projects"]`).
- `open`: type Boolean, reflected. When `this.open = true`, the element gets `open` attribute.
- `search`: type String, not reflected. It's internal state that consumers don't directly set using the property. (They set it indirectly by the user typing in the input.)

Reflection (`reflect: true`) should be used when the property is relevant to consumers reading the DOM. `page` and `open` are visible to someone inspecting the element. `search` is internal plumbing—consumers don't need to see it in the DOM.

**The updated() lifecycle method:**

```typescript
protected updated(changedProperties: any) {
  // Reset selection when filtered lists change
  if (this.selectedIndex >= this._flatItems.length) {
    this.selectedIndex = 0;
  }

  // Focus input when opened
  if (changedProperties.has('open') && this.open) {
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector('cmdk-input') as any;
      input?.focusInput?.();
    });
  }
}
```

Lit calls `updated()` after the component has rendered. Here we do post-render side-effects:

1. **Selection reset.** After filtering (which might happen if search or pages changed), check if selectedIndex is still valid. If there are 5 items and selectedIndex is 7, reset to 0. This ensures the selected item always exists.

2. **Focus input on open.** If `open` changed to true, we want to focus the input so the user can immediately start typing. Why use `updateComplete.then()`? Because `updated()` is called before the shadow DOM is fully updated. We wait for `updateComplete` (a Promise that resolves when all rendering is done), then query for cmdk-input. If it doesn't exist or doesn't have focusInput, the optional chaining (`?.`) prevents an error.

Actually, Lit provides a utility for property tracking:

```typescript
if (changedProperties.has('open')) {
  const wasOpen = changedProperties.get('open');
  if (!wasOpen && this.open) {
    // transitioned from closed to open
  }
}
```

The provided code doesn't use this, it just checks `changedProperties.has('open') && this.open`. This means "if open changed AND it's now true." This works but misses the case where someone sets `open = true` twice in a row (the second time, open would be true but it didn't change, so this code wouldn't run). This is a minor issue.

**Explain the \_filteredLists getter/computation in full detail:**

```typescript
get _filteredLists(): CmdkListData[] {
  const activePage = this.pages.find((p) => p.id === this.page);
  if (!activePage) return [];

  const query = this.search.toLowerCase();
  return activePage.lists
    .map((list) => ({
      ...list,
      items: list.items.filter((item) =>
        item.label.toLowerCase().includes(query),
      ),
    }))
    .filter((list) => list.items.length > 0);
}
```

1. Find the page object matching `this.page` ID. If it doesn't exist, return []. This handles the case where someone navigates to a non-existent page.

2. Get the query and normalize to lowercase. This is more efficient than lowercasing every item label during filtering.

3. For each list in the page, map it to a new list object with the same metadata (id, heading) but filtered items. An item is kept if its label includes the query.

4. Filter out lists with zero items. This is why we check `.length > 0` at the end.

The return value is a new array of lists, each containing only matching items.

Example:

```javascript
pages = [
  {
    id: 'root',
    lists: [
      { heading: 'Actions', items: [
        { id: 'new', label: 'New File' },
        { id: 'search', label: 'Search' }
      ]},
      { heading: 'Projects', items: [
        { id: 'nav', label: 'View Projects', page: 'projects' }
      ]}
    ]
  }
]
search = 'new'

_filteredLists returns:
[
  {
    heading: 'Actions',
    items: [
      { id: 'new', label: 'New File' }  // matches
      // 'Search' is filtered out
    ]
  }
  // 'Projects' group is filtered out because no items match
]
```

**Walk through \_onItemClick step by step:**

```typescript
private _onItemClick(e: Event) {
  const event = e as CustomEvent<{ itemData: CmdkItemData }>;
  const item = event.detail.itemData;

  if (item.page) {
    // Navigate to page
    this.page = item.page;
    this.search = '';
    this.selectedIndex = 0;
    this.dispatchEvent(
      new CustomEvent('cmdk-page', {
        detail: { page: this.page } as CmdkPageEventDetail,
        bubbles: true,
        composed: true,
      }),
    );
  } else {
    // Activate item (dispatch select and close)
    if (item.onClick) {
      item.onClick();
    }
    this.dispatchEvent(
      new CustomEvent('cmdk-select', {
        detail: {
          id: item.id,
          label: item.label,
          href: item.href,
        } as CmdkSelectEventDetail,
        bubbles: true,
        composed: true,
      }),
    );
    if (item.closeOnSelect !== false) {
      this.open = false;
    }
  }
}
```

The decision tree:

1. Receive a `cmdk-item-click` event with itemData in the detail.
2. Check if the item has a `page` property set.
3. **If it's a navigation item** (page is set):
   - Set the active page to the item's page
   - Clear the search (so we see all items in the new page)
   - Reset selectedIndex to 0 (highlight the first item)
   - Dispatch cmdk-page event so consumers know we navigated
   - Don't close the palette (navigation doesn't dismiss)
4. **If it's an action/link item** (no page):
   - If onClick is set, call it (side-effect)
   - Dispatch cmdk-select with the item's id, label, href
   - If closeOnSelect is not explicitly false, close the palette

The `closeOnSelect !== false` pattern is important. It means "close unless you explicitly set it to false." This makes most items (navigation items) default to closing, but the consumer can opt-out.

**Walk through the keyboard handler (\_onKeydown):**

```typescript
private _handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault();
      this.selectedIndex =
        (this.selectedIndex + 1) % Math.max(this._flatItems.length, 1);
      this.requestUpdate();
      break;
    }
    case 'ArrowUp': {
      e.preventDefault();
      this.selectedIndex =
        (this.selectedIndex - 1 + Math.max(this._flatItems.length, 1)) %
        Math.max(this._flatItems.length, 1);
      this.requestUpdate();
      break;
    }
    case 'Enter': {
      e.preventDefault();
      const item = this._flatItems[this.selectedIndex];
      if (item) {
        this._onItemClick(
          new CustomEvent('cmdk-item-click', {
            detail: { itemData: item },
          }),
        );
      }
      break;
    }
    case 'Escape': {
      e.preventDefault();
      if (this.page !== 'root') {
        this.page = 'root';
        this.search = '';
        this.selectedIndex = 0;
      } else {
        this.open = false;
      }
      break;
    }
  }
}
```

**ArrowDown:** Increment selectedIndex with wraparound. `Math.max(..., 1)` ensures we never modulo by 0 (if there are no items, length is 0, so we use 1 instead, making any index % 1 = 0). This keeps selectedIndex at 0 even with no items.

**ArrowUp:** Decrement with wraparound. The formula `(idx - 1 + max(len, 1)) % max(len, 1)` handles negative modulo correctly. In JavaScript, `-1 % 5` gives -1, not 4. By adding the divisor first, we get the correct positive result.

**Enter:** Activate the item at selectedIndex. Call \_onItemClick with a synthetic cmdk-item-click event. We don't use the real DOM event; we create a new CustomEvent with the item data.

**Escape:** If not on root page, navigate back to root. If on root, close the palette.

All keyboard handlers call `e.preventDefault()` to stop the browser's default behavior (like scrolling for ArrowDown).

**Explain the overlay click handler:**

```typescript
private _onOverlayClick() {
  this.open = false;
}
```

Attached via `@click=${this._onOverlayClick}` on the overlay div. When the user clicks the dark background, close the palette. This is a standard UX pattern for modals.

Why not check the event target? The template has:

```typescript
<div class="overlay" @click=${this._onOverlayClick} tabindex="-1">
  <div class="panel" ... @click=${(e: Event) => e.stopPropagation()} ...>
```

The panel stops propagation, so clicks on the panel don't bubble to the overlay handler. Only clicks on the bare overlay trigger it. This is why there's no target check—the event structure handles it.

**Explain the Cmd+K global listener:**

```typescript
private _setupGlobalKeyListener() {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.open = !this.open;
      if (this.open) {
        this.requestUpdate();
        this.updateComplete.then(() => {
          const input = this.shadowRoot?.querySelector('cmdk-input') as any;
          input?.focusInput?.();
        });
      }
    }
  });
}
```

This is called in the constructor. It attaches a global document-level listener for Cmd+K (Ctrl+K on Windows).

When the user presses Cmd+K:

1. Check if both `ctrlKey` (or `metaKey` for Mac) and the key is 'k'
2. Prevent the browser's default behavior
3. Toggle the palette open
4. If opening, request an update (to render the palette), then wait for the DOM to be ready, then focus the input

This global listener persists for the lifetime of the component. A problem: it's never removed! When the component is disconnected from the DOM (destroyed), the listener still exists. This is a memory leak.

The correct implementation would be:

```typescript
connectedCallback() {
  super.connectedCallback();
  this._setupGlobalKeyListener();
}

disconnectedCallback() {
  super.disconnectedCallback();
  document.removeEventListener('keydown', this._globalKeyListener);
}

private _globalKeyListener = (e: KeyboardEvent) => {
  // ...
};
```

By storing the listener as a property, we can remove it in disconnectedCallback. Without this, if the component is added and removed multiple times (or if multiple palettes are created), listeners accumulate.

**Walk through the render() method:**

```typescript
protected render() {
  return html`
    <div class="overlay" @click=${this._onOverlayClick} tabindex="-1">
      <div
        class="panel"
        role="combobox"
        aria-expanded="true"
        @keydown=${this._handleKeydown}
        @click=${(e: Event) => e.stopPropagation()}
        tabindex="0"
      >
        <cmdk-input
          .value=${this.search}
          .breadcrumb=${this.page !== 'root' ? this.page : ''}
          @cmdk-input=${this._onInputChange}
        ></cmdk-input>
        <cmdk-list>
          ${this._filteredLists.map(
            (list) => html`
              <cmdk-group label=${list.heading}>
                ${list.items.map(
                  (item) => html`
                    <cmdk-item
                      .itemData=${item}
                      ?selected=${this._flatItems.indexOf(item) ===
                      this.selectedIndex}
                      @cmdk-item-click=${this._onItemClick}
                    >
                      ${item.label}
                    </cmdk-item>
                  `,
                )}
              </cmdk-group>
            `,
          )}
          ${this._filteredLists.length === 0
            ? html`<cmdk-free-search-action
                .query=${this.search}
              ></cmdk-free-search-action>`
            : nothing}
        </cmdk-list>
      </div>
    </div>
  `;
}
```

1. **Root overlay:** Dark backdrop with `@click` handler. `tabindex="-1"` makes it not focusable.
2. **Panel:** The white box. `role="combobox"` indicates this is a combobox (search + list). `aria-expanded="true"` is incorrect (should be dynamic based on `this.open`). The panel catches keyboard events and click propagation.
3. **cmdk-input:** Passed search value and breadcrumb. Listens for cmdk-input events.
4. **cmdk-list:** Scroll container. Maps \_filteredLists to cmdk-group elements.
5. **cmdk-group:** For each list, creates a group with the heading. Maps item array to cmdk-item elements.
6. **cmdk-item:** For each item, sets itemData, selected={...}, and assigns the item label as the text content via the slot. Listens for cmdk-item-click.
7. **cmdk-free-search-action:** Shown if \_filteredLists.length === 0 (no results).

The computed selected property is important: `?selected=${this._flatItems.indexOf(item) === this.selectedIndex}`. This finds the index of the current item in the flat items array, then checks if it matches selectedIndex. If so, the item is highlighted.

**Explain the modal overlay pattern:**

```typescript
<div class="overlay" role="dialog" aria-modal="true" ...>
```

Wait, the code doesn't have `role="dialog"`. Let me check again... no, it just has the overlay div. In a proper modal implementation, it would have `role="dialog"` and `aria-modal="true"`. The current implementation is missing this.

With those attributes:

- `role="dialog"` tells screen readers this is a dialog.
- `aria-modal="true"` tells screen readers that interaction with the rest of the page is blocked.

This is important for accessibility. Screen readers should announce that the page is now in a modal state, and users shouldn't try to interact with content outside the modal.

The overlay is inside the shadow DOM (not appended to document.body) because the modal should be scoped to the component instance. If multiple palettes existed on a page, each has its own overlay. This is cleaner than fighting over a single document-level modal container.

### 7. index.ts

```typescript
export type {
  CmdkItemData,
  CmdkListData,
  CmdkPageData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
  CmdkInputEventDetail,
  Group,
  Item,
} from './types';

import './components/cmdkpalette';
import './components/cmdkinput';
import './components/cmdklist';
import './components/cmdkgroup';
import './components/cmdkitem';
import './components/cmdkfreesearchaction';
```

**Why does importing index.ts register the custom elements as a side effect?**

Each component file has `@customElement('cmdk-item')` etc. Decorators in TypeScript execute during class definition. When you `import './components/cmdkitem'`, TypeScript compiles it, the class is defined, and the decorator runs, calling `customElements.define('cmdk-item', CmdkItem)`.

The index.ts file doesn't explicitly call `customElements.define()`. It just imports the component modules. This _side-effect_ import ensures the decorators run and the elements are registered.

**What is the difference between importing index.ts and importing each component file individually?**

If you do:

```typescript
import 'cmdk-wc/dist/index.js';
```

You get all components and all type exports in one go. This is the recommended way for consumers.

If you do:

```typescript
import './components/cmdkitem.js';
```

You only get cmdk-item registered. The other components are not available.

If you do:

```typescript
import { CmdkItemData } from './types.js';
```

You only get the types, no components are registered.

The barrel export (index.ts) is a convenience. It gives consumers one entry point to import from, rather than having to know about all the internal structure.

**Why is the barrel export important for consumers using bundlers?**

When a bundler processes a library, it reads the `exports` field in package.json:

```json
{
  "name": "cmdk-wc",
  "exports": {
    ".": "./dist/index.js",
    "./types": "./dist/types.js"
  }
}
```

When a consumer does `import 'cmdk-wc'`, the bundler resolves it to `./dist/index.js` (per the exports config). This ensures they get the main barrel export, which registers all components and re-exports all types.

Without the barrel export, the default entry would be `./dist/index.html` or similar, which is wrong for a library. With it, the entry point is clear and intentional.

---

## PART 3: DESIGN DECISIONS & TRADEOFFS

### 1. WHY LIT?

Lit is a lightweight, modern library for building web components. It sits between "bare custom elements" and "full frameworks" on the spectrum:

**What Lit gives you over vanilla custom elements:**

1. **Templating language.** Lit's `html` template tag provides a syntax for creating dynamic DOM. Compare:

```typescript
// Vanilla
const div = document.createElement('div');
div.textContent = this.search;
shadow.appendChild(div);
// If search changes, you have to manually update or re-render

// Lit
<div>${this.search}</div>
// Automatically re-renders when this.search changes
```

2. **Reactivity and change detection.** Lit tracks property changes and automatically re-renders. With vanilla custom elements, you have to manually call `requestUpdate()` or manage the lifecycle yourself.

3. **Lifecycle hooks.** `updated()`, `firstUpdated()`, `shouldUpdate()` etc. provide predictable lifecycle points. Vanilla elements just have `connectedCallback()` and `disconnectedCallback()`.

4. **Decorators.** `@property`, `@customElement` etc. reduce boilerplate. With vanilla, you'd write more imperative code.

5. **CSS-in-JS.** Lit's `css` helper allows static styles as template literals with full TypeScript support. With vanilla, you're either writing strings or external files.

**What Lit does NOT give you that React would:**

1. **State management patterns.** React (via hooks) has well-established patterns for managing component state. Lit is more bare-bones. You're writing the state management yourself (like we see in cmdk-wc with the selectedIndex property).

2. **Developer tooling.** React has React DevTools, hot module reloading, huge community tooling. Lit has less ecosystem support.

3. **Unidirectional data flow by default.** React enforces top-down data flow (props down, events up). Lit allows this but doesn't enforce it as strongly.

4. **Virtual DOM.** React's virtual DOM provides diffing and efficient updates. Lit does DOM diffing for template literals, but it's less sophisticated.

5. **Component composition patterns.** React's JSX and hooks make it easy to build reusable component patterns. Lit uses web components standards, which are more explicit but less ergonomic.

**Tradeoffs of using Lit specifically for a framework-agnostic component library:**

The goal is to build components that work with _any_ framework. Lit achieves this by building on web component standards (custom elements, shadow DOM, slots, events) that all frameworks support.

_Advantages:_

- Web components work in vanilla JS, React, Vue, Svelte, Angular, etc.
- No framework lock-in for consumers
- Smaller bundle size than using a framework like React for the library

_Disadvantages:_

- Lit introduces a dependency that consumers must load (another JS library)
- If all consumers use React, using Lit is overkill. A React component library would be simpler.
- Lit's syntax is less familiar to React developers. Learning shadow DOM and custom events adds friction.

The tradeoff is worth it for a general-purpose library that needs to support many frameworks. If cmdk-wc were only for React apps, building it as a React component (not web components) would be simpler. But because it targets all frameworks, building on web components + Lit is the right choice.

### 2. WHY NOT A SINGLE COMPONENT?

cmdk-wc is split into 6 components. Why not just one big cmdk-palette that renders everything?

**The case for one big component:**

```typescript
@customElement('cmdk-palette')
export class CmdkPalette extends LitElement {
  // renders everything: overlay, input, list, items, etc.
  // all in one render() method
}
```

Benefits:

- Simpler mental model. One component = one thing to understand.
- Less indirection. No prop drilling through intermediate components.
- Smaller bundle (no overhead of 6 component definitions).

**The case for multiple components (what cmdk-wc does):**

Benefits:

1. **Separation of concerns.** Each component has one job. cmdk-item renders a row, cmdk-group renders a section, etc. The code is focused and testable.
2. **Composability.** If a consumer wants a different item renderer, theortically they could extend cmdk-item or provide a slot. With one big component, you'd have to fork or heavily patch.
3. **Reusability.** cmdk-group and cmdk-input could theoretically be reused in other contexts (though they're not currently). With one big component, they're locked inside.
4. **CSS organization.** Each component has its own styles. With one big component, the CSS would be monolithic.
5. **Performance (potential).** Lit can garbage-collect and recreate subtrees more efficiently. With one big component and dynamic arrays, the whole tree might re-render when only parts changed.

**Cost of multiple components:**

1. **Complexity.** More files, more components to define, more event plumbing.
2. **Bundle size.** Six custom element definitions instead of one.
3. **Indirection.** Understanding data flow requires tracing through multiple components.

Looking at the code, the tradeoff seems well justified. The components are small and focused. The data flow is clear. The architecture is modular. If cmdk-wc needed more features or more consumers wanted to customize it, this structure would pay dividends.

### 3. WHY PROPERTIES NOT ATTRIBUTES FOR PAGES DATA?

HTML attributes can only store strings. When you set:

```html
<cmdk-palette pages="[{...}]"></cmdk-palette>
```

The string "[{...}]" is stored as-is. JavaScript can read `element.getAttribute('pages')` and get that string, but it's not parsed as an object. The component would have to JSON.parse it:

```typescript
@property({ type: String })
get pagesString(): string { return this.getAttribute('pages') || ''; }

get pages(): CmdkPageData[] {
  try {
    return JSON.parse(this.pagesString);
  } catch {
    return [];
  }
}
```

This is error-prone. What if the JSON contains a function or dynamic data that can't be serialized? What if the JSON is malformed?

The solution: pass data as properties, not attributes.

```javascript
palette.pages = [{ id: 'root', lists: [...] }];
```

This assigns the JavaScript object directly. No serialization, no parsing, no string intermediary. The component receives the object and uses it.

**What would consumers have to do if this were attribute-based?**

1. Build the pages array in JavaScript
2. Serialize it to JSON
3. Set it as an HTML string attribute
4. The component parses it back to an object

```javascript
const pagesData = [{ id: 'root', lists: [...] }];
palette.setAttribute('pages', JSON.stringify(pagesData));
```

This is verbose, error-prone, and unnecessary.

**Why is this unacceptable?**

1. **Friction.** Every consumer has to remember to JSON.stringify. Easy to forget or mess up.
2. **Debugging.** Errors from JSON.parse are cryptic. "Unexpected token" doesn't tell you what went wrong.
3. **Reactivity.** If the consumer updates the pages array dynamically, they have to re-serialize and re-set the attribute. Reactive frameworks like React or Vue don't automatically do this.
4. **Size.** Serialized JSON is large. Objects in memory are smaller.

By using properties, the API is simpler, safer, and more efficient. This is why web component libraries almost always use properties for complex data, never attributes.

### 4. WHY FLAT PAGE MAP NOT RECURSIVE TREE?

The pages array is flat: each page has an id, and items link to page ids. An alternative would be recursive:

```typescript
// Flat (current)
pages = [
  { id: 'root', lists: [...] },
  { id: 'projects', lists: [...] }
]

// Recursive (alternative)
pages = [{
  id: 'root',
  lists: [{
    items: [{
      label: 'Projects',
      page: {           // nested!
        id: 'projects',
        lists: [...]
      }
    }]
  }]
}]
```

**What does the flat map make easier?**

1. **Breadcrumb rendering.** You just show `this.page` (the current page ID). Simple.
2. **Navigation logic.** Clicking an item: set `this.page = item.page`. No stack tracking.
3. **Serialization.** Flat arrays are easier to serialize, persist, fetch from an API.
4. **Reuse.** A page can be referenced from multiple items. In a recursive tree, you'd have to duplicate the structure or use references.

**What does the flat map make harder?**

1. **Deep hierarchies.** If you need 5 levels of drill-down, you create 5 pages and link them. This is explicit but verbose. A recursive tree would be more natural.
2. **Page discovery.** To find a specific page in a flat array, you iterate and search. In a tree, you might traverse.

**Why choose the flat map?**

The typical use case for a command palette is 1-2 levels of drilling (root → categories or root → projects). The flat map is simpler for this. If the use case were deeply hierarchical (file system browser, nested menus), a recursive tree might be better.

Also, the flat map is easier for consumers to construct. They don't have to think about nesting or recursion. They just create a list of pages and link them. This reduces cognitive load.

### 5. WHAT WOULD YOU DO DIFFERENTLY? (3 Improvements)

**Improvement 1: Remove The Global Keyboard Listener Memory Leak**

The current code:

```typescript
constructor() {
  super();
  this._setupGlobalKeyListener();  // added in constructor, never removed!
}

private _setupGlobalKeyListener() {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      ...
    }
  });
}
```

The listener is added but never removed. If the palette is destroyed and re-created, or if multiple palettes exist, listeners accumulate.

Better approach:

```typescript
private _globalKeyListener = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    this.open = !this.open;
    ...
  }
};

connectedCallback() {
  super.connectedCallback();
  document.addEventListener('keydown', this._globalKeyListener);
}

disconnectedCallback() {
  super.disconnectedCallback();
  document.removeEventListener('keydown', this._globalKeyListener);
}
```

By storing the listener as a property, we can remove it in `disconnectedCallback()`. This ensures listeners are cleaned up when the component is removed from the DOM.

Cost: Slightly more code. Benefit: No memory leaks, multiple palettes work correctly.

**Improvement 2: Track Page History With A Stack**

Currently, breadcrumb only shows the current page. If you navigate root → projects → individual project, you see:

```
Individual Project /
```

You don't see the full path. Also, if you want to add a "back" button (not just Escape), there's no history.

Better approach: Track page history as a stack:

```typescript
private pageStack: string[] = ['root'];

get currentPage(): string {
  return this.pageStack[this.pageStack.length - 1];
}

navigateTo(pageId: string) {
  this.pageStack.push(pageId);
  this.search = '';
  this.selectedIndex = 0;
}

navigateBack() {
  if (this.pageStack.length > 1) {
    this.pageStack.pop();
  }
}
```

The breadcrumb becomes:

```typescript
.breadcrumb=${this.pageStack.slice(1).join(' > ')}
// Outputs: "projects > individual" when navigating deep
```

Cost: More state to manage, slightly more code. Benefit: Full breadcrumb path, explicit back button possible, better UX for deep hierarchies.

**Improvement 3: Backspace Navigation**

The keyboard handler has a case for Escape but not for Backspace. The architecture mentions `cmdk-backspace-empty` but it's not implemented.

Better approach: Implement backspace navigation:

```typescript
private _handleKeydown(e: KeyboardEvent) {
  // ... other cases ...
  case 'Backspace': {
    if (this.search === '') {
      e.preventDefault();
      if (this.page !== 'root') {
        this.page = 'root';
        this.search = '';
        this.selectedIndex = 0;
        this.dispatchEvent(
          new CustomEvent('cmdk-page', {
            detail: { page: 'root' },
            bubbles: true,
            composed: true,
          }),
        );
      }
    }
    break;
  }
}
```

This makes navigation more intuitive. Users can press Backspace instead of Escape to go back.

Cost: A few more lines. Benefit: Better keyboard UX, Escape and Backspace both navigate back (Escape can still close on root).

---

## CONCLUSION

cmdk-wc demonstrates several excellent architectural principles:

1. **Centralized state.** All state lives in the palette. Child components are deterministic views.
2. **Two-layer events.** Internal events coordinate between components, public events are the API.
3. **Separation of concerns.** Each component has one clear job.
4. **Accessibility-first.** ARIA attributes are used throughout, keyboard navigation works well.
5. **Theming via CSS custom properties.** Simple, flexible, no framework dependencies.

The design is clean, the code is readable, and the component works well across frameworks. The main suggestions for improvement are around memory management and feature completeness, not architectural flaws.
