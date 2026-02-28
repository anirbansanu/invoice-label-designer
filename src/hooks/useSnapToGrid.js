import { useCallback } from 'react';
import { useCanvas } from './useCanvas';

export const useSnapToGrid = () => {
  const { currentPageData } = useCanvas();

  const snapToGrid = useCallback((x, y) => {
    if (!currentPageData?.grid?.snap) return { x, y };
    
    const gridSize = currentPageData.grid.size || 10;
    
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [currentPageData?.grid]);

  const snapValue = useCallback((value) => {
    if (!currentPageData?.grid?.snap) return value;
    
    const gridSize = currentPageData.grid.size || 10;
    return Math.round(value / gridSize) * gridSize;
  }, [currentPageData?.grid]);

  const snapSize = useCallback((width, height) => {
    if (!currentPageData?.grid?.snap) return { width, height };
    
    const gridSize = currentPageData.grid.size || 10;
    
    return {
      width: Math.round(width / gridSize) * gridSize,
      height: Math.round(height / gridSize) * gridSize
    };
  }, [currentPageData?.grid]);

  return currentPageData?.grid?.snap ? snapToGrid : null;
};
