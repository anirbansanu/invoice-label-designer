import React, { useState, useEffect } from 'react';
import { useCanvas } from '../context/CanvasContext';
import { useTheme } from '../context/ThemeContext';
import { useAccessibility } from '../context/AccessibilityContext';

const App = () => {
  const { 
    previewMode, 
    currentPage, 
    selectedElements, 
    addElement, 
    zoom, 
    setZoom 
  } = useCanvas();
  
  const { theme } = useTheme();
  const { highContrast } = useAccessibility();

  const [sidebarLeftCollapsed, setSidebarLeftCollapsed] = useState(false);
  const [sidebarRightCollapsed, setSidebarRightCollapsed] = useState(false);

  // Apply theme classes
  useEffect(() => {
    document.body.className = `theme-${theme} ${highContrast ? 'high-contrast' : ''}`;
  }, [theme, highContrast]);

  // Add sample elements for testing
  const addSampleText = () => {
    addElement({
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 30,
      text: 'Sample Text',
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#000000',
      align: 'left'
    });
  };

  const addSampleRectangle = () => {
    addElement({
      type: 'rectangle',
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 1
    });
  };

  return (
    <div className="app-container d-flex flex-column vh-100">
      {/* Screen reader announcements */}
      <div id="sr-announcement" className="sr-only" aria-live="polite"></div>
      
      {/* Skip to content link */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      {/* Header/Toolbar */}
      <header className="bg-primary text-white p-3">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0">
              <i className="fas fa-edit me-2"></i>
              Invoice & Product Label Designer
            </h1>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-light btn-sm"
                onClick={addSampleText}
              >
                <i className="fas fa-font me-1"></i>Add Text
              </button>
              <button 
                className="btn btn-light btn-sm"
                onClick={addSampleRectangle}
              >
                <i className="fas fa-square me-1"></i>Add Rectangle
              </button>
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={() => setZoom(zoom === 1 ? 1.5 : 1)}
              >
                Zoom: {Math.round(zoom * 100)}%
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content area */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Left sidebar */}
        <div 
          className={`bg-light border-end ${sidebarLeftCollapsed ? 'd-none' : ''}`}
          style={{ width: '250px' }}
        >
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Layers</h6>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSidebarLeftCollapsed(true)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="list-group list-group-flush">
              {currentPage?.elements?.map((element, index) => (
                <div 
                  key={element.id} 
                  className={`list-group-item list-group-item-action ${
                    selectedElements.includes(element.id) ? 'active' : ''
                  }`}
                >
                  <i className={`fas fa-${element.type === 'text' ? 'font' : 'square'} me-2`}></i>
                  {element.type} {index + 1}
                </div>
              ))}
              
              {(!currentPage?.elements || currentPage.elements.length === 0) && (
                <div className="text-muted p-3 text-center">
                  <i className="fas fa-layer-group fa-2x mb-2"></i>
                  <p>No elements yet</p>
                  <small>Add elements using the toolbar</small>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Show sidebar button when collapsed */}
        {sidebarLeftCollapsed && (
          <button 
            className="btn btn-primary position-absolute"
            style={{ top: '100px', left: '10px', zIndex: 1000 }}
            onClick={() => setSidebarLeftCollapsed(false)}
          >
            <i className="fas fa-bars"></i>
          </button>
        )}
        
        {/* Canvas container */}
        <main 
          id="main-content"
          className="canvas-container flex-grow-1 position-relative bg-light"
          role="main"
          aria-label="Canvas area"
        >
          <div className="h-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
              <div className="card shadow" style={{ width: '400px' }}>
                <div className="card-body">
                  <i className="fas fa-paint-brush fa-4x text-primary mb-3"></i>
                  <h3>Canvas Ready</h3>
                  <p className="text-muted">
                    Your invoice designer is ready! 
                    {previewMode ? ' (Preview Mode)' : ' (Design Mode)'}
                  </p>
                  
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={addSampleText}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Add Your First Element
                    </button>
                    
                    <small className="text-muted">
                      Elements: {currentPage?.elements?.length || 0} | 
                      Zoom: {Math.round(zoom * 100)}%
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Right sidebar */}
        <div 
          className={`bg-light border-start ${sidebarRightCollapsed ? 'd-none' : ''}`}
          style={{ width: '300px' }}
        >
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Properties</h6>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSidebarRightCollapsed(true)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {selectedElements.length > 0 ? (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                {selectedElements.length} element(s) selected
              </div>
            ) : (
              <div className="text-muted text-center p-3">
                <i className="fas fa-mouse-pointer fa-2x mb-2"></i>
                <p>Select an element to edit properties</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Show sidebar button when collapsed */}
        {sidebarRightCollapsed && (
          <button 
            className="btn btn-primary position-absolute"
            style={{ top: '100px', right: '10px', zIndex: 1000 }}
            onClick={() => setSidebarRightCollapsed(false)}
          >
            <i className="fas fa-cog"></i>
          </button>
        )}
      </div>
      
      {/* Status bar */}
      <footer className="bg-dark text-white p-2">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <small>
              <i className="fas fa-info-circle me-1"></i>
              Ready | Page {currentPage + 1} | Elements: {currentPage?.elements?.length || 0}
            </small>
            <small>
              Mode: {previewMode ? 'Preview' : 'Design'} | 
              Theme: {theme} | 
              Status: Active
            </small>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
