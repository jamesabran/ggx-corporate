import { useMemo, useState } from 'react';
import { IconDownload, IconArrowLeft, IconChevronRight, IconChevronLeft, IconInfoCircle, IconBookmark } from '@tabler/icons-react';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Card, CardContent } from './ui/Card';
import { loadState, saveState } from '../lib/storage';
import { BULK_FIELD_LABELS as L } from '../data/bulkTemplate';
import { findTemplateForHeaders, saveTemplateForHeaders } from '../lib/columnMappingTemplates';

// GGX field definitions for column mapping. Labels come from the shared
// BULK_FIELD_LABELS so the mapper matches the in-app spreadsheet, failed-orders
// table, and template. Optional fields carry "(Optional)" in their label;
// required fields omit it (no asterisks). Item Protection Fee is intentionally
// not a mapper field. (`itemProtection` key maps to the "Insure full item value?"
// field — the key is internal and kept stable.)
const GGX_FIELDS = [
  { key: 'recipientName',     label: L.name,              required: true  },
  { key: 'mobileNumber',      label: L.mobile,            required: true  },
  { key: 'streetAddress',     label: L.streetAddress,     required: true  },
  { key: 'province',          label: L.province,          required: true  },
  { key: 'cityMunicipality',  label: L.cityMunicipality,  required: true  },
  { key: 'barangay',          label: L.barangay,          required: true  },
  { key: 'landmarks',         label: L.landmarks,         required: false },
  { key: 'itemName',          label: L.itemName,          required: true  },
  { key: 'pouchSize',         label: L.pouchSize,         required: true  },
  { key: 'lengthCm',          label: L.lengthCm,          required: true  },
  { key: 'widthCm',           label: L.widthCm,           required: true  },
  { key: 'heightCm',          label: L.heightCm,          required: true  },
  { key: 'weightKg',          label: L.weightKg,          required: true  },
  { key: 'codAmount',         label: L.codAmount,         required: true  },
  { key: 'cod',               label: L.cod,               required: true  },
  { key: 'declaredValue',     label: L.declaredValue,     required: true  },
  { key: 'itemProtection',    label: L.insureFull,        required: true  },
  { key: 'recipientPaysFees', label: L.recipientPaysFees, required: true  },
  { key: 'promoCode',         label: L.promoCode,         required: false },
  { key: 'referenceId',       label: L.referenceId,       required: false },
] as const;

type FieldKey = (typeof GGX_FIELDS)[number]['key'];

