import { useState } from 'react';
import type {
  CmdkPageData,
  CmdkSelectEventDetail,
  CmdkPageEventDetail,
} from 'cmdk-wc';

const pages: CmdkPageData[] = [
  {
    id: 'root',
    lists: [
      {
        id: 'home',
        heading: 'Home',
        items: [
          {
            id: 'home',
            label: 'Home',
            icon: '🏠',
            href: '#',
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: '⚙️',
            href: '#',
          },
          {
            id: 'projects',
            label: 'Projects',
            icon: '📁',
            page: 'projects',
            closeOnSelect: false,
          },
        ],
      },
      {
        id: 'other',
        heading: 'Other',
        items: [
          {
            id: 'dev',
            label: 'Developer settings',
            icon: '👨‍💻',
            href: '#',
          },
          {
            id: 'privacy',
            label: 'Privacy policy',
            icon: '🛡️',
            href: '#',
          },
          {
            id: 'logout',
            label: 'Log out',
            icon: '🚪',
            onClick: () => {
              alert('Logging out…');
            },
          },
        ],
      },
    ],
  },
  {
    id: 'projects',
    lists: [
      {
        id: 'projects-list',
        heading: 'Projects',
        items: [
          {
            id: 'hobby',
            label: 'Hobby project',
            icon: '🎮',
            onClick: () => {
              alert('Opening hobby project…');
            },
          },
          {
            id: 'work',
            label: 'Work project',
            icon: '💼',
            onClick: () => {
              alert('Opening work project…');
            },
          },
        ],
      },
    ],
  },
];

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <cmdk-palette
      open={open}
      pages={pages}
      currentPage="root"
      placeholder="Search commands..."
      onCmdkSelect={(e: CustomEvent<CmdkSelectEventDetail>) =>
        console.log('Selected:', e.detail)
      }
      onCmdkPage={(e: CustomEvent<CmdkPageEventDetail>) =>
        console.log('Page changed:', e.detail)
      }
      onOpen={() => {
        console.log('Opened');
        setOpen(true);
      }}
      onClose={() => {
        console.log('Closed');
        setOpen(false);
      }}
    />
  );
}
