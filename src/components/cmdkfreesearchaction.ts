import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('cmdk-free-search-action')
export class CmdkFreeSearchAction extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .free-search {
      padding: 16px 8px;
      text-align: center;
      font-size: 13px;
      color: var(--cmdk-muted);
    }

    strong {
      color: var(--cmdk-text);
      font-weight: 600;
    }
  `;

  @property({ type: String }) query = '';

  protected render() {
    return html`
      <div class="free-search">Search for "<strong>${this.query}</strong>"</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cmdk-free-search-action': CmdkFreeSearchAction;
  }
}
