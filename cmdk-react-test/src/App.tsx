import { useEffect, useRef, useState } from 'react';

const pages: CmdkPageData[] = [
  {
    id: 'root',
    lists: [
      {
        id: 'home',
        heading: 'Home',
        items: [
          { id: 'home', label: 'Home', icon: '🏠', href: '#' },
          { id: 'settings', label: 'Settings', icon: '⚙️', href: '#' },
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
          { id: 'dev', label: 'Developer settings', icon: '👨‍💻', href: '#' },
          { id: 'privacy', label: 'Privacy policy', icon: '🛡️', href: '#' },
          {
            id: 'logout',
            label: 'Log out',
            icon: '🚪',
            onClick: () => alert('Logging out…'),
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
            onClick: () => alert('Opening hobby project…'),
          },
          {
            id: 'work',
            label: 'Work project',
            icon: '💼',
            onClick: () => alert('Opening work project…'),
          },
        ],
      },
    ],
  },
];

interface EventLine {
  time: string;
  type: string;
  detail: unknown;
}

export default function App() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [eventLog, setEventLog] = useState<EventLine[]>([]);

  // ✅ Set pages property imperatively
  useEffect(() => {
    if (ref.current) {
      (ref.current as CmdkPaletteElement).pages = pages;
    }
  }, []);

  // ✅ Sync open state to the web component
  useEffect(() => {
    if (ref.current) {
      (ref.current as CmdkPaletteElement).open = open;
    }
  }, [open]);

  // ✅ Attach CustomEvent listeners imperatively
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function logEvent(type: string, detail: unknown) {
      const time = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setEventLog((prev) => [{ time, type, detail }, ...prev].slice(0, 10));
    }

    const onSelect = (e: Event) =>
      logEvent('cmdk-select', (e as CustomEvent).detail);
    const onPage = (e: Event) =>
      logEvent('cmdk-page', (e as CustomEvent).detail);
    const onSearch = (e: Event) =>
      logEvent('cmdk-search', (e as CustomEvent).detail);

    el.addEventListener('cmdk-select', onSelect);
    el.addEventListener('cmdk-page', onPage);
    el.addEventListener('cmdk-search', onSearch);

    return () => {
      el.removeEventListener('cmdk-select', onSelect);
      el.removeEventListener('cmdk-page', onPage);
      el.removeEventListener('cmdk-search', onSearch);
    };
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 700 }}>
        cmdk Web Component
      </h1>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
        Press <kbd>Ctrl+K</kbd> (or <kbd>Cmd+K</kbd> on Mac) to open.
      </p>

      {/* Demo Section */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Demo</h2>
        <button type="button" onClick={() => setOpen((o) => !o)}>
          Open Command Palette
        </button>
        <div
          style={{
            fontSize: 12,
            color: '#64748b',
            fontFamily: 'monospace',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            padding: '8px 12px',
            display: 'inline-block',
            marginTop: 12,
            marginLeft: 12,
          }}
        >
          Ctrl+K (or Cmd+K)
        </div>
      </div>

      {/* Event Log Section */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Event Log</h2>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            padding: 12,
            fontSize: 12,
            fontFamily: 'monospace',
            maxHeight: 200,
            overflow: 'auto',
          }}
        >
          {eventLog.length === 0 && (
            <span style={{ color: '#94a3b8' }}>No events yet…</span>
          )}
          {eventLog.map((line, i) => (
            <div
              key={i}
              style={{
                padding: '4px 0',
                borderBottom:
                  i < eventLog.length - 1 ? '1px solid #e2e8f0' : 'none',
              }}
            >
              <span style={{ color: '#94a3b8', marginRight: 8 }}>
                {line.time}
              </span>
              <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                {line.type}
              </span>{' '}
              {JSON.stringify(line.detail)}
            </div>
          ))}
        </div>
      </div>

      {/* The web component */}
      <cmdk-palette ref={ref} />
    </div>
  );
}
