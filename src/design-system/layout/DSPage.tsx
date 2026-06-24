import { useEffect, type ReactNode } from 'react';

export function DSPage({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} — GGX Design System`;
    return () => { document.title = prev; };
  }, [title]);

  return <div className="space-y-12">{children}</div>;
}
