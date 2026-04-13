import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CmdkItemData } from '../types';

@customElement('cmdk-item')
export class CmdkItem extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 8px;
      margin: 0 8px;
      border-radius: var(--cmdk-radius);
      cursor: pointer;
      user-select: none;
      transition: background-color 0.15s ease-out;
    }

    .item:hover:not([selected]) {
      background-color: var(--cmdk-surface);
    }

    .item[selected] {
      background-color: var(--cmdk-accent);
      color: white;
    }

    .item[selected]:hover {
      background-color: var(--cmdk-accent-hover);
    }

    .left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
    }

    .right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .type-hint {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      padding: 2px 6px;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.1);
      color: var(--cmdk-muted);
      white-space: nowrap;
    }

    .item[selected] .type-hint {
      background: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.8);
    }
  `;

  @property({ type: Object }) itemData?: CmdkItemData;
  @property({ type: Boolean, reflect: true }) selected = false;

  private _onClick(e?: Event) {
    if (e) {
      e.stopPropagation();
    }
    if (this.itemData) {
      this.dispatchEvent(
        new CustomEvent('cmdk-item-click', {
          detail: { itemData: this.itemData },
          bubbles: true,
          composed: true,
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

  protected render() {
    if (!this.itemData) return nothing;

    const typeHint = this.itemData.href
      ? 'Link'
      : this.itemData.onClick
        ? 'Action'
        : '';

    return html`
      <div
        class="item"
        role="option"
        ?selected=${this.selected}
        tabindex="0"
        @click=${this._onClick}
        @keydown=${this._onKeydown}
      >
        <div class="left">
          ${this.itemData.icon
            ? html`<span class="icon">${this.itemData.icon}</span>`
            : html`<span class="icon"></span>`}
          <span class="label"><slot></slot></span>
        </div>
        <div class="right">
          ${typeHint
            ? html`<span class="type-hint">${typeHint}</span>`
            : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cmdk-item': CmdkItem;
  }
}
