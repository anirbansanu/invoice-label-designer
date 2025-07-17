import React from 'react';
import { useCanvas } from '../../context/CanvasContext';

const StatusBar = () => {
  const { 
    currentPage, 
    pages, 
    selectedElements, 
    zoom, 
    previewMode,
    history,
    historyIndex 
  } = useCanvas();

  const getSelectionText = () => {
    if (selectedElements.length === 0) return 'No selection';
    if (selectedElements.length === 1) return '1 element selected';
    return `${selectedElements.length} elements selected`;
  };

  const getZoomText = () => {
    return `${Math.round(zoom * 100)}%`;
  };

  const getPageText = () => {
    return `Page ${currentPage + 1} of ${pages.length}`;
  };

  const getModeText = () => {
    return previewMode ? 'Preview Mode' : 'Design Mode';
  };

  const getHistoryText = () => {
    return `${historyIndex + 1}/${history.length}`;
  };

  return (
    <div className="status-bar bg-light border-top px-3 py-2">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-4">
          <div className="status-item">
            <i className="fas fa-mouse-pointer me-1"></i>
            <span className="text-muted">{getSelectionText()}</span>
          </div>
          
          <div className="status-item">
            <i className="fas fa-search me-1"></i>
            <span className="text-muted">{getZoomText()}</span>
          </div>
          
          <div className="status-item">
            <i className="fas fa-file-alt me-1"></i>
            <span className="text-muted">{getPageText()}</span>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-4">
          <div className="status-item">
            <i className="fas fa-history me-1"></i>
            <span className="text-muted">{getHistoryText()}</span>
          </div>
          
          <div className="status-item">
            <i className={`fas ${previewMode ? 'fa-eye' : 'fa-pencil-alt'} me-1`}></i>
            <span className="text-muted">{getModeText()}</span>
          </div>
          
          <div className="status-item">
            <div className="status-indicator online"></div>
            <span className="text-muted">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
