import React, { useRef, useEffect, useState } from 'react';
import { 
  Rect, 
  Circle, 
  Line, 
  RegularPolygon, 
  Star, 
  Arrow, 
  Transformer,
  Shape as KonvaShape
} from 'react-konva';

const ShapeElement = ({ element, isSelected, onSelect, onChange, snapToGrid, previewMode }) => {
  const shapeRef = useRef();
  const transformerRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    const newPos = snapToGrid 
      ? snapToGrid(e.target.x(), e.target.y()) 
      : { x: e.target.x(), y: e.target.y() };
    
    onChange({
      ...element,
      x: newPos.x,
      y: newPos.y
    });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    onChange({
      ...element,
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation()
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  const getShapeStyle = () => {
    const baseStyle = {
      fill: element.fill || '#ffffff',
      stroke: element.stroke || '#000000',
      strokeWidth: element.strokeWidth || 1,
      opacity: element.opacity || 1,
      shadowColor: element.shadowColor || '#000000',
      shadowBlur: element.shadowBlur || 0,
      shadowOffset: element.shadowOffset || { x: 0, y: 0 }
    };

    // Add gradient support
    if (element.gradient) {
      baseStyle.fillLinearGradientStartPoint = element.gradient.start;
      baseStyle.fillLinearGradientEndPoint = element.gradient.end;
      baseStyle.fillLinearGradientColorStops = element.gradient.colorStops;
    }

    // Add pattern support
    if (element.pattern) {
      baseStyle.fillPatternImage = element.pattern.image;
      baseStyle.fillPatternRepeat = element.pattern.repeat || 'repeat';
    }

    return baseStyle;
  };

  const renderShape = () => {
    const commonProps = {
      ref: shapeRef,
      x: element.x,
      y: element.y,
      draggable: !previewMode,
      onClick: onSelect,
      onTap: onSelect,
      onDragEnd: handleDragEnd,
      onTransformEnd: handleTransformEnd,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      ...getShapeStyle()
    };

    switch (element.type) {
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            width={element.width}
            height={element.height}
            cornerRadius={element.cornerRadius || 0}
          />
        );

      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={element.radius || Math.min(element.width, element.height) / 2}
          />
        );

      case 'line':
        return (
          <Line
            {...commonProps}
            points={element.points || [0, 0, element.width || 100, element.height || 0]}
            lineCap={element.lineCap || 'round'}
            lineJoin={element.lineJoin || 'round'}
          />
        );

      case 'polygon':
        return (
          <RegularPolygon
            {...commonProps}
            sides={element.sides || 6}
            radius={element.radius || 50}
          />
        );

      case 'star':
        return (
          <Star
            {...commonProps}
            numPoints={element.numPoints || 5}
            innerRadius={element.innerRadius || 30}
            outerRadius={element.outerRadius || 50}
          />
        );

      case 'arrow':
        return (
          <Arrow
            {...commonProps}
            points={element.points || [0, 0, element.width || 100, element.height || 0]}
            pointerLength={element.pointerLength || 10}
            pointerWidth={element.pointerWidth || 10}
          />
        );

      case 'custom':
        return (
          <KonvaShape
            {...commonProps}
            sceneFunc={(context, shape) => {
              // Custom shape drawing logic
              if (element.customPath) {
                const path = new Path2D(element.customPath);
                context.fillPath(path);
                context.strokePath(path);
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderShape()}
      {isSelected && !previewMode && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
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
          borderStroke={isHovered ? '#0066cc' : '#666666'}
          borderStrokeWidth={1}
          borderDash={[4, 4]}
          rotateAnchorOffset={30}
          enabledAnchors={element.type === 'circle' ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] : undefined}
        />
      )}
    </>
  );
};

export default ShapeElement;
