import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text, Line, Transformer } from 'react-konva';
import { useCanvas } from '../context/CanvasContext';
import { parsePlaceholders } from '../utils/placeholderParser';

const normalizeColumnsToWidth = (columns, totalWidth) => {
  if (!Array.isArray(columns) || columns.length === 0) return [];

  const safeTotalWidth = Math.max(100, totalWidth || 100);
  const sourceTotal = columns.reduce((sum, column) => sum + (column.width || 0), 0);

  if (sourceTotal <= 0) {
    const equalWidth = safeTotalWidth / columns.length;
    return columns.map(column => ({ ...column, width: equalWidth }));
  }

  const scale = safeTotalWidth / sourceTotal;
  return columns.map(column => ({ ...column, width: Math.max(20, (column.width || 0) * scale) }));
};

const TableElement = ({ element, isSelected, onSelect, onChange, snapToGrid, previewMode }) => {
  const { sampleData } = useCanvas();
  const groupRef = useRef();
  const transformerRef = useRef();

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    const newPos = snapToGrid ? snapToGrid(e.target.x(), e.target.y()) : { x: e.target.x(), y: e.target.y() };
    onChange({
      ...element,
      x: newPos.x,
      y: newPos.y
    });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const baseWidth = Math.max(100, element.width || 100);
    const baseHeight = Math.max(50, element.height || 50);
    const nextWidth = Math.max(100, baseWidth * scaleX);
    const nextHeight = Math.max(50, baseHeight * scaleY);
    const resizedColumns = normalizeColumnsToWidth(element.columns || [], nextWidth);

    onChange({
      ...element,
      x: node.x(),
      y: node.y(),
      width: nextWidth,
      height: nextHeight,
      columns: resizedColumns,
      rotation: node.rotation()
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  const renderTableContent = () => {
    const content = [];
    const columns = normalizeColumnsToWidth(element.columns || [], element.width || 100);
    const rows = element.rows || [];

    const baseHeaderHeight = 35;
    const baseCellHeight = 30;
    const baseTotalHeight = baseHeaderHeight + (Math.max(1, rows.length) * baseCellHeight);
    const verticalScale = Math.max(0.5, (element.height || baseTotalHeight) / baseTotalHeight);

    const headerHeight = Math.max(20, baseHeaderHeight * verticalScale);
    const cellHeight = Math.max(18, baseCellHeight * verticalScale);

    let currentY = 0;

    // Explicit logical bounds so transformer always matches full table area
    content.push(
      <Rect
        key="table-bounds"
        x={0}
        y={0}
        width={Math.max(100, element.width || 100)}
        height={Math.max(50, element.height || 50)}
        fill="rgba(0,0,0,0.001)"
        strokeEnabled={false}
        listening={false}
      />
    );

    // Header row
    content.push(
      <Rect
        key="header-bg"
        x={0}
        y={currentY}
        width={element.width}
        height={headerHeight}
        fill="#f8f9fa"
        stroke="#dee2e6"
        strokeWidth={1}
      />
    );

    let currentX = 0;
    columns.forEach((column, colIndex) => {
      content.push(
        <Text
          key={`header-${colIndex}`}
          x={currentX + 5}
          y={currentY + Math.max(4, headerHeight * 0.22)}
          width={Math.max(10, column.width - 10)}
          height={Math.max(10, headerHeight - 8)}
          text={column.header}
          fontSize={Math.max(10, 14 * verticalScale)}
          fontFamily="Arial"
          fill="#000000"
          align="left"
          verticalAlign="middle"
          wrap="none"
          ellipsis={true}
        />
      );

      if (colIndex < columns.length - 1) {
        content.push(
          <Line
            key={`header-line-${colIndex}`}
            points={[currentX + column.width, currentY, currentX + column.width, currentY + headerHeight]}
            stroke="#dee2e6"
            strokeWidth={1}
          />
        );
      }

      currentX += column.width;
    });

    currentY += headerHeight;

    // Data rows
    rows.forEach((row, rowIndex) => {
      content.push(
        <Rect
          key={`row-bg-${rowIndex}`}
          x={0}
          y={currentY}
          width={element.width}
          height={cellHeight}
          fill={rowIndex % 2 === 0 ? "#ffffff" : "#f8f9fa"}
          stroke="#dee2e6"
          strokeWidth={1}
        />
      );

      currentX = 0;
      row.forEach((cell, colIndex) => {
        if (colIndex < columns.length) {
          const displayText = parsePlaceholders(cell, sampleData);
          content.push(
            <Text
              key={`cell-${rowIndex}-${colIndex}`}
              x={currentX + 5}
              y={currentY + Math.max(3, cellHeight * 0.18)}
              width={Math.max(10, columns[colIndex].width - 10)}
              height={Math.max(8, cellHeight - 6)}
              text={displayText}
              fontSize={Math.max(9, 12 * verticalScale)}
              fontFamily="Arial"
              fill="#000000"
              align="left"
              verticalAlign="middle"
              wrap="none"
              ellipsis={true}
            />
          );

          if (colIndex < columns.length - 1) {
            content.push(
              <Line
                key={`cell-line-${rowIndex}-${colIndex}`}
                points={[currentX + columns[colIndex].width, currentY, currentX + columns[colIndex].width, currentY + cellHeight]}
                stroke="#dee2e6"
                strokeWidth={1}
              />
            );
          }

          currentX += columns[colIndex].width;
        }
      });

      currentY += cellHeight;
    });

    return content;
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        clipX={0}
        clipY={0}
        clipWidth={Math.max(100, element.width || 100)}
        clipHeight={Math.max(50, element.height || 50)}
        rotation={element.rotation}
        opacity={element.opacity}
        visible={element.visible}
        draggable={!previewMode && !element.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {renderTableContent()}
      </Group>
      {isSelected && !previewMode && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 100 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
          anchorStyle={{
            fill: '#0066cc',
            stroke: '#004499',
            strokeWidth: 1,
            cornerRadius: 2
          }}
          borderStroke="#0066cc"
          borderStrokeWidth={1}
          borderDash={[4, 4]}
          rotateAnchorOffset={30}
        />
      )}
    </>
  );
};

export default TableElement;
