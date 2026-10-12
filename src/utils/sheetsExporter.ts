/**
 * Utilities to convert extracted JSON tabular data into Google Sheets formats
 */

export function convertToCsv(columns: string[], rows: Record<string, any>[]): string {
  if (!columns.length) return '';

  const escapeCell = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = columns.map(escapeCell).join(',');
  const rowLines = rows.map((row) => {
    return columns.map((col) => escapeCell(row[col])).join(',');
  });

  // Include UTF-8 BOM for Spanish character encoding compatibility
  return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
}

export function downloadCsv(columns: string[], rows: Record<string, any>[], filename = 'datos_imagen_sheets.csv') {
  const csvContent = convertToCsv(columns, rows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function convertToTsv(columns: string[], rows: Record<string, any>[]): string {
  if (!columns.length) return '';

  const cleanCell = (val: any) => {
    if (val === null || val === undefined) return '';
    return String(val).replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
  };

  const headerLine = columns.map(cleanCell).join('\t');
  const rowLines = rows.map((row) => {
    return columns.map((col) => cleanCell(row[col])).join('\t');
  });

  return [headerLine, ...rowLines].join('\n');
}

export async function copyTsvToClipboard(columns: string[], rows: Record<string, any>[]): Promise<boolean> {
  try {
    const tsv = convertToTsv(columns, rows);
    await navigator.clipboard.writeText(tsv);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

export function downloadJson(data: any, filename = 'datos_imagen.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const GOOGLE_APPS_SCRIPT_SNIPPET = `/**
 * Código para Google Apps Script
 * En tu Google Sheet: Extensiones > Apps Script > Pega este código > Implementar > Nueva implementación (Tipo: Aplicación Web, Acceso: Cualquier persona)
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = payload.data.rows;
    var columns = payload.data.columns;
    
    // Si la hoja está vacía, escribe los encabezados
    if (sheet.getLastRow() === 0 && columns && columns.length > 0) {
      sheet.appendRow(columns);
    }
    
    // Agrega cada fila
    if (rows && rows.length > 0) {
      for (var i = 0; i < rows.length; i++) {
        var rowData = [];
        for (var c = 0; c < columns.length; c++) {
          rowData.push(rows[i][columns[c]] || '');
        }
        sheet.appendRow(rowData);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", added: rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
