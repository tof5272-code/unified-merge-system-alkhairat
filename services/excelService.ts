
import ExcelJS from 'exceljs';
import { CommitteeMember } from '../types';

interface MergeResult {
  blob: Blob;
  suggestedFileName: string;
}

export interface PreviewCell {
  value: string;
  isMaster: boolean;
  rowSpan: number;
  colSpan: number;
  style?: any;
}

/**
 * توحيد النصوص العربية لضمان دقة البحث (الألف، الياء، التشكيل، المسافات)
 */
export const normalizeArabic = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u0652]/g, '') // إزالة التشكيل
    .replace(/\s+/g, '') // إزالة كافة المسافات للمطابقة الصارمة بين الأسماء المركبة
    .trim();
};

export const getActualLastRow = (sheet: ExcelJS.Worksheet): number => {
  let lastDataRow = 0;
  sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    let rowHasData = false;
    row.eachCell({ includeEmpty: false }, (cell) => {
      const val = cell.value;
      if (val !== null && val !== undefined && val.toString().trim() !== '') {
        rowHasData = true;
      }
    });
    if (rowHasData) {
      lastDataRow = rowNumber;
    }
  });
  return lastDataRow;
};

export const extractTextForAI = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  const sheet = workbook.getWorksheet(1);
  if (!sheet) return "";

  const lastRow = getActualLastRow(sheet);
  let content = "";
  
  // نقوم بمسح الورقة بالكامل لضمان عدم فوات أي توقيع
  // نركز على الأعمدة الأولى والأسطر الأخيرة حيث تتواجد البيانات عادة
  for (let i = 1; i <= lastRow; i++) {
    const row = sheet.getRow(i);
    row.eachCell({ includeEmpty: false }, (cell) => {
      const val = getCellValueAsString(cell);
      if (val) content += val + " ";
    });
    content += "\n";
  }
  
  return content;
};

const extractNameFromStem = (stem: string, keyword: string): string => {
  let s = stem.replace(/\s+/g, ' ').trim();
  const patterns = [
    /حذف\s*و?\s*استحداث/gi,
    /توصية/gi,
    new RegExp(keyword, 'gi'),
    /[\-\_\s\:\|]+$/g,
    /^[\-\_\s\:\|]+/g
  ];
  patterns.forEach(p => { s = s.replace(p, '').trim(); });
  return s.replace(/^[\-\_\s\+\:\|]+|[\-\_\s\+\:\|]+$/g, '').trim();
};

const getCellValueAsString = (cell: ExcelJS.Cell): string => {
  const val = cell.value;
  if (val === null || val === undefined) return '';
  if (typeof val === 'object' && 'richText' in val) return (val as any).richText.map((t: any) => t.text).join('');
  if (typeof val === 'object' && 'formula' in val) return (val as any).result !== undefined ? (val as any).result.toString() : '';
  if (typeof val === 'object' && 'hyperlink' in val) return typeof (val as any).text === 'string' ? (val as any).text : (val as any).hyperlink;
  if (val instanceof Date) return val.toLocaleDateString('ar-IQ');
  return val.toString();
};

