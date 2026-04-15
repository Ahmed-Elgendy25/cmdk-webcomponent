import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('cmdk-footer')
export class CmdkFooter extends LitElement {
  static styles = css`
    :host {
      --cmdk-border: #e2e8f0;
      --cmdk-surface: #f8fafc;
      --cmdk-bg: #ffffff;
      --cmdk-muted: #64748b;
      --cmdk-text: #0f172a;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --cmdk-border: #334155;
        --cmdk-surface: #1e293b;
        --cmdk-bg: #0f172a;
        --cmdk-muted: #94a3b8;
        --cmdk-text: #f1f5f9;
      }
    }

    .keyboard-footer {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      border-top: 1px solid var(--cmdk-border);
      background: var(--cmdk-surface);
      font-size: 12px;
      color: var(--cmdk-muted);
      flex-wrap: wrap;
      align-items: center;
    }

    .keyboard-shortcut {
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .keyboard-key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 6px;
      background: var(--cmdk-bg);
      border: 1px solid var(--cmdk-border);
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      font-family: 'Monaco', 'Courier New', monospace;
      color: var(--cmdk-text);
      line-height: 1;
    }

    .keyboard-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      font-size: 14px;
    }

    @media (max-width: 600px) {
      .keyboard-footer {
        gap: 8px;
        padding: 10px 12px;
        font-size: 11px;
      }

      .keyboard-key {
        min-width: 20px;
        height: 20px;
        padding: 0 4px;
        font-size: 10px;
      }

      .keyboard-icon {
        width: 18px;
        height: 18px;
        font-size: 12px;
      }
    }
  `;

  protected render() {
    return html`
      <footer
        class="keyboard-footer"
        role="contentinfo"
        aria-label="Keyboard shortcuts help"
      >
        <div class="keyboard-shortcut">
          <span class="keyboard-icon" aria-hidden="true">↕️</span>
          <span class="keyboard-key" aria-label="Arrow up and down keys"
            >↑↓</span
          >
          <span>Navigate</span>
        </div>
        <div class="keyboard-shortcut">
          <span class="keyboard-icon" aria-hidden="true">✓</span>
          <span class="keyboard-key" aria-label="Enter key">Enter</span>
          <span>Select</span>
        </div>
        <div class="keyboard-shortcut">
          <span class="keyboard-icon" aria-hidden="true">⎋</span>
          <span class="keyboard-key" aria-label="Escape key">Esc</span>
          <span>Back/Close</span>
        </div>
        <div class="keyboard-shortcut">
          <span class="keyboard-icon" aria-hidden="true">⌘</span>
          <span
            class="keyboard-key"
            aria-label="Command key on Mac or Control key on Windows"
            >⌘K</span
          >
          <span>Open</span>
        </div>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cmdk-footer': CmdkFooter;
  }
}
