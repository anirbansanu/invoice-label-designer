import React, { useRef, useEffect } from 'react';
import { Group, Transformer } from 'react-konva';
import TextElement from './TextElement';
import TableElement from './TableElement';
import BarcodeElement from './BarcodeElement';
import QRCodeElement from './QRCodeElement';
import ImageElement from './ImageElement';
import ShapeElement from './ShapeElement';
import StampElement from './StampElement';

const GroupElement = ({ element, isSelected, onSelect, onChange, snapToGrid, previewMode }) => {
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

    // Update group and all children
    const updatedChildren = element.children.map(child => ({
      ...child,
      x: child.x * scaleX,
      y: child.y * scaleY,
      width: child.width * scaleX,
      height: child.height * scaleY,
      fontSize: child.fontSize ? child.fontSize * scaleX : child.fontSize
    }));

    onChange({
      ...element,
      x: node.x(),
      y: node.y(),
      width: element.width * scaleX,
      height: element.height * scaleY,
      rotation: node.rotation(),
      children: updatedChildren
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  const handleChildChange = (childIndex, updatedChild) => {
    const updatedChildren = [...element.children];
    updatedChildren[childIndex] = updatedChild;
    onChange({
      ...element,
      children: updatedChildren
    });
  };

  const renderChild = (child, index) => {
    const childProps = {
      key: `child-${index}`,
      element: child,
      isSelected: false,
      onSelect: () => {}, // Group children don't have individual selection
      onChange: (updatedChild) => handleChildChange(index, updatedChild),
      snapToGrid,
      previewMode: true // Children in groups are always in preview mode
    };

    switch (child.type) {
      case 'text':
        return <TextElement {...childProps} />;
      case 'table':
        return <TableElement {...childProps} />;
      case 'barcode':
        return <BarcodeElement {...childProps} />;
      case 'qrcode':
        return <QRCodeElement {...childProps} />;
      case 'image':
        return <ImageElement {...childProps} />;
      case 'rectangle':
      case 'circle':
      case 'line':
        return <ShapeElement {...childProps} />;
      case 'stamp':
        return <StampElement {...childProps} />;
      default:
        return null;
    }
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
        {element.children.map(renderChild)}
      </Group>
      {isSelected && !previewMode && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) {
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

export default GroupElement;
