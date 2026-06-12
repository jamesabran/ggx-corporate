import { useEffect, useMemo, useRef, useState } from 'react';
import { IconPlus, IconCopy, IconTrash, IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { LocationCascadeCells } from './LocationCascadeCells';
import { ProductAttachDialog } from './ProductAttachDialog';
import {
  BOOKING_COLUMNS, ROW_NUMBER_WIDTH, ROW_ACTIONS_WIDTH, makeEmptyRow, validateRows,
  attachmentSubtotal, attachmentTotalQty,
  type BookingRow, type BookingField, type RowsValidationResult,
  type AttachedProduct, type ProductAvailability,
} from '../lib/bookingValidation';
import type { InventoryProduct } from '../services/inventoryService';

/** Total fixed table width (px) — forces horizontal scroll on narrow viewports. */
const TABLE_WIDTH =
  ROW_NUMBER_WIDTH + ROW_ACTIONS_WIDTH + BOOKING_COLUMNS.reduce((sum, c) => sum + c.width, 0);

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
 * naturally reaches the end of entered rows).
 *
 * When Inventory is enabled for the scope (`inventoryEnabled` + `products`), the
 * Product / SKU cell becomes a product picker: attach one or more products per
 * row (compact "chip + N more" summary), which auto-fills Qty (total items) and
 * Declared value (subtotal) and re-validates stock live — no draft-stage
 * deduction. See docs/spreadsheet_booking_rules.md + docs/inventory_rules.md.
 */
export function SpreadsheetBookingGrid({
  onValidationChange,
  inventoryEnabled = false,
  products = [],
  metroOnly = false,
}: {
  onValidationChange?: (state: GridValidationState) => void;
  /** When true, the Product / SKU cell attaches Inventory products (vs free text). */
  inventoryEnabled?: boolean;
  /** Scope's inventory products (used for attachment + live stock validation). */
  products?: InventoryProduct[];
  /** When true (Same-Day / On-Demand), non-Metro-Manila provinces are flagged. */
  metroOnly?: boolean;
}) {
  const nextId = useRef(4);
  const [rows, setRows] = useState<BookingRow[]>(() => [
    makeEmptyRow('row-1'), makeEmptyRow('row-2'), makeEmptyRow('row-3'),
  ]);
  // Row whose product picker is open (null = closed).
  const [attachRowId, setAttachRowId] = useState<string | null>(null);

  // Live availability index for attached-product validation (stock + status).
  const productIndex = useMemo(() => {
    const m = new Map<string, ProductAvailability>();
    for (const p of products) m.set(p.id, { stockQuantity: p.unlimitedStock ? Infinity : p.stockQuantity, status: p.status });
    return m;
  }, [products]);

  const result = useMemo(
    () => validateRows(rows, inventoryEnabled ? productIndex : undefined, { metroOnly }),
    [rows, inventoryEnabled, productIndex, metroOnly],
  );
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

  // Attach products to a row: Qty (total items) + Declared value (subtotal) are
  // derived from the selection and locked; clearing it restores manual entry.
  const setRowProducts = (rowId: string, attached: AttachedProduct[]) =>
    setRows((prev) => prev.map((r) => {
      if (r.id !== rowId) return r;
      if (attached.length === 0) {
        const next = { ...r, quantity: '', declaredValue: '' };
        delete next.products;
        return next;
      }
      return {
        ...r,
        products: attached,
        quantity: String(attachmentTotalQty(attached)),
        declaredValue: String(attachmentSubtotal(attached)),
      };
    }));

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
        <table className="border-collapse text-xs table-fixed" style={{ width: TABLE_WIDTH, minWidth: TABLE_WIDTH }}>
          <colgroup>
            <col style={{ width: ROW_NUMBER_WIDTH }} />
            {BOOKING_COLUMNS.map((col) => <col key={col.key} style={{ width: col.width }} />)}
            <col style={{ width: ROW_ACTIONS_WIDTH }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky left-0 z-10 bg-gray-50 px-2 py-2 text-gray-400 font-medium text-center">#</th>
              {BOOKING_COLUMNS.map((col) => (
                <th key={col.key} className="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">
                  {col.label}{col.required && <span className="text-red-500"> *</span>}
                </th>
              ))}
              <th className="px-2 py-2 text-center text-gray-400 font-medium">Row</th>
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

                    // Product / SKU: attach Inventory products when enabled,
                    // otherwise the existing free-text cell.
                    if (col.key === 'productSku' && inventoryEnabled) {
                      const attached = row.products ?? [];
                      return (
                        <td key={col.key} className="px-1 py-1 align-top" title={err}>
                          <button
                            type="button"
                            onClick={() => setAttachRowId(row.id)}
                            className={cn(
                              'w-full min-h-8 px-2 py-1 rounded border bg-white text-left text-xs flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer',
                              err ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200',
                            )}
                          >
                            {attached.length === 0 ? (
                              <span className="text-gray-400 flex items-center gap-1">
                                <IconPlus className="w-3.5 h-3.5" /> Attach products
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 min-w-0">
                                <span className="inline-block rounded bg-blue-50 text-blue-700 px-1.5 py-0.5 truncate max-w-[160px]">
                                  {attached[0].name}
                                </span>
                                {attached.length > 1 && (
                                  <span className="text-gray-500 whitespace-nowrap">+{attached.length - 1} more</span>
                                )}
                              </span>
                            )}
                          </button>
                          {err && <p className="text-[10px] leading-tight text-red-600 mt-0.5">{err}</p>}
                        </td>
                      );
                    }

                    // Qty + Declared value are derived (and locked) once products
                    // are attached to the row.
                    const derived =
                      inventoryEnabled && !!row.products?.length &&
                      (col.key === 'quantity' || col.key === 'declaredValue');
                    const common = cn(
                      'w-full h-8 px-2 rounded border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500',
                      err ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200',
                      derived && 'bg-gray-50 text-gray-500 cursor-not-allowed',
                    );
                    return (
                      <td
                        key={col.key}
                        className="px-1 py-1 align-top"
                        title={derived ? 'Set by attached products' : err}
                      >
                        {col.options ? (
                          <select
                            value={row[col.key]}
                            onChange={(e) => updateCell(row.id, col.key, e.target.value)}
                            onPaste={(e) => handlePaste(e, rIdx, cIdx)}
                            className={common}
                          >
                            <option value="">—</option>
                            {col.options.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row[col.key]}
                            disabled={derived}
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
          Tip: {inventoryEnabled ? 'attach products from Inventory or ' : ''}paste rows directly from Excel or Google Sheets. {validRows.length} valid · {invalidRows.length} need fixing
          {emptyCount > 0 ? ` · ${emptyCount} empty` : ''}
        </span>
      </div>

      {inventoryEnabled && attachRowId && (
        <ProductAttachDialog
          open
          onClose={() => setAttachRowId(null)}
          products={products}
          initial={rows.find((r) => r.id === attachRowId)?.products ?? []}
          onConfirm={(sel) => { setRowProducts(attachRowId, sel); setAttachRowId(null); }}
        />
      )}
    </div>
  );
}
