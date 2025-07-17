import { useCallback } from 'react';
import { useCanvas } from './useCanvas';

export const useSnapToGrid = () => {
  const { currentPage } = useCanvas();

  const snapToGrid = useCallback((x, y) => {
    if (!currentPage?.grid?.snap) return { x, y };
    
    const gridSize = currentPage.grid.size || 10;
    
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [currentPage?.grid]);

  const snapValue = useCallback((value) => {
    if (!currentPage?.grid?.snap) return value;
    
    const gridSize = currentPage.grid.size || 10;
    return Math.round(value / gridSize) * gridSize;
  }, [currentPage?.grid]);

  const snapSize = useCallback((width, height) => {
    if (!currentPage?.grid?.snap) return { width, height };
    
    const gridSize = currentPage.grid.size || 10;
    
    return {
      width: Math.round(width / gridSize) * gridSize,
      height: Math.round(height / gridSize) * gridSize
    };
  }, [currentPage?.grid]);

  return currentPage?.grid?.snap ? snapToGrid : null;
};
