/**
 * Table Data Model Utilities
 * 
 * New model shape:
 * {
 *   type: 'table',
 *   x, y, width, height, rotation, opacity, visible, locked,
 *
 *   // Structure
 *   columns: [{ id, header, width, minWidth?, locked?, binding?, align? }],
 *   rows:    [{ id, height?, cells: [{ id, content, colSpan?, rowSpan?, style? }] }],
 *
 *   // Table-level styling
 *   tableStyle: {
 *     headerBg, headerColor, headerFontSize, headerFontFamily, headerFontStyle,
 *     headerAlign, headerVerticalAlign, headerBorderColor, headerBorderWidth,
 *     cellFontSize, cellFontFamily, cellColor, cellBorderColor, cellBorderWidth,
 *     cellPadding, cellLineHeight, cellVerticalAlign,
 *     alternateRowBg, alternateRowEnabled,
 *     outerBorderColor, outerBorderWidth,
 *     widthMode,        // 'fixed' | 'full' | 'auto'
 *     minRowHeight,
 *     cellSpacing,
 *     showHeader,
 *   }
 * }
 */

// ─── ID Generation ────────────────────────────────────────────
let _seqCell = 0;
const uid = (prefix) => `${prefix}_${Date.now()}_${(++_seqCell).toString(36)}`;
const colId = () => uid('col');
const rowId = () => uid('row');
const cellId = () => uid('cell');

// ─── Defaults ─────────────────────────────────────────────────
export const DEFAULT_TABLE_STYLE = {
  headerBg: '#f0f4f8',
  headerColor: '#1a202c',
  headerFontSize: 13,
  headerFontFamily: 'Arial',
  headerFontStyle: 'bold',
  headerAlign: 'left',
  headerVerticalAlign: 'middle',
  headerBorderColor: '#cbd5e0',
  headerBorderWidth: 1,

  cellFontSize: 12,
  cellFontFamily: 'Arial',
  cellColor: '#2d3748',
  cellBorderColor: '#e2e8f0',
  cellBorderWidth: 1,
  cellPadding: 6,
  cellLineHeight: 1.3,
  cellVerticalAlign: 'middle',

  alternateRowBg: '#f7fafc',
  alternateRowEnabled: true,

  outerBorderColor: '#cbd5e0',
  outerBorderWidth: 1,

  widthMode: 'fixed',   // 'fixed' | 'full' | 'auto'
  minRowHeight: 28,
  cellSpacing: 0,
  showHeader: true,
};

export const DEFAULT_CELL_STYLE = {
  fontSize: null,        // null = inherit table default
  fontFamily: null,
  fontStyle: null,       // 'normal' | 'bold' | 'italic' | 'bold italic'
  color: null,
  bg: null,
  align: null,           // 'left' | 'center' | 'right'
  verticalAlign: null,
  padding: null,
  borderTop: null,
  borderRight: null,
  borderBottom: null,
  borderLeft: null,
  wrap: true,
  lineHeight: null,
};

// ─── Cell factory ─────────────────────────────────────────────
export const createCell = (content = '', overrides = {}) => ({
  id: cellId(),
  content,
  colSpan: 1,
  rowSpan: 1,
  style: { ...DEFAULT_CELL_STYLE },
  ...overrides,
});

// ─── Column factory ───────────────────────────────────────────
export const createColumn = (header = 'Column', width = 120, overrides = {}) => ({
  id: colId(),
  header,
  width,
  minWidth: 40,
  locked: false,
  binding: null,
  align: 'left',
  ...overrides,
});

// ─── Row factory ──────────────────────────────────────────────
export const createRow = (columnCount, cellContents = [], overrides = {}) => ({
  id: rowId(),
  height: null, // null = auto (use minRowHeight)
  cells: Array.from({ length: columnCount }, (_, i) =>
    createCell(cellContents[i] || '')
  ),
  ...overrides,
});

// ─── Create a fresh table element ─────────────────────────────
export const createTableElement = (colCount = 4, rowCount = 3, pageWidth = 794) => {
  const defaultHeaders = ['Description', 'Qty', 'Rate', 'Amount'];
  const defaultBindings = ['{{product.name}}', '{{product.quantity}}', '{{product.price}}', '{{product.total}}'];
  const effectiveCols = Math.max(1, colCount);
  const baseColWidth = Math.floor(Math.min(650, pageWidth - 100) / effectiveCols);

  const columns = Array.from({ length: effectiveCols }, (_, i) =>
    createColumn(
      defaultHeaders[i] || `Col ${i + 1}`,
      baseColWidth,
      i < defaultBindings.length ? { binding: defaultBindings[i] } : {}
    )
  );

  const rows = Array.from({ length: Math.max(1, rowCount) }, (_, ri) =>
    createRow(effectiveCols, ri === 0 ? defaultBindings.slice(0, effectiveCols) : [])
  );

  const totalWidth = columns.reduce((s, c) => s + c.width, 0);

  return {
    type: 'table',
    x: 50,
    y: 250,
    width: totalWidth,
    height: null, // auto-calculated
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    columns,
    rows,
    tableStyle: { ...DEFAULT_TABLE_STYLE },
  };
};

