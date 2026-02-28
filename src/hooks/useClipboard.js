import { useCallback } from 'react';
import { useCanvas } from './useCanvas';

export const useClipboard = () => {
  const { selectedElements, selectedElementsData, copyElements, pasteElements, deleteElements } = useCanvas();

  const copy = useCallback(() => {
    if (selectedElements.length > 0) {
      copyElements(selectedElements);
      return true;
    }
    return false;
  }, [selectedElements, copyElements]);

  const paste = useCallback(() => {
    pasteElements();
  }, [pasteElements]);

  const cut = useCallback(() => {
    if (selectedElements.length > 0) {
      copyElements(selectedElements);
      deleteElements(selectedElements);
      return true;
    }
    return false;
  }, [selectedElements, copyElements, deleteElements]);

  return {
    copy,
    paste,
    cut,
    hasSelection: selectedElements.length > 0,
    selectedCount: selectedElements.length
  };
};
