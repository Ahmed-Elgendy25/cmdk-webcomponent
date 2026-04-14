/**
 * Represents a single command/item in the palette
 */
export interface CmdkItemData {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  page?: string;
  closeOnSelect?: boolean;
  onClick?: () => void;
}

/**
 * Represents a group of related commands
 */
export interface CmdkListData {
  id: string;
  heading: string;
  items: CmdkItemData[];
}

/**
 * Represents a page containing multiple lists
 */
export interface CmdkPageData {
  id: string;
  lists: CmdkListData[];
}

/**
 * Backward compatibility exports
 */
export type Group = CmdkListData;
export type Item = CmdkItemData;

/**
 * Event detail fired when user selects a leaf item
 * Fired from: cmdk-palette
 * Event name: cmdk-select
 */
export interface CmdkSelectEventDetail {
  id: string;
  label: string;
  href?: string;
}

/**
 * Event detail fired when user navigates to a new page
 * Fired from: cmdk-palette
 * Event name: cmdk-page
 */
export interface CmdkPageEventDetail {
  page: string;
}

/**
 * Event detail fired when user types in the search input
 * Fired from: cmdk-input
 * Event name: cmdk-input
 */
export interface CmdkInputEventDetail {
  query: string;
}

/**
 * Core palette element interface — shared by all frameworks
 */
export interface CmdkPaletteElement extends HTMLElement {
  open: boolean;
  pages: CmdkPageData[];
  currentPage: string;
  page?: string;
  query: string;
  isLoading: boolean;
  placeholder?: string;
  onSelect?: (detail: CmdkSelectEventDetail) => void;
  onPageChange?: (detail: CmdkPageEventDetail) => void;
  onInput?: (detail: CmdkInputEventDetail) => void;
  onCmdkSelect?: (detail: CmdkSelectEventDetail) => void;
  onCmdkPage?: (detail: CmdkPageEventDetail) => void;
  onCmdkInput?: (detail: CmdkInputEventDetail) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

declare global {
  interface HTMLElementTagNameMap {
    'cmdk-palette': CmdkPaletteElement;
    'cmdk-input': HTMLElement;
    'cmdk-list': HTMLElement;
    'cmdk-group': HTMLElement;
    'cmdk-item': HTMLElement;
  }
}
