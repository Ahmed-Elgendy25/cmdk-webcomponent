import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type {
  CmdkPageData,
  CmdkListData,
  CmdkItemData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
} from '../types';
import './cmdkfooter';

@customElement('cmdk-palette')
export class CmdkPalette extends LitElement {
  static styles = css`
    :host {
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

    @media (prefers-color-scheme: dark) {
      :host {
        --cmdk-accent: #3b82f6;
        --cmdk-accent-hover: #2563eb;
        --cmdk-text: #f1f5f9;
        --cmdk-muted: #94a3b8;
        --cmdk-border: #334155;
        --cmdk-surface: #1e293b;
        --cmdk-bg: #0f172a;
        --cmdk-overlay: rgba(0, 0, 0, 0.6);
      }
    }

    :host(:not([open])) {
      display: none;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: var(--cmdk-overlay);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 80px;
      z-index: 1000;
      outline: none;
    }

    .panel {
      background: var(--cmdk-bg);
      border: 1px solid var(--cmdk-border);
      border-radius: var(--cmdk-radius);
      box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
      width: 100%;
      max-width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  `;

  @property({ type: Array }) pages: CmdkPageData[] = [];
  @property({ type: String, reflect: true }) currentPage = 'root';
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) search = '';

  private selectedIndex = 0;

  constructor() {
    super();
    this._setupGlobalKeyListener();
  }

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

  get _filteredLists(): CmdkListData[] {
    const activePage = this.pages.find((p) => p.id === this.currentPage);
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

  get _flatItems(): CmdkItemData[] {
    return this._filteredLists.flatMap((list) => list.items);
  }

  private _onOverlayClick() {
    this.open = false;
  }

  private _onInputChange(e: Event) {
    const event = e as CustomEvent<{ query: string }>;
    this.search = event.detail.query;
    this.selectedIndex = 0;

    this.dispatchEvent(
      new CustomEvent('cmdk-search', {
        detail: { query: this.search },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onItemClick(e: Event) {
    const event = e as CustomEvent<{ itemData: CmdkItemData }>;
    const item = event.detail.itemData;

    if (item.page) {
      // Navigate to page
      this.currentPage = item.page;
      this.search = '';
      this.selectedIndex = 0;
      this.dispatchEvent(
        new CustomEvent('cmdk-page', {
          detail: { page: this.currentPage } as CmdkPageEventDetail,
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
        if (this.currentPage !== 'root') {
          this.currentPage = 'root';
          this.search = '';
          this.selectedIndex = 0;
        } else {
          this.open = false;
        }
        break;
      }
    }
  }

  protected updated(changedProperties: any) {
    // Reset selection when filtered lists change
    if (this.selectedIndex >= this._flatItems.length) {
      this.selectedIndex = 0;
    }

    // Focus panel and input when opened
    if (changedProperties.has('open') && this.open) {
      this.updateComplete.then(() => {
        const panel = this.shadowRoot?.querySelector('.panel') as any;
        panel?.focus?.();
        const input = this.shadowRoot?.querySelector('cmdk-input') as any;
        input?.focusInput?.();
      });
    }
  }

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
            .breadcrumb=${this.currentPage !== 'root' ? this.currentPage : ''}
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
          <cmdk-footer></cmdk-footer>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cmdk-palette': CmdkPalette;
  }
}
