import { useState } from 'react';
import { IconDownload, IconArrowLeft, IconChevronRight, IconChevronLeft } from '@tabler/icons-react';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Card, CardContent } from './ui/Card';

// GGX field definitions for column mapping.
// Required fields must be mapped before Confirm is enabled.
const GGX_FIELDS = [
  { key: 'recipientName',     label: 'Recipient Name',             required: true  },
  { key: 'mobileNumber',      label: 'Mobile Number',              required: true  },
  { key: 'streetAddress',     label: 'Street Address',             required: true  },
  { key: 'province',          label: 'Province',                   required: true  },
  { key: 'cityMunicipality',  label: 'City/Municipality',          required: true  },
  { key: 'barangay',          label: 'Barangay',                   required: true  },
  { key: 'landmarks',         label: 'Landmarks, Floor or Unit #', required: false },
  { key: 'itemName',          label: 'Item Name',                  required: false },
  { key: 'pouchSize',         label: 'Pouch/box size',             required: false },
  { key: 'cod',               label: 'Cash on delivery (COD)',     required: false },
  { key: 'codAmount',         label: 'COD Amount',                 required: false },
  { key: 'itemProtection',    label: 'Item Protection',            required: false },
  { key: 'recipientPaysFees', label: 'Recipient pays fees',        required: false },
  { key: 'promoCode',         label: 'Promo code',                 required: false },
  { key: 'referenceId',       label: 'Reference ID',               required: false },
] as const;

type FieldKey = (typeof GGX_FIELDS)[number]['key'];

export interface BulkColumnMapperProps {
  fileName: string;
  fileHeaders: string[];
  sampleData: string[][];
  onConfirm: (mapping: Record<FieldKey, string>) => void;
  onBack: () => void;
  onDownloadTemplate: () => void;
}

function autoMap(fileHeaders: string[], fields: typeof GGX_FIELDS): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nf = norm(field.label);
    for (const h of fileHeaders) {
      const nh = norm(h);
      if (nf === nh || (nf.length > 4 && nh.includes(nf)) || (nh.length > 4 && nf.includes(nh))) {
        result[field.key] = h;
        break;
      }
    }
  }
  return result;
}

// Number of sample columns to show. The user can scroll through them.
const SAMPLE_COLS = 3;

export function BulkColumnMapper({ fileName, fileHeaders, sampleData, onConfirm, onBack, onDownloadTemplate }: BulkColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>(() => autoMap(fileHeaders, GGX_FIELDS));
  // Which sample data offset is visible (left/right scroll through sample columns).
  const [sampleOffset, setSampleOffset] = useState(0);

  const setField = (key: string, value: string) => setMapping((prev) => ({ ...prev, [key]: value }));

  const requiredMapped = GGX_FIELDS
    .filter((f) => f.required)
    .every((f) => !!mapping[f.key]);

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

                  return (
                    <tr key={field.key} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5">
                        <span className={`text-sm font-medium ${field.required ? 'text-gray-900' : 'text-gray-500'}`}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-0.5">*</span>}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <Select
                          value={selectedHeader}
                          onChange={(e) => setField(field.key, e.target.value)}
                          className="text-sm w-full"
                        >
                          <option value="">Select column</option>
                          {fileHeaders.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
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

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <IconArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          {!requiredMapped && (
            <p className="text-xs text-gray-500">Map all required fields (*) to continue</p>
          )}
          <Button disabled={!requiredMapped} onClick={() => onConfirm(mapping as Record<FieldKey, string>)}>
            Confirm Fields and Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
