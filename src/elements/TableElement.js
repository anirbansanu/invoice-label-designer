import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Group, Rect, Text, Line, Transformer } from 'react-konva';
import { useCanvas } from '../context/CanvasContext';
import { parsePlaceholders } from '../utils/placeholderParser';
import {
  migrateLegacyTable,
  normalizeColumnsToWidth,
  getEffectiveCellStyle,
  DEFAULT_TABLE_STYLE,
} from '../utils/tableUtils';

// ─── Column resize handle (mouse-event based, no Konva drag) ──
const ColumnResizeHandle = ({ x, height, onResizeStart, previewMode }) => {
  if (previewMode) return null;
  return (
    <Rect
      x={x - 3}
      y={0}
      width={6}
      height={height}
      fill="transparent"
      hitStrokeWidth={8}
      onMouseEnter={(e) => { e.target.getStage().container().style.cursor = 'col-resize'; }}
      onMouseLeave={(e) => { e.target.getStage().container().style.cursor = 'default'; }}
      onMouseDown={(e) => {
        e.cancelBubble = true;
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        onResizeStart(pos.x);
      }}
    />
  );
};

// ─── Row resize handle (mouse-event based, no Konva drag) ────
const RowResizeHandle = ({ y, width, onResizeStart, previewMode }) => {
  if (previewMode) return null;
  return (
    <Rect
      x={0}
      y={y - 3}
      width={width}
      height={6}
      fill="transparent"
      hitStrokeWidth={8}
      onMouseEnter={(e) => { e.target.getStage().container().style.cursor = 'row-resize'; }}
      onMouseLeave={(e) => { e.target.getStage().container().style.cursor = 'default'; }}
      onMouseDown={(e) => {
        e.cancelBubble = true;
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        onResizeStart(pos.y);
      }}
    />
  );
};