// ─── Migration: Legacy → New model ───────────────────────────
export const migrateLegacyTable = (element) => {
  // Already migrated?
  if (element.rows?.[0]?.cells) return element;
  if (element.tableStyle) return element;

  const legacyCols = element.columns || [];
  const legacyRows = element.rows || [];

  const columns = legacyCols.map((col, i) =>
    createColumn(col.header || `Col ${i + 1}`, col.width || 100, {
      align: col.align || 'left',
    })
  );

  const rows = legacyRows.map((row) => {
    const cellArray = Array.isArray(row) ? row : [];
    return createRow(
      columns.length,
      cellArray.map(c => (typeof c === 'string' ? c : String(c ?? '')))
    );
  });

  return {
    ...element,
    columns,
    rows,
    tableStyle: { ...DEFAULT_TABLE_STYLE },
  };
};

// ─── Column Operations ────────────────────────────────────────
export const addColumnToTable = (element, afterIndex = -1) => {
  const cols = [...element.columns];
  const newCol = createColumn('New Column', 100);
  const insertAt = afterIndex < 0 ? cols.length : afterIndex + 1;
  cols.splice(insertAt, 0, newCol);

  const rows = element.rows.map(row => {
    const cells = [...row.cells];
    cells.splice(insertAt, 0, createCell());
    return { ...row, cells };
  });

  return { ...element, columns: cols, rows };
};

export const removeColumnFromTable = (element, colIndex) => {
  if (element.columns.length <= 1) return element;
  const columns = element.columns.filter((_, i) => i !== colIndex);
  const rows = element.rows.map(row => ({
    ...row,
    cells: row.cells.filter((_, i) => i !== colIndex),
  }));
  return { ...element, columns, rows };
};

export const reorderColumns = (element, fromIndex, toIndex) => {
  const columns = [...element.columns];
  const [moved] = columns.splice(fromIndex, 1);
  columns.splice(toIndex, 0, moved);

  const rows = element.rows.map(row => {
    const cells = [...row.cells];
    const [movedCell] = cells.splice(fromIndex, 1);
    cells.splice(toIndex, 0, movedCell);
    return { ...row, cells };
  });

  return { ...element, columns, rows };
};

export const autoDistributeColumns = (element) => {
  const totalWidth = element.width || element.columns.reduce((s, c) => s + c.width, 0);
  const equalWidth = Math.floor(totalWidth / element.columns.length);
  const columns = element.columns.map(col => ({
    ...col,
    width: col.locked ? col.width : equalWidth,
  }));
  return { ...element, columns };
};

// ─── Row Operations ───────────────────────────────────────────
export const addRowToTable = (element, afterIndex = -1) => {
  const newRow = createRow(element.columns.length);
  const rows = [...element.rows];
  const insertAt = afterIndex < 0 ? rows.length : afterIndex + 1;
  rows.splice(insertAt, 0, newRow);
  return { ...element, rows };
};

export const removeRowFromTable = (element, rowIndex) => {
  if (element.rows.length <= 1) return element;
  return { ...element, rows: element.rows.filter((_, i) => i !== rowIndex) };
};

// ─── Cell Merge / Split ───────────────────────────────────────
export const mergeCells = (element, startRow, startCol, endRow, endCol) => {
  const rowSpan = endRow - startRow + 1;
  const colSpan = endCol - startCol + 1;
  if (rowSpan < 1 || colSpan < 1) return element;

  const rows = element.rows.map((row, ri) => {
    if (ri < startRow || ri > endRow) return row;
    return {
      ...row,
      cells: row.cells.map((cell, ci) => {
        if (ci < startCol || ci > endCol) return cell;
        if (ri === startRow && ci === startCol) {
          return { ...cell, colSpan, rowSpan };
        }
        // Mark merged-away cells (hidden)
        return { ...cell, colSpan: 0, rowSpan: 0, _merged: true };
      }),
    };
  });

  return { ...element, rows };
};

