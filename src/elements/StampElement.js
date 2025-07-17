import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text, Circle, Transformer } from 'react-konva';
import { useCanvas } from '../context/CanvasContext';
import { parsePlaceholders } from '../utils/placeholderParser';

const StampElement = ({ element, isSelected, onSelect, onChange, snapToGrid, previewMode }) => {
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
      width: Math.max(50, node.width() * scaleX),
      height: Math.max(30, node.height() * scaleY),
      rotation: node.rotation()
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  const renderStamp = () => {
    const displayText = parsePlaceholders(element.text || 'STAMP', sampleData);
    const { width, height } = element;
    const shape = element.shape || 'rectangle';
    const backgroundColor = element.backgroundColor || '#ff0000';
    const textColor = element.textColor || '#ffffff';
    const borderWidth = element.borderWidth || 2;

    const shapes = [];

    if (shape === 'circle') {
      const radius = Math.min(width, height) / 2;
      shapes.push(
        <Circle
          key="stamp-bg"
          x={width / 2}
          y={height / 2}
          radius={radius}
          fill={backgroundColor}
          stroke={textColor}
          strokeWidth={borderWidth}
        />
      );
    } else {
      shapes.push(
        <Rect
          key="stamp-bg"
          x={0}
          y={0}
          width={width}
          height={height}
          fill={backgroundColor}
          stroke={textColor}
          strokeWidth={borderWidth}
          cornerRadius={element.cornerRadius || 5}
        />
      );
    }

    shapes.push(
      <Text
        key="stamp-text"
        x={0}
        y={0}
        width={width}
        height={height}
        text={displayText}
        fontSize={element.fontSize || 14}
        fontFamily={element.fontFamily || 'Arial'}
        fill={textColor}
        align="center"
        verticalAlign="middle"
        fontStyle="bold"
        rotation={element.textRotation || 0}
      />
    );

    return shapes;
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
        {renderStamp()}
      </Group>
      {isSelected && !previewMode && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 30) {
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

export default StampElement;