const TableElement = ({ element: rawElement, isSelected, onSelect, onChange, snapToGrid, previewMode }) => {
  const { sampleData } = useCanvas();
  const groupRef = useRef();
  const transformerRef = useRef();
  const editInputRef = useRef(null);
  const editOverlayRef = useRef(null);

  // Migrate legacy element on every render (cheap if already migrated)
  const element = useMemo(() => migrateLegacyTable(rawElement), [rawElement]);

  const [selectedCell, setSelectedCell] = useState(null);
  const [resizingCol, setResizingCol] = useState(null);
  const [resizingRow, setResizingRow] = useState(null);
  const [editingHeader, setEditingHeader] = useState(null);

  // Keep a ref to current element for use in resize event listeners
  const elementRef = useRef(element);
  elementRef.current = element;

  const ts = useMemo(() => ({ ...DEFAULT_TABLE_STYLE, ...element.tableStyle }), [element.tableStyle]);

  // ─── Transformer sync ──────────────────────────────────────
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected, element.width, element.height, element.x, element.y, element.rotation]);

  // ─── Computed layout ───────────────────────────────────────
  const columns = useMemo(() => {
    const totalWidth = element.width || element.columns.reduce((s, c) => s + c.width, 0) || 400;
    return normalizeColumnsToWidth(element.columns, totalWidth);
  }, [element.columns, element.width]);

  const totalWidth = useMemo(() => columns.reduce((s, c) => s + c.width, 0), [columns]);

  const headerHeight = useMemo(() => {
    if (!ts.showHeader) return 0;
    return Math.max(ts.minRowHeight, 32);
  }, [ts.showHeader, ts.minRowHeight]);

  const rowHeights = useMemo(() => {
    return (element.rows || []).map(row =>
      Math.max(ts.minRowHeight, row.height || ts.minRowHeight)
    );
  }, [element.rows, ts.minRowHeight]);

  const totalHeight = useMemo(() => {
    return headerHeight + rowHeights.reduce((s, h) => s + h, 0);
  }, [headerHeight, rowHeights]);

  const effectiveWidth = Math.max(100, totalWidth);
  const effectiveHeight = Math.max(50, totalHeight);

  // ─── Handlers ──────────────────────────────────────────────
  const handleDragEnd = useCallback((e) => {
    const newPos = snapToGrid ? snapToGrid(e.target.x(), e.target.y()) : { x: e.target.x(), y: e.target.y() };
    onChange({ ...element, x: newPos.x, y: newPos.y });
  }, [element, onChange, snapToGrid]);

  const handleTransformEnd = useCallback(() => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const nextWidth = Math.max(100, effectiveWidth * scaleX);
    const nextHeight = Math.max(50, effectiveHeight * scaleY);
    const resizedColumns = normalizeColumnsToWidth(element.columns, nextWidth);

    const heightRatio = nextHeight / effectiveHeight;
    const newRows = element.rows.map((row, i) => ({
      ...row,
      height: Math.max(ts.minRowHeight, Math.round(rowHeights[i] * heightRatio)),
    }));

    onChange({
      ...element,
      x: node.x(),
      y: node.y(),
      width: nextWidth,
      height: nextHeight,
      columns: resizedColumns,
      rows: newRows,
      rotation: node.rotation(),
    });

    node.scaleX(1);
    node.scaleY(1);
  }, [element, effectiveWidth, effectiveHeight, onChange, rowHeights, ts.minRowHeight]);

  // ─── Column resize start (mouse-event based) ──────────────
  const handleColResizeStart = useCallback((colIndex, startX) => {
    setResizingCol({
      colIndex,
      startX,
      originalWidths: columns.map(c => c.width),
    });
  }, [columns]);

  // ─── Row resize start (mouse-event based) ──────────────────
  const handleRowResizeStart = useCallback((rowIndex, startY) => {
    setResizingRow({
      rowIndex,
      startY,
      originalHeights: (element.rows || []).map((_, i) => rowHeights[i] || ts.minRowHeight),
    });
  }, [element.rows, rowHeights, ts.minRowHeight]);

  // ─── Global mouse tracking for resize ──────────────────────
  useEffect(() => {
    if (!resizingCol && !resizingRow) return;
    const stage = groupRef.current?.getStage();
    if (!stage) return;

    const handleMouseMove = () => {
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const zoom = stage.scaleX() || 1;
      const el = elementRef.current;

      if (resizingCol) {
        const dx = (pos.x - resizingCol.startX) / zoom;
        const { colIndex, originalWidths } = resizingCol;
        const newColumns = el.columns.map((col, i) => {
          if (i === colIndex) {
            return { ...col, width: Math.max(col.minWidth || 40, originalWidths[i] + dx) };
          }
          if (i === colIndex + 1 && colIndex + 1 < el.columns.length) {
            return { ...col, width: Math.max(col.minWidth || 40, originalWidths[i] - dx) };
          }
          return col;
        });
        const newTotal = newColumns.reduce((s, c) => s + c.width, 0);
        onChange({ ...el, columns: newColumns, width: newTotal });
      }

      if (resizingRow) {
        const dy = (pos.y - resizingRow.startY) / zoom;
        const { rowIndex, originalHeights } = resizingRow;
        const newRows = el.rows.map((row, i) => {
          if (i !== rowIndex) return row;
          return { ...row, height: Math.max(ts.minRowHeight, originalHeights[i] + dy) };
        });
        onChange({ ...el, rows: newRows });
      }
    };

    const handleMouseUp = () => {
      stage.container().style.cursor = 'default';
      setResizingCol(null);
      setResizingRow(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, resizingRow, onChange, ts.minRowHeight]);

  // ─── Header double-click → inline edit ─────────────────────
  const handleHeaderDblClick = useCallback((colIndex) => {
    const col = element.columns[colIndex];
    if (!col || previewMode) return;

    const stage = groupRef.current?.getStage();
    if (!stage) return;

    // Compute the x offset to this column
    let colX = 0;
    for (let i = 0; i < colIndex; i++) {
      colX += columns[i]?.width || 0;
    }

    // Derive actual zoom from CSS-scaled bounding rect vs stage size
    const stageBox = stage.container().getBoundingClientRect();
    const scale = stageBox.width / stage.width() || 1;
    const style = getEffectiveCellStyle(null, ts, true);

    setEditingHeader({
      colIndex,
      value: col.header,
      rect: {
        left:   stageBox.left + (element.x + colX) * scale,
        top:    stageBox.top  + element.y * scale,
        width:  (columns[colIndex]?.width || 100) * scale,
        height: headerHeight * scale,
      },
      font: {
        size:   Math.round(style.fontSize * scale),
        family: style.fontFamily,
        weight: style.fontStyle === 'bold' ? '700' : '400',
        align:  col.align || style.align || 'left',
        color:  style.color,
        padding: Math.round(style.padding * scale),
      },
    });
  }, [element, columns, headerHeight, ts, previewMode]);

  // Save handler reads value from the uncontrolled DOM input
  const handleHeaderEditSave = useCallback(() => {
    if (!editingHeader) return;
    const value = editInputRef.current?.value ?? editingHeader.value;
    const { colIndex } = editingHeader;
    const col = element.columns[colIndex];
    if (col && value !== col.header) {
      const newColumns = element.columns.map((c, i) =>
        i === colIndex ? { ...c, header: value } : c
      );
      onChange({ ...element, columns: newColumns });
    }
    setEditingHeader(null);
  }, [editingHeader, element, onChange]);

  // Keep a ref to the latest save handler for DOM event listeners
  const saveRef = useRef(handleHeaderEditSave);
  saveRef.current = handleHeaderEditSave;

  // ─── Imperative DOM overlay for inline header editing ──────
  // (createPortal doesn't work inside react-konva's custom reconciler)
  useEffect(() => {
    // Clean up any previous overlay
    if (editOverlayRef.current) {
      editOverlayRef.current.remove();
      editOverlayRef.current = null;
      editInputRef.current = null;
    }
    if (!editingHeader) return;

    const { rect, font, value } = editingHeader;
    const pad = font?.padding || 6;

    // Container
    const overlay = document.createElement('div');
    overlay.setAttribute('data-header-edit-overlay', 'true');

    // Click-away backdrop
    const backdrop = document.createElement('div');
    Object.assign(backdrop.style, {
      position: 'fixed', inset: '0', zIndex: '9998',
    });
    overlay.appendChild(backdrop);

    // Input positioned exactly over the header cell
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    Object.assign(input.style, {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      zIndex: '9999',
      margin: '0',
      boxSizing: 'border-box',
      padding: `0 ${pad}px`,
      fontSize: `${font?.size || 13}px`,
      fontFamily: font?.family || 'Arial',
      fontWeight: font?.weight || '700',
      textAlign: font?.align || 'left',
      color: 'var(--text-primary, #0f172a)',
      background: 'var(--bg-surface, #ffffff)',
      border: '2px solid var(--primary, #2563eb)',
      borderRadius: '0',
      outline: 'none',
      boxShadow: 'var(--shadow-focus, 0 0 0 3px rgba(37,99,235,0.2)), var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
      lineHeight: `${rect.height}px`,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    });
    overlay.appendChild(input);

    document.body.appendChild(overlay);
    editOverlayRef.current = overlay;
    editInputRef.current = input;

    // Focus after paint
    const focusTimer = setTimeout(() => {
      input.focus();
      input.select();
    }, 20);

    // Escape flag prevents blur-save after cancel
    let cancelled = false;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter')  { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { e.preventDefault(); cancelled = true; setEditingHeader(null); }
    };
    const handleBlur = () => { if (!cancelled) saveRef.current(); };
    const handleBackdropClick = () => input.blur();

    input.addEventListener('keydown', handleKeyDown);
    input.addEventListener('blur', handleBlur);
    backdrop.addEventListener('mousedown', handleBackdropClick);

    return () => {
      clearTimeout(focusTimer);
      input.removeEventListener('keydown', handleKeyDown);
      input.removeEventListener('blur', handleBlur);
      backdrop.removeEventListener('mousedown', handleBackdropClick);
      overlay.remove();
      editOverlayRef.current = null;
      editInputRef.current = null;
    };
  }, [editingHeader]);

  // ─── Cell click handler ────────────────────────────────────
  const handleCellClick = useCallback((rowIndex, colIndex, e) => {
    e.cancelBubble = true;
    setSelectedCell({ row: rowIndex, col: colIndex });
  }, []);

  // ─── Render header ─────────────────────────────────────────
  const renderHeader = useCallback(() => {
    if (!ts.showHeader) return [];
    const content = [];
    let xOffset = 0;

    content.push(
      <Rect key="header-bg" x={0} y={0} width={effectiveWidth} height={headerHeight}
        fill={ts.headerBg} stroke={ts.headerBorderColor} strokeWidth={ts.headerBorderWidth} />
    );

    columns.forEach((col, ci) => {
      const style = getEffectiveCellStyle(null, ts, true);
      const colAlign = col.align || style.align;

      // Text label (non-interactive)
      content.push(
        <Text
          key={`hdr-txt-${ci}`}
          x={xOffset + style.padding}
          y={style.padding}
          width={Math.max(10, col.width - style.padding * 2)}
          height={Math.max(10, headerHeight - style.padding * 2)}
          text={col.header}
          fontSize={style.fontSize}
          fontFamily={style.fontFamily}
          fontStyle={style.fontStyle}
          fill={style.color}
          align={colAlign}
          verticalAlign={style.verticalAlign}
          wrap="none"
          ellipsis={true}
          listening={false}
        />
      );

      // Transparent hit-area covering the full header cell (catches dblclick even on padding)
      content.push(
        <Rect
          key={`hdr-hit-${ci}`}
          x={xOffset}
          y={0}
          width={col.width}
          height={headerHeight}
          fill="transparent"
          onDblClick={() => handleHeaderDblClick(ci)}
          onDblTap={() => handleHeaderDblClick(ci)}
        />
      );

      if (ci < columns.length - 1) {
        const lineX = xOffset + col.width;
        content.push(
          <Line key={`hdr-div-${ci}`}
            points={[lineX, 0, lineX, headerHeight]}
            stroke={ts.headerBorderColor} strokeWidth={ts.headerBorderWidth} />
        );
      }

      xOffset += col.width;
    });

    return content;
  }, [columns, headerHeight, ts, effectiveWidth, handleHeaderDblClick]);

  // ─── Render rows ───────────────────────────────────────────
  const renderRows = useCallback(() => {
    const content = [];
    let yOffset = headerHeight;

    (element.rows || []).forEach((row, ri) => {
      const rowH = rowHeights[ri] || ts.minRowHeight;
      const isAlt = ts.alternateRowEnabled && ri % 2 === 1;
      const cells = row.cells || [];

      content.push(
        <Rect key={`row-bg-${ri}`} x={0} y={yOffset} width={effectiveWidth} height={rowH}
          fill={isAlt ? ts.alternateRowBg : '#ffffff'} stroke={ts.cellBorderColor} strokeWidth={ts.cellBorderWidth} />
      );

      let xOffset = 0;
      cells.forEach((cell, ci) => {
        if (ci >= columns.length) return;
        if (cell._merged) { xOffset += columns[ci].width; return; }

        const col = columns[ci];
        const style = getEffectiveCellStyle(cell, ts, false);
        const colAlign = cell.style?.align ?? col.align ?? style.align;
        const cellBg = cell.style?.bg ?? style.bg;
        const cellW = col.width * (cell.colSpan || 1);
        const cellH = rowH * (cell.rowSpan || 1);
        const isCellSelected = isSelected && selectedCell?.row === ri && selectedCell?.col === ci;

        if (cellBg || isCellSelected) {
          content.push(
            <Rect key={`cell-bg-${ri}-${ci}`} x={xOffset} y={yOffset} width={cellW} height={cellH}
              fill={isCellSelected ? 'rgba(0, 102, 204, 0.08)' : cellBg}
              stroke={isCellSelected ? '#0066cc' : undefined}
              strokeWidth={isCellSelected ? 1.5 : 0} />
          );
        }

        const displayText = parsePlaceholders(cell.content || '', sampleData);
        content.push(
          <Text
            key={`cell-txt-${ri}-${ci}`}
            x={xOffset + style.padding}
            y={yOffset + style.padding}
            width={Math.max(10, cellW - style.padding * 2)}
            height={Math.max(8, cellH - style.padding * 2)}
            text={displayText}
            fontSize={style.fontSize}
            fontFamily={style.fontFamily}
            fontStyle={style.fontStyle === 'bold' ? 'bold' : style.fontStyle || ''}
            fill={style.color}
            align={colAlign}
            verticalAlign={style.verticalAlign}
            wrap={style.wrap ? 'word' : 'none'}
            ellipsis={!style.wrap}
            lineHeight={style.lineHeight}
            onClick={(e) => handleCellClick(ri, ci, e)}
            onTap={(e) => handleCellClick(ri, ci, e)}
          />
        );

        if (ci < columns.length - 1 && ts.cellBorderWidth > 0) {
          content.push(
            <Line key={`cell-div-${ri}-${ci}`}
              points={[xOffset + cellW, yOffset, xOffset + cellW, yOffset + rowH]}
              stroke={ts.cellBorderColor} strokeWidth={ts.cellBorderWidth} />
          );
        }

        xOffset += col.width;
      });

      yOffset += rowH;
    });

    return content;
  }, [element.rows, columns, headerHeight, rowHeights, ts, effectiveWidth, sampleData, isSelected, selectedCell, handleCellClick]);

  // ─── Render column resize handles ──────────────────────────
  const renderColumnHandles = useCallback(() => {
    if (previewMode || !isSelected) return [];
    const handles = [];
    let xOffset = 0;
    columns.forEach((col, ci) => {
      xOffset += col.width;
      if (ci < columns.length - 1) {
        handles.push(
          <ColumnResizeHandle key={`col-h-${ci}`} x={xOffset} height={effectiveHeight}
            onResizeStart={(startX) => handleColResizeStart(ci, startX)} previewMode={previewMode} />
        );
      }
    });
    return handles;
  }, [columns, effectiveHeight, isSelected, previewMode, handleColResizeStart]);

  // ─── Render row resize handles ─────────────────────────────
  const renderRowHandles = useCallback(() => {
    if (previewMode || !isSelected) return [];
    const handles = [];
    let yOffset = headerHeight;
    (element.rows || []).forEach((_, ri) => {
      yOffset += rowHeights[ri] || ts.minRowHeight;
      handles.push(
        <RowResizeHandle key={`row-h-${ri}`} y={yOffset} width={effectiveWidth}
          onResizeStart={(startY) => handleRowResizeStart(ri, startY)} previewMode={previewMode} />
      );
    });
    return handles;
  }, [element.rows, rowHeights, headerHeight, effectiveWidth, ts.minRowHeight, isSelected, previewMode, handleRowResizeStart]);

  // ─── Outer border ──────────────────────────────────────────
  const renderOuterBorder = useCallback(() => {
    if (ts.outerBorderWidth <= 0) return null;
    return (
      <Rect key="outer-border" x={0} y={0} width={effectiveWidth} height={effectiveHeight}
        fill="transparent" stroke={ts.outerBorderColor} strokeWidth={ts.outerBorderWidth} listening={false} />
    );
  }, [effectiveWidth, effectiveHeight, ts.outerBorderColor, ts.outerBorderWidth]);

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        clipX={0}
        clipY={0}
        clipWidth={effectiveWidth}
        clipHeight={effectiveHeight}
        rotation={element.rotation}
        opacity={element.opacity}
        visible={element.visible !== false}
        draggable={!previewMode && !element.locked && !resizingCol && !resizingRow}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Rect x={0} y={0} width={effectiveWidth} height={effectiveHeight}
          fill="rgba(0,0,0,0.001)" strokeEnabled={false} listening={false} />
        {renderHeader()}
        {renderRows()}
        {renderOuterBorder()}
        {renderColumnHandles()}
        {renderRowHandles()}
      </Group>
      {isSelected && !previewMode && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 100 || newBox.height < 50) return oldBox;
            return newBox;
          }}
          anchorStyle={{ fill: '#0066cc', stroke: '#004499', strokeWidth: 1, cornerRadius: 2 }}
          borderStroke="#0066cc"
          borderStrokeWidth={1}
          borderDash={[4, 4]}
          rotateAnchorOffset={30}
        />
      )}

      {/* Inline header editor is managed imperatively via useEffect (DOM overlay) */}
    </>
  );
};

export default TableElement;