export interface BulkColumnMapperProps {
  fileName: string;
  fileHeaders: string[];
  sampleData: string[][];
  onConfirm: (mapping: Record<FieldKey, string>) => void;
  onBack: () => void;
  onDownloadTemplate: () => void;
  /** Active account scope ('main' or a subaccount id) for saved-mapping scoping. */
  scopeAccountId?: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Obvious header aliases (synonyms) used to strengthen auto-mapping. These
// supplement — not replace — the existing label-substring matching below.
// Aliases keep older/varied uploaded headers auto-mapping after the rename to the
// shared field model — including the previous GGX labels (Recipient Name, Mobile
// Number, City/Municipality, Declared Value, Item Protection, Promo code, etc.).
const FIELD_ALIASES: Partial<Record<FieldKey, string[]>> = {
  recipientName: ['recipient', 'recipient name', 'buyer', 'buyer name', 'consignee', 'customer name', 'customer'],
  mobileNumber: ['mobile', 'mobile no', 'mobile number', 'phone', 'contact', 'contact no', 'contact number', 'cp', 'cp#', 'cellphone', 'cell'],
  streetAddress: ['address', 'street address', 'ship to', 'shipping address', 'delivery address'],
  province: ['state', 'region'],
  cityMunicipality: ['city', 'municipality', 'city/municipality', 'town', 'city/town', 'city / town'],
  barangay: ['brgy', 'district', 'village'],
  landmarks: ['unit', 'floor', 'unit/floor', 'landmark', 'landmarks'],
  itemName: ['item', 'item name', 'product', 'product name', 'item description', 'description'],
  pouchSize: ['pouch', 'box size', 'pouch size', 'pouch/box size', 'receptacle size', 'parcel size', 'package size', 'size'],
  lengthCm:  ['length', 'length cm', 'l(cm)', 'length_cm', 'l cm'],
  widthCm:   ['width', 'width cm', 'w(cm)', 'width_cm', 'w cm'],
  heightCm:  ['height', 'height cm', 'h(cm)', 'height_cm', 'h cm'],
  weightKg:  ['weight', 'weight kg', 'wt', 'weight_kg', 'wt(kg)', 'wt kg', 'gross weight'],
  cod: ['cod', 'cash on delivery', 'collect cod', 'collect item value', 'collect'],
  codAmount: ['cod amount', 'collectible', 'collectible amount', 'amount'],
  declaredValue: ['declared value', 'declared item value', 'item value', 'declared', 'value'],
  itemProtection: ['insure', 'insure full value', 'insure full item value', 'item protection', 'protection'],
  recipientPaysFees: ['recipient pays', 'recipient pays fees', 'pays fees', 'who pays'],
  promoCode: ['promo', 'promo code', 'voucher', 'discount code'],
  referenceId: ['reference id', 'reference', 'ref id', 'ref', 'tracking', 'tracking id'],
};

function autoMap(fileHeaders: string[], fields: typeof GGX_FIELDS): Record<string, string> {
  const result: Record<string, string> = {};
  // Track headers already consumed so auto-map never produces duplicate mappings.
  const used = new Set<string>();
  for (const field of fields) {
    const nf = norm(field.label);
    const aliases = (FIELD_ALIASES[field.key] ?? []).map(norm);
    for (const h of fileHeaders) {
      if (used.has(h)) continue;
      const nh = norm(h);
      const labelMatch = nf === nh || (nf.length > 4 && nh.includes(nf)) || (nh.length > 4 && nf.includes(nh));
      const aliasMatch = aliases.some((a) => a === nh || (a.length > 3 && (nh === a || nh.includes(a))));
      if (labelMatch || aliasMatch) {
        result[field.key] = h;
        used.add(h);
        break;
      }
    }
  }
  return result;
}

// Number of sample columns to show. The user can scroll through them.
const SAMPLE_COLS = 3;

export function BulkColumnMapper({ fileName, fileHeaders, sampleData, onConfirm, onBack, onDownloadTemplate, scopeAccountId }: BulkColumnMapperProps) {
  // A previously-saved mapping for the same/similar headers in this scope, if any
  // (mock/local): the active scope's own templates take priority over shared ones.
  const matchedTemplate = useMemo(
    () => findTemplateForHeaders(fileHeaders, scopeAccountId),
    [fileHeaders, scopeAccountId],
  );
  // Initial mapping: auto-match, then overlay any saved template (template wins
  // for headers that still exist in this file). This handles similar files with
  // extra/missing columns — saved choices apply where valid, auto-match fills the rest.
  const initialMapping = useMemo(() => {
    const auto = autoMap(fileHeaders, GGX_FIELDS);
    if (!matchedTemplate) return auto;
    const merged = { ...auto };
    for (const [key, header] of Object.entries(matchedTemplate.mapping)) {
      if (fileHeaders.includes(header)) merged[key] = header;
    }
    return merged;
  }, [matchedTemplate, fileHeaders]);
  const [mapping, setMapping] = useState<Record<string, string>>(initialMapping);
  // Whether the initial mapping was restored from a saved template.
  const [templateApplied, setTemplateApplied] = useState<boolean>(!!matchedTemplate);
  // Fields the system pre-filled (auto-match or restored template). Cleared
  // per-field once the user edits them.
  const [autoMatchedKeys, setAutoMatchedKeys] = useState<Set<string>>(() => new Set(Object.keys(initialMapping)));
  // Which sample data offset is visible (left/right scroll through sample columns).
  const [sampleOffset, setSampleOffset] = useState(0);
  // Save-mapping preference. Mock/demo only — persisted via the shared localStorage
  // helper; there is no backend mapping-template contract yet.
  const [saveMapping, setSaveMapping] = useState<boolean>(() => loadState('bulkColumnMapping.savePref', true));

  const setField = (key: string, value: string) => {
    setMapping((prev) => ({ ...prev, [key]: value }));
    // A manual change means this field is no longer a system suggestion.
    setAutoMatchedKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const toggleSaveMapping = (checked: boolean) => {
    setSaveMapping(checked);
    saveState('bulkColumnMapping.savePref', checked);
  };

  // Discard a restored template and fall back to fresh auto-match.
  const resetToAutoMatch = () => {
    const auto = autoMap(fileHeaders, GGX_FIELDS);
    setMapping(auto);
    setAutoMatchedKeys(new Set(Object.keys(auto)));
    setTemplateApplied(false);
  };

  const handleConfirm = () => {
    // Demo persistence: store the confirmed mapping locally when opted in, and
    // upsert a reusable template keyed by this file's header signature.
    if (saveMapping) {
      saveState('bulkColumnMapping.lastMapping', mapping);
      saveTemplateForHeaders(fileHeaders, mapping, {
        scopeAccountId,
        name: fileName ? `Mapping for ${fileName}` : undefined,
      });
    }
    onConfirm(mapping as Record<FieldKey, string>);
  };

  const requiredMapped = GGX_FIELDS
    .filter((f) => f.required)
    .every((f) => !!mapping[f.key]);

  const requiredRemaining = GGX_FIELDS.filter((f) => f.required && !mapping[f.key]).length;
  const autoMatchedCount = GGX_FIELDS.filter((f) => autoMatchedKeys.has(f.key) && mapping[f.key]).length;

  // Headers currently selected by any field — used to mark dropdown options as
  // "In use" vs "Available" without adding a separate summary panel.
  const usedHeaders = new Set(GGX_FIELDS.map((f) => mapping[f.key]).filter(Boolean));

  // Detect uploaded columns mapped to more than one GGX field.
  const headerToFields = new Map<string, string[]>();
  for (const field of GGX_FIELDS) {
    const h = mapping[field.key];
    if (h) headerToFields.set(h, [...(headerToFields.get(h) ?? []), field.label]);
  }
  const duplicateMappings = [...headerToFields.entries()].filter(([, fields]) => fields.length > 1);
  const hasDuplicates = duplicateMappings.length > 0;

  const canConfirm = requiredMapped && !hasDuplicates;

  // Precise CTA helper text describing exactly what is blocking Confirm.
  let blockerText = '';
  if (!requiredMapped && hasDuplicates) {
    blockerText = 'Map required fields and resolve duplicate mappings to continue';
  } else if (!requiredMapped) {
    blockerText = `Map ${requiredRemaining} required field${requiredRemaining === 1 ? '' : 's'} to continue`;
  } else if (hasDuplicates) {
    blockerText = 'Resolve duplicate column mappings to continue';
  }

  const maxOffset = Math.max(0, sampleData.length - SAMPLE_COLS);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Match your file columns with GGX bulk upload fields</h1>
          <p className="text-sm text-gray-600 mt-1">
            Select which columns correspond to our uploader fields.
            You can also download and use our template instead.
          </p>
          <p className="text-xs text-gray-500 mt-1">File: <span className="font-medium text-gray-700">{fileName}</span></p>
        </div>
        <Button variant="outline" className="flex-shrink-0" onClick={onDownloadTemplate}>
          <IconDownload className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Mapping summary — saved template restored, or auto-match status */}
      {templateApplied ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="flex items-start gap-2 text-sm text-emerald-800">
            <IconBookmark className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>
              Applied your saved column mapping from a previous similar upload.{' '}
              {requiredRemaining > 0
                ? `Review and complete the remaining required field${requiredRemaining === 1 ? '' : 's'}.`
                : 'Review the matched fields before continuing.'}
            </span>
          </p>
          <button
            type="button"
            onClick={resetToAutoMatch}
            className="self-start sm:self-center flex-shrink-0 text-xs font-medium text-emerald-700 hover:text-emerald-800 underline"
          >
            Use auto-match instead
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <IconInfoCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            {autoMatchedCount > 0
              ? `${autoMatchedCount} field${autoMatchedCount === 1 ? '' : 's'} auto-matched. `
              : 'We couldn’t auto-match your columns. '}
            {requiredRemaining > 0
              ? `Review and complete the remaining required field${requiredRemaining === 1 ? '' : 's'}.`
              : 'Review the matched fields before continuing.'}
          </p>
        </div>
      )}

