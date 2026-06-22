// Bulk Upload template — field definitions taken directly from the official
// GoGo Xpress XLSX template (GGX_Template_v1 sheet). Used both to generate a
// downloadable template and to document the required columns inline.
//
// NOTE: the project has no spreadsheet library (xlsx/exceljs) and the task
// forbids adding one, so the generated template is a CSV (Excel-compatible).
// This is a documented fallback for the .xlsx original.

// Canonical Bulk Upload field labels — the single source of truth shared across
// the column mapper, in-app spreadsheet grid, failed-orders retry table, and the
// downloadable template, so the same field uses the same name everywhere.
// Optional fields carry "(Optional)" in the label; required fields omit it (no
// asterisks). Item Protection Fee is intentionally NOT a field here — it is a
// derived display only, never an editable/mappable column.
export const BULK_FIELD_LABELS = {
  name:              'Name',
  mobile:            'Mobile',
  streetAddress:     'Street Address',
  province:          'Province',
  cityMunicipality:  'City / Municipality',
  barangay:          'Barangay',
  landmarks:         'Landmarks, Floor or Unit Number (Optional)',
  itemName:          'Item Name',
  pouchSize:         'Pouch/box size',
  lengthCm:          'Length (cm)',
  widthCm:           'Width (cm)',
  heightCm:          'Height (cm)',
  weightKg:          'Weight (kg)',
  codAmount:         'COD Amount',
  cod:               'Cash on delivery (COD)',
  declaredValue:     'Declared Item Value',
  insureFull:        'Insure full item value?',
  recipientPaysFees: 'Recipient Pays Fees',
  promoCode:         'Promo Code (Optional)',
  referenceId:       'Reference ID (Optional)',
} as const;

export const BULK_TEMPLATE_COLUMNS = [
  BULK_FIELD_LABELS.name,
  BULK_FIELD_LABELS.mobile,
  BULK_FIELD_LABELS.streetAddress,
  BULK_FIELD_LABELS.province,
  BULK_FIELD_LABELS.cityMunicipality,
  BULK_FIELD_LABELS.barangay,
  BULK_FIELD_LABELS.landmarks,
  BULK_FIELD_LABELS.itemName,
  BULK_FIELD_LABELS.pouchSize,
  BULK_FIELD_LABELS.lengthCm,
  BULK_FIELD_LABELS.widthCm,
  BULK_FIELD_LABELS.heightCm,
  BULK_FIELD_LABELS.weightKg,
  BULK_FIELD_LABELS.codAmount,
  BULK_FIELD_LABELS.cod,
  BULK_FIELD_LABELS.declaredValue,
  BULK_FIELD_LABELS.insureFull,
  BULK_FIELD_LABELS.recipientPaysFees,
  BULK_FIELD_LABELS.promoCode,
  BULK_FIELD_LABELS.referenceId,
] as const;

// Two sample rows mirroring the official template so users see the expected
// format. Column order matches BULK_TEMPLATE_COLUMNS (no Item Protection Fee).
// Length/Width/Height/Weight columns are empty for normal sizes (optional).
// For CUSTOM size, all four dimension/weight fields are required.
const SAMPLE_ROWS: string[][] = [
  ['Juan dela Cruz', '9170000000', '123 Rizal Ave.', 'Metro Manila', 'Las Pinas City', 'Almanza Uno', '3rd Floor, Unit 301', 'Makabayan Book', 'SMALL', '', '', '', '', '', 'NO', '', 'NO', 'NO', '', 'Test Reference ID 01'],
  ['Juan dela Cruz', '9170000000', '123 Rizal Ave.', 'Agusan Del Norte', 'Butuan City', 'Amparo', '3rd Floor, Unit 301', 'Makabayan Book', 'SMALL', '', '', '', '', '', 'NO', '', 'NO', 'NO', '', 'Test Reference ID 02'],
];

export const RECEPTACLE_SIZES = ['SMALL', 'MEDIUM', 'LARGE', 'BOX', 'OVERSIZED', 'CUSTOM'];

function csvCell(value: string): string {
  // Quote cells containing commas, quotes, or newlines.
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(): string {
  const lines = [BULK_TEMPLATE_COLUMNS.map(csvCell).join(',')];
  for (const row of SAMPLE_ROWS) lines.push(row.map(csvCell).join(','));
  return lines.join('\r\n');
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Generate and download the Bulk Upload template as a CSV file. */
export function downloadBulkTemplate(): void {
  const csv = buildCsv();
  // Prepend BOM so Excel opens UTF-8 correctly.
  triggerDownload(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }),
    'GoGo_Xpress_Bulk_Upload_Template.csv');
}

function htmlCell(value: string): string {
  const escaped = value
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<td>${escaped}</td>`;
}

/**
 * Generate and download the Bulk Upload template as an Excel-openable .xls file.
 * No spreadsheet library is bundled (and adding one is out of scope), so this
 * emits an HTML table that Excel opens natively — a documented .xlsx fallback.
 * Columns come from the SAME `BULK_TEMPLATE_COLUMNS` source as the CSV, so both
 * formats always carry the identical fields (including the four dimweight ones).
 */
export function downloadBulkTemplateXls(): void {
  const header = `<tr>${BULK_TEMPLATE_COLUMNS.map((c) => `<th>${c}</th>`).join('')}</tr>`;
  const body = SAMPLE_ROWS.map((row) => `<tr>${row.map(htmlCell).join('')}</tr>`).join('');
  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
    `xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" />` +
    `</head><body><table border="1">${header}${body}</table></body></html>`;
  triggerDownload(new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' }),
    'GoGo_Xpress_Bulk_Upload_Template.xls');
}
