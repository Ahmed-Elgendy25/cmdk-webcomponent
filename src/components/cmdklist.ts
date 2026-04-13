import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('cmdk-list')
export class CmdkList extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .list-container {
      overflow: auto;
      max-height: var(--cmdk-list-max-height);
      padding: 8px 0;
    }

    .list-container::-webkit-scrollbar {
      width: 8px;
    }

    .list-container::-webkit-scrollbar-track {
      background: transparent;
    }

    .list-container::-webkit-scrollbar-thumb {
      background: var(--cmdk-border);
      border-radius: 4px;
    }

    .list-container::-webkit-scrollbar-thumb:hover {
      background: var(--cmdk-muted);
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

declare global {
  interface HTMLElementTagNameMap {
    'cmdk-list': CmdkList;
  }
}
