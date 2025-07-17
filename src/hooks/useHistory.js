import { useCallback } from 'react';
import { useCanvas } from './useCanvas';

export const useHistory = () => {
  const { history, historyIndex, undo, redo, dispatch } = useCanvas();

  const saveState = useCallback((state) => {
    dispatch({ type: 'SAVE_HISTORY', payload: state });
  }, [dispatch]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, [dispatch]);

  const getHistoryInfo = useCallback(() => {
    return {
      current: historyIndex + 1,
      total: history.length,
      canUndo,
      canRedo
    };
  }, [historyIndex, history.length, canUndo, canRedo]);

  return {
    undo,
    redo,
    saveState,
    clearHistory,
    getHistoryInfo,
    canUndo,
    canRedo
  };
};
