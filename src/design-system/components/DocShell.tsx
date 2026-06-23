import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../../app/lib/utils';

export interface NavLeaf {
  id: string;
  label: string;
}

export interface NavGroup {
  label: string;
  items: NavLeaf[];
}

export const DS_NAV: NavGroup[] = [
  { label: '', items: [{ id: 'overview', label: 'Overview' }] },
  {
    label: 'Foundations',
    items: [
      { id: 'colors', label: 'Colors' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing', label: 'Spacing & Layout' },
      { id: 'icons', label: 'Icons' },
    ],
  },
  {
    label: 'Components',
    items: [
      { id: 'button', label: 'Button' },
      { id: 'delivery-status-badge', label: 'Delivery Status Badge' },
    ],
  },
  {
    label: 'Patterns',
    items: [{ id: 'payment-option-card', label: 'Payment Option Card' }],
  },
];

const ALL_IDS = DS_NAV.flatMap((g) => g.items.map((i) => i.id));

/** Tracks which section is in view to highlight the matching nav link. */
function useScrollSpy(): string {
  const [active, setActive] = useState(ALL_IDS[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );
    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return active;
}

export function DocShell({ children }: { children: ReactNode }) {
  const active = useScrollSpy();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/90 px-5 backdrop-blur">
        <img
          src="https://gogoxpress.com/wp-content/uploads/2022/07/gogox-logo.png"
          alt="GoGo Xpress"
          className="h-7 w-auto"
        />
        <span className="text-[15px] font-medium text-gray-700">Design System</span>
        <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-[#0088C9]">
          Sample
        </span>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-5">
        {/* Sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 flex-shrink-0 overflow-y-auto py-8 lg:block">
          <nav className="space-y-6">
            {DS_NAV.map((group, gi) => (
              <div key={gi}>
                {group.label && (
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {group.label}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={cn(
                          'block rounded-md px-3 py-1.5 text-sm transition-colors',
                          active === item.id
                            ? 'bg-blue-50 font-medium text-[#0088C9]'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        )}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 py-10">
          <div className="space-y-12">{children}</div>
          <footer className="mt-16 border-t border-gray-100 pt-6 text-xs text-gray-400">
            GoGo Xpress Design System · Sample reference · Not a complete system.
          </footer>
        </main>
      </div>
    </div>
  );
}
