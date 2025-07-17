import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Components
import Toolbar from './Layout/Toolbar';
import SidebarLeft from './Layout/SidebarLeft';
import SidebarRight from './Layout/SidebarRight';
import StatusBar from './Layout/StatusBar';
import CanvasArea from './Canvas/CanvasArea';
import ContextMenu from './Canvas/ContextMenu';

// Dialogs
import ExportDialog from './Dialogs/ExportDialog';
import ImportDialog from './Dialogs/ImportDialog';
import TableEditor from './Dialogs/TableEditor';
import ImageUpload from './Dialogs/ImageUpload';
import GridSettings from './Dialogs/GridSettings';

// Hooks
import { useCanvas } from '../context/CanvasContext';
import { useTheme } from '../context/ThemeContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const App = () => {
  const { previewMode } = useCanvas();
  const { theme } = useTheme();
  const { highContrast, screenReader } = useAccessibility();
  
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showGridSettings, setShowGridSettings] = useState(false);
  
  const [sidebarLeftCollapsed, setSidebarLeftCollapsed] = useState(false);
  const [sidebarRightCollapsed, setSidebarRightCollapsed] = useState(false);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Apply theme classes
  useEffect(() => {
    document.body.className = `theme-${theme} ${highContrast ? 'high-contrast' : ''}`;
  }, [theme, highContrast]);

  // Screen reader announcements
  useEffect(() => {
    if (screenReader) {
      const announcement = document.getElementById('sr-announcement');
      if (announcement) {
        announcement.textContent = previewMode ? 'Entered preview mode' : 'Entered design mode';
      }
    }
  }, [previewMode, screenReader]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container d-flex flex-column vh-100">
        {/* Screen reader announcements */}
        <div id="sr-announcement" className="sr-only" aria-live="polite"></div>
        
        {/* Skip to content link */}
        <a href="#main-content" className="skip-link">Skip to main content</a>
        
        {/* Toolbar */}
        <Toolbar 
          onExport={() => setShowExportDialog(true)}
          onImport={() => setShowImportDialog(true)}
          onTableEdit={() => setShowTableEditor(true)}
          onImageUpload={() => setShowImageUpload(true)}
          onGridSettings={() => setShowGridSettings(true)}
        />
        
        {/* Main content area */}
        <div className="d-flex flex-grow-1 overflow-hidden">
          {/* Left sidebar */}
          <SidebarLeft 
            collapsed={sidebarLeftCollapsed}
            onToggle={() => setSidebarLeftCollapsed(!sidebarLeftCollapsed)}
          />
          
          {/* Canvas container */}
          <main 
            id="main-content"
            className="canvas-container flex-grow-1 position-relative"
            role="main"
            aria-label="Canvas area"
          >
            <CanvasArea />
            <ContextMenu />
          </main>
          
          {/* Right sidebar */}
          <SidebarRight 
            collapsed={sidebarRightCollapsed}
            onToggle={() => setSidebarRightCollapsed(!sidebarRightCollapsed)}
          />
        </div>
        
        {/* Status bar */}
        <StatusBar />
        
        {/* Dialogs */}
        <ExportDialog 
          show={showExportDialog} 
          onHide={() => setShowExportDialog(false)} 
        />
        
        <ImportDialog 
          show={showImportDialog} 
          onHide={() => setShowImportDialog(false)} 
        />
        
        <TableEditor 
          show={showTableEditor} 
          onHide={() => setShowTableEditor(false)} 
        />
        
        <ImageUpload 
          show={showImageUpload} 
          onHide={() => setShowImageUpload(false)} 
        />
        
        <GridSettings 
          show={showGridSettings} 
          onHide={() => setShowGridSettings(false)} 
        />
      </div>
    </DndProvider>
  );
};

export default App;