      {/* Mapping table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-52">
                    GGX upload fields
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-48">
                    Your file header columns
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3" colSpan={SAMPLE_COLS + 1}>
                    <div className="flex items-center justify-between">
                      <span>Sample data from your file</span>
                      {sampleData.length > SAMPLE_COLS && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSampleOffset((o) => Math.max(0, o - 1))}
                            disabled={sampleOffset === 0}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
                          >
                            <IconChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSampleOffset((o) => Math.min(maxOffset, o + 1))}
                            disabled={sampleOffset >= maxOffset}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
                          >
                            <IconChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {GGX_FIELDS.map((field) => {
                  const selectedHeader = mapping[field.key] ?? '';
                  const headerIdx = selectedHeader ? fileHeaders.indexOf(selectedHeader) : -1;
                  const visibleSampleCols = Array.from({ length: SAMPLE_COLS }, (_, i) => {
                    const rowIdx = sampleOffset + i;
                    return rowIdx < sampleData.length && headerIdx >= 0
                      ? (sampleData[rowIdx][headerIdx] ?? '–')
                      : '–';
                  });

                  const requiredUnmapped = field.required && !selectedHeader;
                  const optionalUnmapped = !field.required && !selectedHeader;
                  const rowTone = requiredUnmapped
                    ? 'bg-red-50/40 hover:bg-red-50/60'
                    : optionalUnmapped
                      ? 'bg-gray-50 hover:bg-gray-100/60'
                      : 'hover:bg-gray-50/50';

                  return (
                    <tr
                      key={field.key}
                      className={`border-b border-gray-100 ${rowTone}`}
                    >
                      <td className="px-4 py-2.5">
                        <span className="text-sm font-medium text-gray-900">{field.label}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <Select
                          value={selectedHeader}
                          onChange={(e) => setField(field.key, e.target.value)}
                          className={`text-sm w-full ${requiredUnmapped ? 'border-red-300' : ''}`}
                        >
                          <option value="">Select column</option>
                          {fileHeaders.map((h) => {
                            // Mark availability so users can see which uploaded
                            // columns are still free vs already mapped elsewhere.
                            const suffix =
                              h === selectedHeader ? '' : usedHeaders.has(h) ? '  · In use' : '  · Available';
                            return (
                              <option key={h} value={h}>{h}{suffix}</option>
                            );
                          })}
                        </Select>
                      </td>
                      {visibleSampleCols.map((sample, i) => (
                        <td key={i} className="px-4 py-2.5 text-sm text-gray-600 max-w-[140px] truncate">
                          {sample}
                        </td>
                      ))}
                      {/* Fill remaining cols if fewer than SAMPLE_COLS */}
                      {Array.from({ length: SAMPLE_COLS - visibleSampleCols.length }).map((_, i) => (
                        <td key={`empty-${i}`} className="px-4 py-2.5" />
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Duplicate mapping warning */}
      {hasDuplicates && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            Some uploaded columns are mapped to more than one field
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-amber-700 list-disc list-inside">
            {duplicateMappings.map(([header, fields]) => (
              <li key={header}>
                <span className="font-medium">“{header}”</span> is mapped to: {fields.join(', ')}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-amber-700">Assign a different column to each field to continue.</p>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="outline" onClick={onBack} className="self-start">
          <IconArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex flex-col items-start sm:items-end gap-2">
          {/* Save mapping (mock/demo) — kept close to the Confirm CTA */}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              checked={saveMapping}
              onChange={(e) => toggleSaveMapping(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            Save this column mapping for future uploads with similar headers
          </label>
          <div className="flex items-center gap-3">
            {blockerText && (
              <p className="text-xs text-gray-500">{blockerText}</p>
            )}
            <Button disabled={!canConfirm} onClick={handleConfirm}>
              Confirm Fields and Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
