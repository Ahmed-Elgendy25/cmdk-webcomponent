/**
 * Solid.js type definitions for cmdk-wc web components
 * Usage: import 'cmdk-wc/solid';
 */

import {
  CmdkPaletteElement,
  CmdkPageData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
  CmdkInputEventDetail,
} from './index';
import { JSX } from 'solid-js';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'cmdk-palette': {
        ref?: CmdkPaletteElement | ((el: CmdkPaletteElement) => void);
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
        children?: any;
      } & Record<string, any>;

      'cmdk-input': {
        ref?: HTMLElement | ((el: HTMLElement) => void);
        placeholder?: string;
        onCmdkInput?: (event: CustomEvent<CmdkInputEventDetail>) => void;
        children?: any;
      } & Record<string, any>;

      'cmdk-list': {
        ref?: HTMLElement | ((el: HTMLElement) => void);
        children?: any;
      } & Record<string, any>;

      'cmdk-group': {
        ref?: HTMLElement | ((el: HTMLElement) => void);
        heading?: string;
        children?: any;
      } & Record<string, any>;

      'cmdk-item': {
        ref?: HTMLElement | ((el: HTMLElement) => void);
        id?: string;
        onClick?: () => void;
        children?: any;
      } & Record<string, any>;
    }
  }
}

export type {
  CmdkPaletteElement,
  CmdkPageData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
  CmdkInputEventDetail,
};
