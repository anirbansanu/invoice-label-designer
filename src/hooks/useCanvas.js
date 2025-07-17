import { useContext } from 'react';
import { CanvasContext } from '../context/CanvasContext';

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};
