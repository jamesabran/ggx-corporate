import { useEffect, useMemo, useRef, useState } from 'react';
import { IconPlus, IconCopy, IconTrash, IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { LocationCascadeCells } from './LocationCascadeCells';
import {
  BOOKING_COLUMNS, SERVICE_TYPE_OPTIONS, makeEmptyRow, validateRows,
  type BookingRow, type BookingField, type RowsValidationResult,
} from '../lib/bookingValidation';

export interface GridValidationState extends RowsValidationResult {
  rows: BookingRow[];
}

/**
 * "Type in Spreadsheet" editable grid — an INPUT METHOD inside Bulk Booking
 * (not a separate module). Reuses the shared validation pipeline
 * (lib/bookingValidation) so it applies the same rules as the uploaded-file path,
 * and the GGX-supported location cascade for province/city/barangay.
 *
 * The grid is intake-only: it reports its live validation state via
 * `onValidationChange` so the page can show counts, fee estimates, and own the
 * final review/confirm CTA. "Add row" sits at the bottom-left (where the user
 * naturally reaches the end of entered rows). Inventory product attachment +
 * stock validation are a following pass (see docs/spreadsheet_booking_rules.md).
 */
export function SpreadsheetBookingGrid({
  onValidationChange,
}: {
  onValidationChange?: (state: GridValidationState) => void;
}) {
  const nextId = useRef(4);
  const [rows, setRows] = useState<BookingRow[]>(() => [
    makeEmptyRow('row-1'), makeEmptyRow('row-2'), makeEmptyRow('row-3'),
  ]);

  const result = useMemo(() => validateRows(rows), [rows]);
  const { validations, validRows, invalidRows, emptyCount } = result;

  // Report live validation state upward (page shows counts/fees + owns the CTA).
  // Intentionally excludes onValidationChange from deps to avoid a re-render loop
  // if the parent passes an inline callback — it only fires when data changes.
  useEffect(() => {
    onValidationChange?.({ ...result, rows });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, rows]);

  const genId = () => `row-${nextId.current++}`;

  const updateCell = (rowId: string, field: BookingField, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)));

  const updateRowFields = (rowId: string, partial: Partial<BookingRow>) =>
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...partial } : r)));

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
    if (!text || (!text.includes('\t') && !text.includes('\n'))) return;
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

  return (
    <div className="space-y-3">
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
                    // Province/City/Barangay render as the GGX location cascade
                    // (3 cells) at the province column; skip the other two.
                    if (col.key === 'city' || col.key === 'barangay') return null;
                    if (col.key === 'province') {
                      return (
                        <LocationCascadeCells
                          key="location"
                          compact
                          province={row.province}
                          city={row.city}
                          barangay={row.barangay}
                          onChange={(p, c, b) => updateRowFields(row.id, { province: p, city: c, barangay: b })}
                          errors={{
                            province: !!v?.errors.province,
                            city: !!v?.errors.city,
                            barangay: !!v?.errors.barangay,
                          }}
                        />
                      );
                    }

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

      {/* Add row sits at the bottom-left, where the user reaches the end of rows. */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button variant="outline" size="sm" onClick={addRow}>
          <IconPlus className="w-4 h-4" /> Add row
        </Button>
        <span className="text-xs text-gray-500">
          Tip: paste rows directly from Excel or Google Sheets. {validRows.length} valid · {invalidRows.length} need fixing
          {emptyCount > 0 ? ` · ${emptyCount} empty` : ''}
        </span>
      </div>
    </div>
  );
}
