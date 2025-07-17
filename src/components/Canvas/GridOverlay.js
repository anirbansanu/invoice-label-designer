import React from 'react';
import { Group, Line } from 'react-konva';
import { useCanvas } from '../../context/CanvasContext';

const GridOverlay = () => {
  const { currentPage } = useCanvas();

  if (!currentPage || !currentPage.grid.visible) return null;

  const { size, grid } = currentPage;
  const { size: gridSize } = grid;
  const lines = [];

  // Vertical lines
  for (let i = 0; i <= size.width; i += gridSize) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i, 0, i, size.height]}
        stroke="#e0e0e0"
        strokeWidth={0.5}
        dash={[2, 2]}
        listening={false}
      />
    );
  }

  // Horizontal lines
  for (let i = 0; i <= size.height; i += gridSize) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i, size.width, i]}
        stroke="#e0e0e0"
        strokeWidth={0.5}
        dash={[2, 2]}
        listening={false}
      />
    );
  }

  return (
    <Group listening={false}>
      {lines}
    </Group>
  );
};

export default GridOverlay;
