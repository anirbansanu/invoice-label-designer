import React, { useRef, useEffect, useState } from 'react';
import { Group, Image, Transformer } from 'react-konva';
import { useCanvas } from '../context/CanvasContext';
import { parsePlaceholders } from '../utils/placeholderParser';
import JsBarcode from 'jsbarcode';

const BarcodeElement = ({ element, isSelected, onSelect, onChange, snapToGrid, previewMode }) => {
  const { sampleData } = useCanvas();
  const imageRef = useRef();
  const transformerRef = useRef();
  const [barcodeImage, setBarcodeImage] = useState(null);

  // Apply transformer to the image when selected
  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Generate barcode image
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const barcodeValue = parsePlaceholders(element.value || '', sampleData) || 'SAMPLE123';

    try {
      JsBarcode(canvas, barcodeValue, {
        format: element.format || 'CODE128',
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 12,
        margin: 5,
        background: '#ffffff',
        lineColor: '#000000'
      });

      const image = new window.Image();
      image.onload = () => {
        setBarcodeImage(image);
      };
      image.src = canvas.toDataURL();
    } catch (error) {
      console.error('Error generating barcode:', error);
      const errorCanvas = document.createElement('canvas');
      errorCanvas.width = element.width || 200;
      errorCanvas.height = element.height || 50;
      const ctx = errorCanvas.getContext('2d');
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, errorCanvas.width, errorCanvas.height);
      ctx.fillStyle = '#dc3545';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Invalid Barcode', errorCanvas.width / 2, errorCanvas.height / 2);

      const errorImage = new window.Image();
      errorImage.onload = () => setBarcodeImage(errorImage);
      errorImage.src = errorCanvas.toDataURL();
    }
  }, [element.value, element.format, sampleData, element.width, element.height]);

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
    const node = imageRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    onChange({
      ...element,
      width: Math.max(50, node.width() * scaleX),
      height: Math.max(20, node.height() * scaleY),
      rotation: node.rotation()
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <>
      <Group
      
        rotation={element.rotation}
        opacity={element.opacity}
        visible={element.visible}
      >
        {barcodeImage && (
          <Image
            ref={imageRef}
            image={barcodeImage}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            draggable={!previewMode && !element.locked}
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
          />
        )}
      </Group>
      {isSelected && !previewMode && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 20) {
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

export default BarcodeElement;
