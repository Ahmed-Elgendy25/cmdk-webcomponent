/**
 * cmdk-wc - Command Palette Web Component
 *
 * A modern, accessible command palette/search dialog built with Lit.
 *
 * Components:
 * - <cmdk-palette>: Root component managing state and events
 * - <cmdk-input>: Search input field with breadcrumb
 * - <cmdk-list>: Scrollable container for groups
 * - <cmdk-group>: Group header and item container
 * - <cmdk-item>: Individual command item
 * - <cmdk-free-search-action>: Fallback when no results
 */

export type {
  CmdkItemData,
  CmdkListData,
  CmdkPageData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
  CmdkInputEventDetail,
  Group,
  Item,
} from './types';

// Components are auto-registered via @customElement decorators
import './components/cmdkpalette';
import './components/cmdkinput';
import './components/cmdklist';
import './components/cmdkgroup';
import './components/cmdkitem';
import './components/cmdkfreesearchaction';
