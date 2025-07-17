import { useCallback } from 'react';
import { useCanvas } from './useCanvas';

export const useClipboard = () => {
  const { selectedElements, selectedElementsData, copyElements, pasteElements } = useCanvas();

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
      // Delete selected elements after copying
      selectedElements.forEach(id => {
        // Implementation would depend on your delete function
      });
      return true;
    }
    return false;
  }, [selectedElements, copyElements]);

  return {
    copy,
    paste,
    cut,
    hasSelection: selectedElements.length > 0,
    selectedCount: selectedElements.length
  };
};
