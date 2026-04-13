/**
 * Represents a single command/item in the palette
 */
export interface CmdkItemData {
  id: string;
  label: string; // display text
  icon?: string; // icon name or inline SVG string
  href?: string; // if set → item is a link, type hint = "Link"
  page?: string; // if set → clicking navigates to this page id
  closeOnSelect?: boolean; // default true; set false for page-navigation items
  onClick?: () => void; // optional side-effect on click
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
  id: string; // matches page id used in navigation
  lists: CmdkListData[];
}

/**
 * Backward compatibility exports
 */
export type Group = CmdkListData;
export type Item = CmdkItemData;

/**
 * Event detail fired when user selects a leaf item (no page navigation)
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