export const splitCell = (element, rowIndex, colIndex) => {
  const rows = element.rows.map((row, ri) => ({
    ...row,
    cells: row.cells.map((cell, ci) => {
      if (cell._merged && ri >= rowIndex && ci >= colIndex) {
        return { ...cell, colSpan: 1, rowSpan: 1, _merged: false };
      }
      if (ri === rowIndex && ci === colIndex) {
        return { ...cell, colSpan: 1, rowSpan: 1 };
      }
      return cell;
    }),
  }));
  return { ...element, rows };
};

// ─── Normalize column widths to match table width ─────────────
export const normalizeColumnsToWidth = (columns, totalWidth) => {
  if (!Array.isArray(columns) || columns.length === 0) return [];
  const safeTotalWidth = Math.max(100, totalWidth || 100);
  const sourceTotal = columns.reduce((sum, c) => sum + (c.width || 0), 0);

  if (sourceTotal <= 0) {
    const eq = safeTotalWidth / columns.length;
    return columns.map(c => ({ ...c, width: eq }));
  }

  const scale = safeTotalWidth / sourceTotal;
  return columns.map(c => ({
    ...c,
    width: Math.max(c.minWidth || 40, (c.width || 0) * scale),
  }));
};

// ─── Compute actual table height from row data ────────────────
export const computeTableHeight = (element) => {
  const style = element.tableStyle || DEFAULT_TABLE_STYLE;
  const headerH = style.showHeader ? Math.max(style.minRowHeight, 32) : 0;
  const rowH = element.rows.reduce((sum, row) => {
    return sum + Math.max(style.minRowHeight, row.height || style.minRowHeight);
  }, 0);
  return headerH + rowH;
};

// ─── Invoice column type presets ──────────────────────────────
export const INVOICE_COLUMN_PRESETS = {
  description: { header: 'Description', binding: '{{product.name}}', align: 'left', width: 200 },
  quantity:    { header: 'Qty',         binding: '{{product.quantity}}', align: 'center', width: 80 },
  price:       { header: 'Price',       binding: '{{product.price}}', align: 'right', width: 100 },
  tax:         { header: 'Tax',         binding: '{{invoice.tax}}', align: 'right', width: 80 },
  discount:    { header: 'Discount',    binding: '{{product.discount}}', align: 'right', width: 80 },
  total:       { header: 'Total',       binding: '{{product.total}}', align: 'right', width: 120 },
};

// ─── Border style presets ─────────────────────────────────────
export const TABLE_BORDER_PRESETS = {
  none:    { cellBorderWidth: 0, outerBorderWidth: 0, headerBorderWidth: 0 },
  minimal: { cellBorderWidth: 0, outerBorderWidth: 1, headerBorderWidth: 1 },
  grid:    { cellBorderWidth: 1, outerBorderWidth: 1, headerBorderWidth: 1 },
  thick:   { cellBorderWidth: 1, outerBorderWidth: 2, headerBorderWidth: 2 },
  horizontal: { cellBorderWidth: 0, outerBorderWidth: 0, headerBorderWidth: 1, cellBorderColor: '#e2e8f0' },
};

// ─── Get effective cell style (cell overrides → table defaults) ─
export const getEffectiveCellStyle = (cell, tableStyle, isHeader = false) => {
  const ts = tableStyle || DEFAULT_TABLE_STYLE;
  const cs = cell?.style || {};

  if (isHeader) {
    return {
      fontSize: cs.fontSize ?? ts.headerFontSize,
      fontFamily: cs.fontFamily ?? ts.headerFontFamily,
      fontStyle: cs.fontStyle ?? ts.headerFontStyle,
      color: cs.color ?? ts.headerColor,
      bg: cs.bg ?? ts.headerBg,
      align: cs.align ?? ts.headerAlign,
      verticalAlign: cs.verticalAlign ?? ts.headerVerticalAlign,
      padding: cs.padding ?? ts.cellPadding,
      wrap: cs.wrap ?? true,
      lineHeight: cs.lineHeight ?? ts.cellLineHeight,
      borderColor: cs.borderTop ?? ts.headerBorderColor,
      borderWidth: ts.headerBorderWidth,
    };
  }

  return {
    fontSize: cs.fontSize ?? ts.cellFontSize,
    fontFamily: cs.fontFamily ?? ts.cellFontFamily,
    fontStyle: cs.fontStyle ?? 'normal',
    color: cs.color ?? ts.cellColor,
    bg: cs.bg ?? null,
    align: cs.align ?? 'left',
    verticalAlign: cs.verticalAlign ?? ts.cellVerticalAlign,
    padding: cs.padding ?? ts.cellPadding,
    wrap: cs.wrap ?? true,
    lineHeight: cs.lineHeight ?? ts.cellLineHeight,
    borderColor: cs.borderTop ?? ts.cellBorderColor,
    borderWidth: ts.cellBorderWidth,
  };
};
