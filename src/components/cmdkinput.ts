import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('cmdk-input')
export class CmdkInput extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--cmdk-border);
      gap: 12px;
      background: var(--cmdk-bg);
      transition: all 0.2s ease;
    }

    .input-wrapper:focus-within {
      background-color: var(--cmdk-surface);
    }

    svg {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      color: var(--cmdk-muted);
      transition: color 0.2s ease;
    }

    .input-wrapper:focus-within svg {
      color: var(--cmdk-accent);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--cmdk-text);
      font-weight: 500;
    }

    .breadcrumb .sep {
      color: var(--cmdk-muted);
      margin: 0 2px;
    }

    input {
      border: none;
      outline: none;
      flex: 1;
      min-width: 80px;
      font-size: 14px;
      background: transparent;
      color: var(--cmdk-text);
      font-family: inherit;
      transition: color 0.2s ease;
    }

    input::placeholder {
      color: var(--cmdk-muted);
    }
  `;

  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = 'Search…';
  @property({ type: String }) breadcrumb = '';

  private _inputEl?: HTMLInputElement;

  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      this._inputEl = this.shadowRoot?.querySelector('input') ?? undefined;
    });
  }

  focusInput() {
    this._inputEl?.focus();
  }

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

  protected render() {
    return html`
      <div class="input-wrapper">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        ${this.breadcrumb
          ? html`<span class="breadcrumb"
              >${this.breadcrumb}<span class="sep"> / </span></span
            >`
          : ''}

        <input
          type="text"
          .value=${this.value}
          placeholder=${this.placeholder}
          @input=${this._onInput}
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cmdk-input': CmdkInput;
  }
}
