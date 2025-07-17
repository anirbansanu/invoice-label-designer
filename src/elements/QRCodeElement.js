import React, { useRef, useEffect, useState } from 'react';
import { Group, Image, Transformer } from 'react-konva';
import { useCanvas } from '../context/CanvasContext';
import { parsePlaceholders } from '../utils/placeholderParser';
import QRCode from 'qrcode';

const QRCodeElement = ({ element, isSelected, onSelect, onChange, snapToGrid, previewMode }) => {
  const { sampleData } = useCanvas();
  const groupRef = useRef();
  const transformerRef = useRef();
  const [qrImage, setQrImage] = useState(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    const qrValue = parsePlaceholders(element.value || '', sampleData) || 'SAMPLE_QR_CODE';
    
    QRCode.toDataURL(qrValue, {
      width: element.size || 100,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    }).then(url => {
      const image = new window.Image();
      image.onload = () => {
        setQrImage(image);
      };
      image.src = url;
    }).catch(error => {
      console.error('Error generating QR code:', error);
      // Create error placeholder
      const canvas = document.createElement('canvas');
      const size = element.size || 100;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#dc3545';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Invalid QR', size / 2, size / 2);
      
      const errorImage = new window.Image();
      errorImage.onload = () => setQrImage(errorImage);
      errorImage.src = canvas.toDataURL();
    });
  }, [element.value, element.size, sampleData]);

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
    const size = Math.max(20, Math.min(node.width() * scaleX, node.height() * scaleY));

    onChange({
      ...element,
      x: node.x(),
      y: node.y(),
      size: size,
      rotation: node.rotation()
    });

    node.scaleX(1);
    node.scaleY(1);
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
        {qrImage && (
          <Image
            image={qrImage}
            width={element.size}
            height={element.size}
          />
        )}
      </Group>
      {isSelected && !previewMode && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            const size = Math.min(newBox.width, newBox.height);
            if (size < 20) {
              return oldBox;
            }
            return { ...newBox, width: size, height: size };
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

export default QRCodeElement;
