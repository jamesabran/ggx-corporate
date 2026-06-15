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
const SAMPLE_ROWS: string[][] = [
  ['Juan dela Cruz', '9170000000', '123 Rizal Ave.', 'Metro Manila', 'Las Pinas City', 'Almanza Uno', '3rd Floor, Unit 301', 'Makabayan Book', 'SMALL', '', 'NO', '', 'NO', 'NO', '', 'Test Reference ID 01'],
  ['Juan dela Cruz', '9170000000', '123 Rizal Ave.', 'Agusan Del Norte', 'Butuan City', 'Amparo', '3rd Floor, Unit 301', 'Makabayan Book', 'SMALL', '', 'NO', '', 'NO', 'NO', '', 'Test Reference ID 02'],
];

export const RECEPTACLE_SIZES = ['SMALL', 'MEDIUM', 'LARGE', 'BOX', 'OVERSIZED'];

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

/** Generate and download the Bulk Upload template as a CSV file. */
export function downloadBulkTemplate(): void {
  const csv = buildCsv();
  // Prepend BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'GoGo_Xpress_Bulk_Upload_Template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
