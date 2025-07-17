import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Layout Components
import Toolbar from './Layout/Toolbar';
import SidebarLeft from './Layout/SidebarLeft';
import SidebarRight from './Layout/SidebarRight';
import StatusBar from './Layout/StatusBar';

// Canvas Components
import CanvasArea from './Canvas/CanvasArea';
import ContextMenu from './Canvas/ContextMenu';

// Dialog Components
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
  // Context hooks
  const { previewMode } = useCanvas();
  const { theme } = useTheme();
  const { highContrast, screenReader } = useAccessibility();
  
  // Dialog state management
  const [dialogs, setDialogs] = useState({
    export: false,
    import: false,
    tableEditor: false,
    imageUpload: false,
    gridSettings: false
  });
  
  // Sidebar state management
  const [sidebarState, setSidebarState] = useState({
    leftCollapsed: false,
    rightCollapsed: false
  });

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Apply theme classes to document body
  useEffect(() => {
    const classes = [
      `theme-${theme}`,
      highContrast ? 'high-contrast' : '',
      'invoice-designer-app'
    ].filter(Boolean).join(' ');
    
    document.body.className = classes;
    
    // Cleanup on unmount
    return () => {
      document.body.className = '';
    };
  }, [theme, highContrast]);

  // Screen reader announcements for mode changes
  useEffect(() => {
    if (screenReader) {
      const announcement = document.getElementById('sr-announcement');
      if (announcement) {
        announcement.textContent = previewMode 
          ? 'Switched to preview mode' 
          : 'Switched to design mode';
      }
    }
  }, [previewMode, screenReader]);

  // Dialog management functions
  const openDialog = (dialogName) => {
    setDialogs(prev => ({ ...prev, [dialogName]: true }));
  };

  const closeDialog = (dialogName) => {
    setDialogs(prev => ({ ...prev, [dialogName]: false }));
  };

  // Sidebar management functions
  const toggleSidebar = (side) => {
    setSidebarState(prev => ({
      ...prev,
      [`${side}Collapsed`]: !prev[`${side}Collapsed`]
    }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container d-flex flex-column vh-100">
        {/* Accessibility Elements */}
        <div id="sr-announcement" className="sr-only" aria-live="polite"></div>
        
        {/* Skip Navigation Link */}
        <a 
          href="#main-content" 
          className="skip-link position-absolute bg-primary text-white p-2 text-decoration-none"
          style={{ top: '-40px', left: '6px', zIndex: 9999 }}
          onFocus={(e) => e.target.style.top = '6px'}
          onBlur={(e) => e.target.style.top = '-40px'}
        >
          Skip to main content
        </a>
        
        {/* Application Header/Toolbar */}
        <Toolbar 
          onExport={() => openDialog('export')}
          onImport={() => openDialog('import')}
          onTableEdit={() => openDialog('tableEditor')}
          onImageUpload={() => openDialog('imageUpload')}
          onGridSettings={() => openDialog('gridSettings')}
        />
        
        {/* Main Application Layout */}
        <div className="d-flex flex-grow-1 overflow-hidden">
          {/* Left Sidebar */}
          <SidebarLeft 
            collapsed={sidebarState.leftCollapsed}
            onToggle={() => toggleSidebar('left')}
          />
          
          {/* Main Canvas Area */}
          <main 
            id="main-content"
            className="canvas-container flex-grow-1 position-relative"
            role="main"
            aria-label="Design canvas workspace"
            tabIndex={0}
          >
            <CanvasArea />
            <ContextMenu />
          </main>
          
          {/* Right Sidebar */}
          <SidebarRight 
            collapsed={sidebarState.rightCollapsed}
            onToggle={() => toggleSidebar('right')}
          />
        </div>
        
        {/* Application Footer/Status Bar */}
        <StatusBar />
        
        {/* Modal Dialogs */}
        <ExportDialog 
          show={dialogs.export} 
          onHide={() => closeDialog('export')} 
        />
        
        <ImportDialog 
          show={dialogs.import} 
          onHide={() => closeDialog('import')} 
        />
        
        <TableEditor 
          show={dialogs.tableEditor} 
          onHide={() => closeDialog('tableEditor')} 
        />
        
        <ImageUpload 
          show={dialogs.imageUpload} 
          onHide={() => closeDialog('imageUpload')} 
        />
        
        <GridSettings 
          show={dialogs.gridSettings} 
          onHide={() => closeDialog('gridSettings')} 
        />
      </div>
    </DndProvider>
  );
};

export default App;
