import { useMemo, useRef, useState } from 'react';
import { IconPlus, IconCopy, IconTrash, IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import {
  BOOKING_COLUMNS, SERVICE_TYPE_OPTIONS, makeEmptyRow, validateRows,
  type BookingRow, type BookingField,
} from '../lib/bookingValidation';

/**
 * "Type in Spreadsheet" editable grid — an INPUT METHOD inside Bulk Booking
 * (not a separate module). Reuses the shared booking validation pipeline
 * (lib/bookingValidation) so it applies the same rules as the uploaded-file path.
 *
 * Supports: add / duplicate / delete row, paste from Excel/Google Sheets, inline
 * validation with error highlighting, and separating valid from invalid rows
 * before booking. Inventory product attachment + fee/stock computation are a
 * following pass (see docs/spreadsheet_booking_rules.md) — not wired here.
 */
export function SpreadsheetBookingGrid({
  onBook,
}: {
  onBook?: (rows: BookingRow[]) => void;
}) {
  const nextId = useRef(4);
  const [rows, setRows] = useState<BookingRow[]>(() => [
    makeEmptyRow('row-1'), makeEmptyRow('row-2'), makeEmptyRow('row-3'),
  ]);

  const { validations, validRows, invalidRows, emptyCount } = useMemo(() => validateRows(rows), [rows]);

  const genId = () => `row-${nextId.current++}`;

  const updateCell = (rowId: string, field: BookingField, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, makeEmptyRow(genId())]);

  const duplicateRow = (rowId: string) =>
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === rowId);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: genId() };
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
    });

  const deleteRow = (rowId: string) =>
    setRows((prev) => (prev.length === 1 ? [makeEmptyRow(genId())] : prev.filter((r) => r.id !== rowId)));

  // Paste from Excel/Google Sheets: a TSV block fills cells starting at the
  // focused cell, creating rows as needed.
  const handlePaste = (e: React.ClipboardEvent, rowIndex: number, colIndex: number) => {
    const text = e.clipboardData.getData('text/plain');
    if (!text || (!text.includes('\t') && !text.includes('\n'))) return; // single value → default paste
    e.preventDefault();
    const matrix = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map((line) => line.split('\t'));

    setRows((prev) => {
      const next = prev.map((r) => ({ ...r }));
      matrix.forEach((cells, r) => {
        const targetIndex = rowIndex + r;
        while (next.length <= targetIndex) next.push(makeEmptyRow(genId()));
        cells.forEach((val, c) => {
          const col = BOOKING_COLUMNS[colIndex + c];
          if (col) next[targetIndex][col.key] = val.trim();
        });
      });
      return next;
    });
  };

  const nonEmpty = validRows.length + invalidRows.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addRow}>
            <IconPlus className="w-4 h-4" /> Add row
          </Button>
          <span className="text-xs text-gray-500">Paste rows directly from Excel or Google Sheets.</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="success">{validRows.length} valid</Badge>
          <Badge variant={invalidRows.length > 0 ? 'danger' : 'default'}>{invalidRows.length} need fixing</Badge>
          {emptyCount > 0 && <span className="text-gray-400">{emptyCount} empty</span>}
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky left-0 z-10 bg-gray-50 px-2 py-2 w-10 text-gray-400 font-medium text-center">#</th>
              {BOOKING_COLUMNS.map((col) => (
                <th key={col.key} className={cn('px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap', col.width)}>
                  {col.label}{col.required && <span className="text-red-500"> *</span>}
                </th>
              ))}
              <th className="px-2 py-2 w-16 text-center text-gray-400 font-medium">Row</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => {
              const v = validations[row.id];
              const rowInvalid = v && !v.isEmpty && !v.isValid;
              return (
                <tr key={row.id} className="border-b border-gray-100 last:border-0">
                  <td className="sticky left-0 z-10 bg-white px-2 py-1 text-center text-gray-400">{rIdx + 1}</td>
                  {BOOKING_COLUMNS.map((col, cIdx) => {
                    const err = v?.errors[col.key];
                    const common = cn(
                      'w-full h-8 px-2 rounded border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500',
                      err ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200',
                    );
                    return (
                      <td key={col.key} className={cn('px-1 py-1 align-top', col.width)} title={err}>
                        {col.options ? (
                          <select
                            value={row[col.key]}
                            onChange={(e) => updateCell(row.id, col.key, e.target.value)}
                            onPaste={(e) => handlePaste(e, rIdx, cIdx)}
                            className={common}
                          >
                            <option value="">—</option>
                            {col.key === 'serviceType'
                              ? SERVICE_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)
                              : col.options.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row[col.key]}
                            onChange={(e) => updateCell(row.id, col.key, e.target.value)}
                            onPaste={(e) => handlePaste(e, rIdx, cIdx)}
                            className={common}
                          />
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1">
                    <div className="flex items-center justify-center gap-1">
                      {!v?.isEmpty && (rowInvalid
                        ? <IconAlertCircle className="w-3.5 h-3.5 text-red-500" />
                        : <IconCircleCheck className="w-3.5 h-3.5 text-emerald-500" />)}
                      <button onClick={() => duplicateRow(row.id)} title="Duplicate row"
                        className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer">
                        <IconCopy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteRow(row.id)} title="Delete row"
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer">
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-gray-500">
          {invalidRows.length > 0
            ? `${invalidRows.length} row${invalidRows.length === 1 ? '' : 's'} need correction and will be kept for editing. Only valid rows are booked.`
            : nonEmpty > 0
              ? 'All filled rows are valid.'
              : 'Add or paste rows to get started.'}
        </p>
        <Button disabled={validRows.length === 0} onClick={() => onBook?.(validRows)}>
          Book {validRows.length} valid row{validRows.length === 1 ? '' : 's'}
        </Button>
      </div>
    </div>
  );
}
