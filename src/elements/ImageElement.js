import React, { useRef, useEffect, useState } from 'react';
import { Group, Image, Transformer } from 'react-konva';

const ImageElement = ({ element, isSelected, onSelect, onChange, snapToGrid, previewMode }) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      // Create error placeholder
      const canvas = document.createElement('canvas');
      canvas.width = element.width || 200;
      canvas.height = element.height || 200;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#dee2e6';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#6c757d';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Image not found', canvas.width / 2, canvas.height / 2);
      
      const errorImage = new window.Image();
      errorImage.onload = () => setImage(errorImage);
      errorImage.src = canvas.toDataURL();
    };
    img.src = element.src;
  }, [element.src, element.width, element.height]);

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
      width: Math.max(10, node.width() * scaleX),
      height: Math.max(10, node.height() * scaleY),
      rotation: node.rotation()
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  if (isLoading) {
    return (
      <Group
        x={element.x}
        y={element.y}
        opacity={element.opacity}
        visible={element.visible}
      >
        {/* Loading placeholder */}
      </Group>
    );
  }

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
        {image && (
          <Image
            image={image}
            width={element.width}
            height={element.height}
            filters={element.filters ? [element.filters] : []}
          />
        )}
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

export default ImageElement;
