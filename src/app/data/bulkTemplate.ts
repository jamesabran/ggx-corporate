// Bulk Upload template — field definitions taken directly from the official
// GoGo Xpress XLSX template (GGX_Template_v1 sheet). Used both to generate a
// downloadable template and to document the required columns inline.
//
// NOTE: the project has no spreadsheet library (xlsx/exceljs) and the task
// forbids adding one, so the generated template is a CSV (Excel-compatible).
// This is a documented fallback for the .xlsx original.

export const BULK_TEMPLATE_COLUMNS = [
  'Recipient Name',
  'Contact Number (Recipient)',
  'Street Address (Recipient)',
  'Province (Recipient)',
  'City / Municipality (Recipient)',
  'Barangay (Recipient)',
  'Landmarks, Floor or Unit Number (Recipient)',
  'Item Name',
  'Receptacle Size',
  'Collectible Amount',
  'Collect Item Value (COD)?',
  'Declared Value',
  'Insure full item value?',
  'Item Protection Fee',
  'Recipient Pays Fees',
  'Promo Code',
  'Reference ID (Optional)',
] as const;

// Two sample rows mirroring the official template so users see the expected format.
const SAMPLE_ROWS: string[][] = [
  ['Juan dela Cruz', '9170000000', '123 Rizal Ave.', 'Metro Manila', 'Las Pinas City', 'Almanza Uno', '3rd Floor, Unit 301', 'Makabayan Book', 'SMALL', '', 'NO', '', 'NO', '', 'NO', '', 'Test Reference ID 01'],
  ['Juan dela Cruz', '9170000000', '123 Rizal Ave.', 'Agusan Del Norte', 'Butuan City', 'Amparo', '3rd Floor, Unit 301', 'Makabayan Book', 'SMALL', '', 'NO', '', 'NO', '', 'NO', '', 'Test Reference ID 02'],
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
