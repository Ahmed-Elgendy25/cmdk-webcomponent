import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

let uid = 0;

@customElement('cmdk-group')
export class CmdkGroup extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    [role='group'] {
      display: flex;
      flex-direction: column;
    }

    .group-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--cmdk-muted);
      padding: 12px 8px 8px 8px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      text-rendering: optimizeLegibility;
    }
  `;

  @property({ type: String }) label = '';

  private labelId = `cmdk-group-label-${uid++}`;

  protected render() {
    return html`
      <div role="group" aria-labelledby=${this.labelId}>
        <div id=${this.labelId} class="group-label">${this.label}</div>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cmdk-group': CmdkGroup;
  }
}
