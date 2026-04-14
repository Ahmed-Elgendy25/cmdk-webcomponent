import 'react';

// ✅ Tell TypeScript this module exists as a side-effect import
declare module 'cmdk-wc' {}

declare global {
  interface CmdkItemData {
    id: string;
    label: string;
    icon?: string;
    href?: string;
    page?: string;
    closeOnSelect?: boolean;
    onClick?: () => void;
  }

  interface CmdkListData {
    id: string;
    heading: string;
    items: CmdkItemData[];
  }

  interface CmdkPageData {
    id: string;
    lists: CmdkListData[];
  }

  interface CmdkPaletteElement extends HTMLElement {
    pages: CmdkPageData[];
    open: boolean;
    currentPage: string;
    page?: string;
    query: string;
    isLoading: boolean;
    placeholder?: string;
  }
}

type CustomElement<
  T extends HTMLElement,
  Props = object,
> = React.HTMLAttributes<T> & React.RefAttributes<T> & Props;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'cmdk-palette': CustomElement<
        HTMLElement,
        {
          open?: boolean;
          currentPage?: string;
          page?: string;
          pages?: CmdkPageData[];
          query?: string;
          isLoading?: boolean;
          placeholder?: string;
          onCmdkSelect?: (e: any) => void;
          onCmdkPage?: (e: any) => void;
          onCmdkInput?: (e: any) => void;
          onOpen?: () => void;
          onClose?: () => void;
        }
      >;
      'cmdk-input': CustomElement<
        HTMLElement,
        {
          placeholder?: string;
        }
      >;
      'cmdk-group': CustomElement<
        HTMLElement,
        {
          label?: string;
        }
      >;
      'cmdk-item': CustomElement<
        HTMLElement,
        {
          value?: string;
          selected?: boolean;
        }
      >;
      'cmdk-list': CustomElement<HTMLElement>;
    }
  }
}
