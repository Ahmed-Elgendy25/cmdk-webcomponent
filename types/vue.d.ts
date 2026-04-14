/**
 * Vue 3 type definitions for cmdk-wc web components
 * Usage: import 'cmdk-wc/vue';
 */

import {
  CmdkPaletteElement,
  CmdkPageData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
  CmdkInputEventDetail,
} from './index';

declare module '@vue/runtime-dom' {
  interface IntrinsicElementAttributes {
    'cmdk-palette': Partial<CmdkPaletteElement> & {
      open?: boolean;
      pages?: CmdkPageData[];
      currentPage?: string;
      query?: string;
      isLoading?: boolean;
      placeholder?: string;
      onCmdkSelect?: (event: CustomEvent<CmdkSelectEventDetail>) => void;
      onCmdkPage?: (event: CustomEvent<CmdkPageEventDetail>) => void;
      onCmdkInput?: (event: CustomEvent<CmdkInputEventDetail>) => void;
      onOpen?: () => void;
      onClose?: () => void;
    };
    'cmdk-input': Partial<HTMLElement> & {
      placeholder?: string;
      onCmdkInput?: (event: CustomEvent<CmdkInputEventDetail>) => void;
    };
    'cmdk-list': Partial<HTMLElement> & {
      [key: string]: any;
    };
    'cmdk-group': Partial<HTMLElement> & {
      heading?: string;
    };
    'cmdk-item': Partial<HTMLElement> & {
      id?: string;
      onClick?: () => void;
    };
  }
}

export type {
  CmdkPaletteElement,
  CmdkPageData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
  CmdkInputEventDetail,
};
