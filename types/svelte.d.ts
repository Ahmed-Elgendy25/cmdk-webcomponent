/**
 * Svelte type definitions for cmdk-wc web components
 * Usage: import 'cmdk-wc/svelte';
 */

import {
  CmdkPaletteElement,
  CmdkPageData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
  CmdkInputEventDetail,
} from './index';

declare module 'svelte/elements' {
  interface SvelteHTMLElements {
    'cmdk-palette': {
      open?: boolean | null;
      pages?: CmdkPageData[] | null;
      currentPage?: string | null;
      query?: string | null;
      isLoading?: boolean | null;
      placeholder?: string | null;
      'on:cmdkSelect'?: (event: CustomEvent<CmdkSelectEventDetail>) => void;
      'on:cmdkPage'?: (event: CustomEvent<CmdkPageEventDetail>) => void;
      'on:cmdkInput'?: (event: CustomEvent<CmdkInputEventDetail>) => void;
      'on:open'?: () => void;
      'on:close'?: () => void;
      slot?: string;
    } & Record<string, any>;

    'cmdk-input': {
      placeholder?: string | null;
      'on:cmdkInput'?: (event: CustomEvent<CmdkInputEventDetail>) => void;
      slot?: string;
    } & Record<string, any>;

    'cmdk-list': {
      slot?: string;
    } & Record<string, any>;

    'cmdk-group': {
      heading?: string | null;
      slot?: string;
    } & Record<string, any>;

    'cmdk-item': {
      id?: string | null;
      'on:click'?: () => void;
      slot?: string;
    } & Record<string, any>;
  }
}

export type {
  CmdkPaletteElement,
  CmdkPageData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
  CmdkInputEventDetail,
};
