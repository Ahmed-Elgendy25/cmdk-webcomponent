/**
 * React type definitions for cmdk-wc web components
 * Usage: import 'cmdk-wc/react';
 */

import {
  CmdkPaletteElement,
  CmdkPageData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
  CmdkInputEventDetail,
} from './index';
import * as React from 'react';

/**
 * React props for cmdk-palette component
 */
type CmdkPaletteProps = React.DetailedHTMLProps<
  React.HTMLAttributes<CmdkPaletteElement>,
  CmdkPaletteElement
> & {
  ref?: React.Ref<CmdkPaletteElement>;
  open?: boolean;
  pages?: CmdkPageData[];
  currentPage?: string;
  query?: string;
  isLoading?: boolean;
  placeholder?: string;
  onSelect?: (event: CustomEvent<CmdkSelectEventDetail>) => void;
  onPageChange?: (event: CustomEvent<CmdkPageEventDetail>) => void;
  onInput?: (event: CustomEvent<CmdkInputEventDetail>) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

/**
 * React props for cmdk-input component
 */
type CmdkInputProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  placeholder?: string;
  onInput?: (event: CustomEvent<CmdkInputEventDetail>) => void;
};

/**
 * React props for cmdk-list component
 */
type CmdkListProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
>;

/**
 * React props for cmdk-group component
 */
type CmdkGroupProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  heading?: string;
};

/**
 * React props for cmdk-item component
 */
type CmdkItemProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  id?: string;
  onClick?: () => void;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'cmdk-palette': CmdkPaletteProps;
      'cmdk-input': CmdkInputProps;
      'cmdk-list': CmdkListProps;
      'cmdk-group': CmdkGroupProps;
      'cmdk-item': CmdkItemProps;
    }
  }
}

export type {
  CmdkPaletteProps,
  CmdkInputProps,
  CmdkListProps,
  CmdkGroupProps,
  CmdkItemProps,
};
