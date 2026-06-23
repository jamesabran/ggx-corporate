import { useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { cn } from '../../lib/utils';

export interface CalendarProps {
  /** Currently selected date. */
  value?: Date | null;
  onChange?: (date: Date) => void;
  className?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Single-date month calendar. Self-contained (no date library): navigate months
 * and pick a day. The caller owns the selected value.
 */
export function Calendar({ value, onChange, className }: CalendarProps) {
  const initial = value ?? new Date();
  const [view, setView] = useState({ year: initial.getFullYear(), month: initial.getMonth() });
  const today = new Date();

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const step = (delta: number) => {
    const m = view.month + delta;
    setView({ year: view.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 });
  };

  return (
    <div className={cn('w-64 rounded-lg border border-gray-200 bg-white p-3', className)}>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" aria-label="Previous month" onClick={() => step(-1)} className="rounded-md p-1 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <IconChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-gray-900">{MONTHS[view.month]} {view.year}</span>
        <button type="button" aria-label="Next month" onClick={() => step(1)} className="rounded-md p-1 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <IconChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 text-center text-[11px] font-medium text-gray-400">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`b-${i}`} />;
          const date = new Date(view.year, view.month, day);
          const isSelected = value ? sameDay(date, value) : false;
          const isToday = sameDay(date, today);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onChange?.(date)}
              aria-pressed={isSelected}
              className={cn(
                'flex h-8 items-center justify-center rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isSelected
                  ? 'bg-[#0088C9] font-medium text-white'
                  : cn('text-gray-700 hover:bg-gray-100', isToday && 'font-semibold text-[#0088C9]'),
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