export const mergeExcelFiles = async (
  files: File[],
  keyword: string,
  startRow: number,
  committee: CommitteeMember[],
  onProgress: (progress: number) => void,
  onStatus: (status: string) => void
): Promise<MergeResult> => {
  const workbook = new ExcelJS.Workbook();
  const mainSheet = workbook.addWorksheet('المدمج', {
    views: [{ rightToLeft: true }]
  });

  let currentMainRow = 1;
  const cleanedNames = files.map(f => extractNameFromStem(f.name.replace(/\.[^/.]+$/, ""), keyword)).filter(n => n.length > 0);
  const prefix = keyword.includes("حذف") && keyword.includes("استحداث") ? "حذف واستحداث" : keyword;
  let suggestedFileName = cleanedNames.length > 0 ? `${prefix} ${cleanedNames.join(' + ')}.xlsx` : `${prefix} مدمج.xlsx`;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onStatus(`معالجة (${i + 1}/${files.length}): ${file.name}`);
    const arrayBuffer = await file.arrayBuffer();
    const sourceWorkbook = new ExcelJS.Workbook();
    await sourceWorkbook.xlsx.load(arrayBuffer);
    const sourceSheet = sourceWorkbook.getWorksheet(1);
    if (!sourceSheet) continue;

    const sourceLastRow = getActualLastRow(sourceSheet);
    if (sourceLastRow === 0) continue;

    const actualStartRow = (i === 0) ? 1 : startRow;
    const startTargetRow = currentMainRow;
    const rowsToCopy = sourceLastRow - actualStartRow + 1;
    if (rowsToCopy <= 0) continue;

    for (let r = actualStartRow; r <= sourceLastRow; r++) {
      const sourceRow = sourceSheet.getRow(r);
      const targetRowIdx = startTargetRow + (r - actualStartRow);
      const targetRow = mainSheet.getRow(targetRowIdx);
      if (sourceRow.height) targetRow.height = sourceRow.height;
      sourceRow.eachCell({ includeEmpty: true }, (sCell, colNumber) => {
        const tCell = targetRow.getCell(colNumber);
        tCell.value = sCell.value;
        if (sCell.style) tCell.style = JSON.parse(JSON.stringify(sCell.style));
      });

      if (sourceSheet.model.merges) {
        sourceSheet.model.merges.forEach((mergeRange: string) => {
          const range = parseAddress(mergeRange);
          if (range.top === r && range.top >= actualStartRow) {
            const rowOffset = startTargetRow - actualStartRow;
            try { mainSheet.mergeCells(range.top + rowOffset, range.left, range.bottom + rowOffset, range.right); } catch (e) {}
          }
        });
      }
    }
    currentMainRow += rowsToCopy;
    if (i === 0) sourceSheet.columns?.forEach((col, idx) => { if (col.width) mainSheet.getColumn(idx + 1).width = col.width; });
    onProgress(Math.round(((i + 1) / files.length) * 100));
  }

  onStatus('إعادة الترقيم...');
  let counter = 1;
  for (let r = 1; r < currentMainRow; r++) {
    const row = mainSheet.getRow(r);
    const cell = row.getCell(1);
    if (cell.isMerged && cell.master.address !== cell.address) continue;
    const valStr = getCellValueAsString(cell).trim();
    if (valStr !== '' && /^\d+$/.test(valStr)) { cell.value = counter; counter++; }
  }

  if (keyword.includes('توصية')) {
    onStatus('إضافة التواقيع...');
    addCommitteeSignatures(mainSheet, currentMainRow + 2, committee);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return { blob: new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), suggestedFileName };
};

function addCommitteeSignatures(sheet: ExcelJS.Worksheet, startRow: number, committee: CommitteeMember[]) {
  const boldFont = { name: 'Calibri', size: 11, bold: true };
  const centerAlign: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle' };
  committee.forEach(item => {
    const roleRow = sheet.getRow(startRow + item.rowOffset);
    const roleCell = roleRow.getCell(item.col);
    roleCell.value = item.role;
    roleCell.font = boldFont;
    roleCell.alignment = centerAlign;
    const nameRow = sheet.getRow(startRow + item.rowOffset + 1);
    const nameCell = nameRow.getCell(item.col);
    nameCell.value = item.name;
    nameCell.font = boldFont;
    nameCell.alignment = centerAlign;
    try {
      sheet.mergeCells(startRow + item.rowOffset, item.col, startRow + item.rowOffset, item.col + 1);
      sheet.mergeCells(startRow + item.rowOffset + 1, item.col, startRow + item.rowOffset + 1, item.col + 1);
    } catch (e) {}
  });
}

export const getFilePreviewData = async (file: File): Promise<PreviewCell[][]> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) return [];

  const lastRow = Math.min(60, getActualLastRow(worksheet));
  const lastCol = Math.min(worksheet.columnCount, 16); 
  
  const previewData: PreviewCell[][] = [];

  for (let r = 1; r <= lastRow; r++) {
    const rowData: PreviewCell[] = [];
    const row = worksheet.getRow(r);
    for (let c = 1; c <= lastCol; c++) {
      const cell = row.getCell(c);
      
      let isMaster = true;
      let rowSpan = 1;
      let colSpan = 1;

      if (cell.isMerged) {
        if (cell.master.address !== cell.address) {
          isMaster = false;
        } else {
          worksheet.model.merges.forEach((m: string) => {
             const range = parseAddress(m);
             if (range.top === r && range.left === c) {
               rowSpan = range.bottom - range.top + 1;
               colSpan = range.right - range.left + 1;
             }
          });
        }
      }

      rowData.push({
        value: getCellValueAsString(cell),
        isMaster,
        rowSpan,
        colSpan,
        style: cell.style
      });
    }
    previewData.push(rowData);
  }
  return previewData;
};

function parseAddress(address: string) {
  const [start, end] = address.split(':');
  const decode = (addr: string) => {
    const match = addr.match(/([A-Z]+)(\d+)/);
    if (!match) return { col: 1, row: 1 };
    const colStr = match[1];
    let col = 0;
    for (let i = 0; i < colStr.length; i++) col = col * 26 + (colStr.charCodeAt(i) - 64);
    return { col, row: parseInt(match[2]) };
  };
  const s = decode(start);
  const e = end ? decode(end) : s;
  return { top: s.row, left: s.col, bottom: e.row, right: e.col };
}
