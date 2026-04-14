/**
 * Angular type definitions for cmdk-wc web components
 * Usage: import 'cmdk-wc/angular';
 */

import {
  CmdkPaletteElement,
  CmdkPageData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
  CmdkInputEventDetail,
} from './index';

/**
 * Angular component wrapper types for cmdk-palette
 */
export interface CmdkPaletteComponentMeta {
  selector: 'cmdk-palette';
  nativeElement: CmdkPaletteElement;
  open: boolean;
  pages: CmdkPageData[];
  currentPage: string;
  query: string;
  isLoading: boolean;
  placeholder?: string;
}

/**
 * Angular component wrapper types for cmdk-input
 */
export interface CmdkInputComponentMeta {
  selector: 'cmdk-input';
  nativeElement: HTMLElement;
  placeholder?: string;
}

/**
 * Angular component wrapper types for cmdk-list
 */
export interface CmdkListComponentMeta {
  selector: 'cmdk-list';
  nativeElement: HTMLElement;
}

/**
 * Angular component wrapper types for cmdk-group
 */
export interface CmdkGroupComponentMeta {
  selector: 'cmdk-group';
  nativeElement: HTMLElement;
  heading?: string;
}

/**
 * Angular component wrapper types for cmdk-item
 */
export interface CmdkItemComponentMeta {
  selector: 'cmdk-item';
  nativeElement: HTMLElement;
  id?: string;
}

export type {
  CmdkPaletteElement,
  CmdkPageData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
  CmdkInputEventDetail,
};
