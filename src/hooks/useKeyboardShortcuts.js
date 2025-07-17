import { useEffect } from 'react';
import { useCanvas } from '../context/CanvasContext';

export const useKeyboardShortcuts = () => {
  const { 
    selectedElements, 
    deleteElements, 
    copyElements, 
    pasteElements,
    undo,
    redo,
    groupElements,
    ungroupElements,
    dispatch
  } = useCanvas();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedElements.length > 0) {
            deleteElements(selectedElements);
            e.preventDefault();
          }
          break;

        case 'z':
          if (isCtrl && !isShift) {
            undo();
            e.preventDefault();
          }
          break;

        case 'y':
          if (isCtrl) {
            redo();
            e.preventDefault();
          }
          break;

        case 'Z':
          if (isCtrl && isShift) {
            redo();
            e.preventDefault();
          }
          break;

        case 'c':
          if (isCtrl && selectedElements.length > 0) {
            copyElements(selectedElements);
            e.preventDefault();
          }
          break;

        case 'v':
          if (isCtrl) {
            pasteElements();
            e.preventDefault();
          }
          break;

        case 'x':
          if (isCtrl && selectedElements.length > 0) {
            copyElements(selectedElements);
            deleteElements(selectedElements);
            e.preventDefault();
          }
          break;

        case 'a':
          if (isCtrl) {
            dispatch({ type: 'SELECT_ALL' });
            e.preventDefault();
          }
          break;

        case 'g':
          if (isCtrl && selectedElements.length > 1) {
            groupElements(selectedElements);
            e.preventDefault();
          }
          break;

        case 'u':
          if (isCtrl && selectedElements.length > 0) {
            ungroupElements(selectedElements);
            e.preventDefault();
          }
          break;

        case 'd':
          if (isCtrl && selectedElements.length > 0) {
            copyElements(selectedElements);
            setTimeout(() => pasteElements(), 10);
            e.preventDefault();
          }
          break;

        case 'Escape':
          dispatch({ type: 'CLEAR_SELECTION' });
          break;

        case 'ArrowUp':
          if (selectedElements.length > 0) {
            moveElements(0, isShift ? -10 : -1);
            e.preventDefault();
          }
          break;

        case 'ArrowDown':
          if (selectedElements.length > 0) {
            moveElements(0, isShift ? 10 : 1);
            e.preventDefault();
          }
          break;

        case 'ArrowLeft':
          if (selectedElements.length > 0) {
            moveElements(isShift ? -10 : -1, 0);
            e.preventDefault();
          }
          break;

        case 'ArrowRight':
          if (selectedElements.length > 0) {
            moveElements(isShift ? 10 : 1, 0);
            e.preventDefault();
          }
          break;

        case '+':
        case '=':
          if (isCtrl) {
            dispatch({ type: 'ZOOM_IN' });
            e.preventDefault();
          }
          break;

        case '-':
          if (isCtrl) {
            dispatch({ type: 'ZOOM_OUT' });
            e.preventDefault();
          }
          break;

        case '0':
          if (isCtrl) {
            dispatch({ type: 'RESET_ZOOM' });
            e.preventDefault();
          }
          break;

        default:
          break;
      }
    };

    const moveElements = (deltaX, deltaY) => {
      selectedElements.forEach(id => {
        dispatch({
          type: 'MOVE_ELEMENT',
          payload: { id, deltaX, deltaY }
        });
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElements, deleteElements, copyElements, pasteElements, undo, redo, groupElements, ungroupElements, dispatch]);
};
