import React from 'react';
import { Rect } from 'react-konva';

const SelectionBox = ({ x, y, width, height, visible = true }) => {
  if (!visible || width === 0 || height === 0) return null;

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(0, 102, 204, 0.1)"
      stroke="#0066cc"
      strokeWidth={1}
      dash={[5, 5]}
      listening={false}
    />
  );
};

export default SelectionBox;
