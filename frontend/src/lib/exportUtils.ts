/**
 * Universal CSV Export Utility for PaperBuddy School ERP
 * Generates RFC-4180 compliant CSV files with UTF-8 BOM encoding
 * for seamless compatibility with Microsoft Excel, Apple Numbers, and Google Sheets.
 */

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined | unknown)[][]
): void {
  // Guard against execution in non-browser / SSR environments
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const escapeCell = (val: unknown): string => {
    // 1. Handle Null / Undefined: output empty cell (blank in Excel/Sheets, ISBLANK() returns true)
    if (val === null || val === undefined) {
      return '';
    }

    // 2. Handle Numbers: output unquoted numeric representation so Excel/Sheets treat as numbers (SUM, AVG, currency)
    if (typeof val === 'number') {
      return Number.isFinite(val) ? String(val) : '';
    }

    // 3. Handle Booleans: standard uppercase TRUE/FALSE recognized by spreadsheet software
    if (typeof val === 'boolean') {
      return val ? 'TRUE' : 'FALSE';
    }

    // 4. Handle Dates: ISO string representation
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? '' : val.toISOString();
    }

    // 5. Stringify other objects or primitives
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val);

    // 6. CSV / Formula Injection Protection (CWE-1236):
    // If a string begins with dangerous formula triggers (=, +, -, @, \t, \r) and is NOT a valid finite number,
    // prepend a single quote (') so Excel/Sheets displays it as literal text without executing formulas/DDE.
    const trimmed = str.trimStart();
    if (/^[=+\-@\t\r]/.test(trimmed)) {
      if (isNaN(Number(trimmed))) {
        str = `'${str}`;
      }
    }

    // 7. RFC-4180 Escaping:
    // If value contains quotes, commas, newlines, or leading/trailing whitespace,
    // wrap in double quotes and escape internal quotes by doubling them (" -> "")
    const needsQuotes =
      str.includes('"') ||
      str.includes(',') ||
      str.includes('\n') ||
      str.includes('\r') ||
      str.startsWith(' ') ||
      str.endsWith(' ') ||
      str.startsWith('\t') ||
      str.endsWith('\t');

    if (needsQuotes) {
      return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  };

  const lines: string[] = [];
  if (headers && headers.length > 0) {
    lines.push(headers.map(escapeCell).join(','));
  }
  if (rows && rows.length > 0) {
    for (const row of rows) {
      lines.push(row.map(escapeCell).join(','));
    }
  }

  const csvContent = lines.join('\r\n');

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) ensuring Excel displays unicode characters properly (e.g. ₹ symbol)
  // Passing as separate array elements avoids redundant duplicate string allocation in memory
  const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Sanitize filename to avoid invalid filesystem characters
  const trimmed = (filename || '').trim();
  const rawFilename = trimmed.length > 0 ? trimmed : 'export';
  const sanitizedFilename = rawFilename.replace(/[/\\?%*:|"<>]/g, '_');
  const cleanFilename = sanitizedFilename.toLowerCase().endsWith('.csv')
    ? sanitizedFilename
    : `${sanitizedFilename}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Asynchronous cleanup: avoids race condition in Firefox/Safari where immediate revocation cancels download
  setTimeout(() => {
    if (link.parentNode) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 200);
}
