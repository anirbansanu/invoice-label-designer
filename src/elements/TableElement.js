import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text, Line, Transformer } from 'react-konva';
import { useCanvas } from '../context/CanvasContext';
import { parsePlaceholders } from '../utils/placeholderParser';

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

    onChange({
      ...element,
      x: node.x(),
      y: node.y(),
      width: Math.max(100, node.width() * scaleX),
      height: Math.max(50, node.height() * scaleY),
      rotation: node.rotation()
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  const renderTableContent = () => {
    const content = [];
    const cellHeight = 30;
    const headerHeight = 35;
    const columns = element.columns || [];
    const rows = element.rows || [];

    let currentY = 0;

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
          y={currentY + 8}
          width={column.width - 10}
          height={headerHeight - 16}
          text={column.header}
          fontSize={14}
          fontFamily="Arial"
          fill="#000000"
          align="left"
          verticalAlign="middle"
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
              y={currentY + 6}
              width={columns[colIndex].width - 10}
              height={cellHeight - 12}
              text={displayText}
              fontSize={12}
              fontFamily="Arial"
              fill="#000000"
              align="left"
              verticalAlign="middle"
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
