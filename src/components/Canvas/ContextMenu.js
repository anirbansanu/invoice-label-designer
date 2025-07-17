import React, { useState, useEffect, useCallback } from 'react';
import { useCanvas } from '../../context/CanvasContext';

const ContextMenu = () => {
  const { 
    selectedElements, 
    selectedElementsData, 
    deleteElements, 
    copyElements, 
    pasteElements,
    groupElements,
    ungroupElements,
    dispatch
  } = useCanvas();
  
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [targetElement, setTargetElement] = useState(null);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      
      // Check if right-click is on canvas element
      const stage = e.target.closest('.konvajs-content');
      if (stage) {
        setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY
        });
      }
    };

    const handleClick = () => {
      setContextMenu({ visible: false, x: 0, y: 0 });
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleCopy = useCallback(() => {
    if (selectedElements.length > 0) {
      copyElements(selectedElements);
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, [selectedElements, copyElements]);

  const handlePaste = useCallback(() => {
    pasteElements();
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, [pasteElements]);

  const handleDelete = useCallback(() => {
    if (selectedElements.length > 0) {
      deleteElements(selectedElements);
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, [selectedElements, deleteElements]);

  const handleDuplicate = useCallback(() => {
    if (selectedElements.length > 0) {
      copyElements(selectedElements);
      setTimeout(() => pasteElements(), 10);
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, [selectedElements, copyElements, pasteElements]);

  const handleGroup = useCallback(() => {
    if (selectedElements.length > 1) {
      groupElements(selectedElements);
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, [selectedElements, groupElements]);

  const handleUngroup = useCallback(() => {
    const groupedElements = selectedElementsData.filter(el => el.type === 'group');
    if (groupedElements.length > 0) {
      ungroupElements(groupedElements.map(el => el.id));
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, [selectedElementsData, ungroupElements]);

  const handleBringToFront = useCallback(() => {
    selectedElements.forEach(id => {
      dispatch({ type: 'BRING_TO_FRONT', payload: id });
    });
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, [selectedElements, dispatch]);

  const handleSendToBack = useCallback(() => {
    selectedElements.forEach(id => {
      dispatch({ type: 'SEND_TO_BACK', payload: id });
    });
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, [selectedElements, dispatch]);

  if (!contextMenu.visible) return null;

  return (
    <div
      className="context-menu"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
        position: 'fixed',
        zIndex: 1000,
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minWidth: '160px',
        padding: '8px 0'
      }}
    >
      {selectedElements.length > 0 && (
        <>
          <button className="context-menu-item" onClick={handleCopy}>
            <i className="fas fa-copy me-2"></i>Copy
          </button>
          <button className="context-menu-item" onClick={handleDuplicate}>
            <i className="fas fa-clone me-2"></i>Duplicate
          </button>
          <button className="context-menu-item" onClick={handleDelete}>
            <i className="fas fa-trash me-2"></i>Delete
          </button>
          <div className="context-menu-divider"></div>
        </>
      )}
      
      <button className="context-menu-item" onClick={handlePaste}>
        <i className="fas fa-paste me-2"></i>Paste
      </button>
      
      {selectedElements.length > 1 && (
        <>
          <div className="context-menu-divider"></div>
          <button className="context-menu-item" onClick={handleGroup}>
            <i className="fas fa-object-group me-2"></i>Group
          </button>
        </>
      )}
      
      {selectedElementsData.some(el => el.type === 'group') && (
        <button className="context-menu-item" onClick={handleUngroup}>
          <i className="fas fa-object-ungroup me-2"></i>Ungroup
        </button>
      )}
      
      {selectedElements.length > 0 && (
        <>
          <div className="context-menu-divider"></div>
          <button className="context-menu-item" onClick={handleBringToFront}>
            <i className="fas fa-arrow-up me-2"></i>Bring to Front
          </button>
          <button className="context-menu-item" onClick={handleSendToBack}>
            <i className="fas fa-arrow-down me-2"></i>Send to Back
          </button>
        </>
      )}
    </div>
  );
};

export default ContextMenu;
