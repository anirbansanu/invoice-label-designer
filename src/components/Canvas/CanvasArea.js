import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { FixedSizeList as List } from 'react-window';


// Components
import GridOverlay from './GridOverlay';
import SelectionBox from './SelectionBox';
import GuideRuler from './GuideRuler';

// Elements
import TextElement from '../../elements/TextElement';
import TableElement from '../../elements/TableElement';
import ImageElement from '../../elements/ImageElement';
import ShapeElement from '../../elements/ShapeElement';
import BarcodeElement from '../../elements/BarcodeElement';
import QRCodeElement from '../../elements/QRCodeElement';
import StampElement from '../../elements/StampElement';
import GroupElement from '../../elements/GroupElement';

// Hooks
import { useCanvas } from '../../context/CanvasContext';
import { useSnapToGrid } from '../../hooks/useSnapToGrid';
import { useAccessibility } from '../../context/AccessibilityContext';

// Utils
import { performanceOptimizer } from '../../utils/performanceOptimizer';

const { zoom, setZoom } = useCanvas();

const CanvasArea = () => {
  const {
    currentPage,
    selectedElements,
    selectElements,
    updateElement,
    zoom,
    panOffset,
    setPanOffset,
    previewMode,
    labelGrid,
    virtualScrolling
  } = useCanvas();

  const { announceToScreenReader } = useAccessibility();
  const snapToGrid = useSnapToGrid();
  
  const stageRef = useRef();
  const containerRef = useRef();
  const [dragStart, setDragStart] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);
  const [visibleElements, setVisibleElements] = useState([]);

  // Performance optimization: virtual scrolling for large designs
  useEffect(() => {
    if (virtualScrolling && currentPage?.elements.length > 100) {
      const viewport = {
        x: -panOffset.x / zoom,
        y: -panOffset.y / zoom,
        width: (containerRef.current?.offsetWidth || 0) / zoom,
        height: (containerRef.current?.offsetHeight || 0) / zoom
      };
      
      const visible = currentPage.elements.filter(element => 
        performanceOptimizer.isElementVisible(element, viewport)
      );
      
      setVisibleElements(visible);
    } else {
      setVisibleElements(currentPage?.elements || []);
    }
  }, [currentPage?.elements, panOffset, zoom, virtualScrolling]);

  // Handle stage click
  const handleStageClick = useCallback((e) => {
    if (e.target === e.target.getStage()) {
      selectElements([]);
      announceToScreenReader('Selection cleared');
    }
  }, [selectElements, announceToScreenReader]);

  // Handle mouse down for selection box
  const handleMouseDown = useCallback((e) => {
    if (e.target === e.target.getStage()) {
      const pos = e.target.getStage().getPointerPosition();
      setDragStart({ x: pos.x, y: pos.y });
    }
  }, []);

  // Handle mouse move for selection box
  const handleMouseMove = useCallback((e) => {
    if (dragStart) {
      const pos = e.target.getStage().getPointerPosition();
      setSelectionBox({
        x: Math.min(dragStart.x, pos.x),
        y: Math.min(dragStart.y, pos.y),
        width: Math.abs(pos.x - dragStart.x),
        height: Math.abs(pos.y - dragStart.y)
      });
    }
  }, [dragStart]);

  // Handle mouse up for selection box
  const handleMouseUp = useCallback(() => {
    if (selectionBox && currentPage) {
      const elementsInSelection = currentPage.elements.filter(element => {
        return element.x >= selectionBox.x &&
               element.y >= selectionBox.y &&
               element.x + (element.width || 0) <= selectionBox.x + selectionBox.width &&
               element.y + (element.height || 0) <= selectionBox.y + selectionBox.height;
      });
      
      if (elementsInSelection.length > 0) {
        selectElements(elementsInSelection.map(el => el.id));
        announceToScreenReader(`${elementsInSelection.length} elements selected`);
      }
    }
    
    setDragStart(null);
    setSelectionBox(null);
  }, [selectionBox, currentPage, selectElements, announceToScreenReader]);

  // Handle element selection
  const handleElementSelect = useCallback((elementId, multiSelect = false) => {
    if (multiSelect) {
      const newSelection = selectedElements.includes(elementId)
        ? selectedElements.filter(id => id !== elementId)
        : [...selectedElements, elementId];
      selectElements(newSelection);
    } else {
      selectElements([elementId]);
    }
    
    const element = currentPage?.elements.find(el => el.id === elementId);
    if (element) {
      announceToScreenReader(`${element.type} element selected`);
    }
  }, [selectedElements, selectElements, currentPage, announceToScreenReader]);

  // Handle element change
  const handleElementChange = useCallback((element) => {
    updateElement(element);
  }, [updateElement]);

  // Render element based on type
  const renderElement = useCallback((element) => {
    const commonProps = {
      key: element.id,
      element,
      isSelected: selectedElements.includes(element.id),
      onSelect: handleElementSelect,
      onChange: handleElementChange,
      snapToGrid,
      previewMode
    };

    switch (element.type) {
      case 'text':
        return <TextElement {...commonProps} />;
      case 'table':
        return <TableElement {...commonProps} />;
      case 'image':
        return <ImageElement {...commonProps} />;
      case 'rectangle':
      case 'circle':
      case 'line':
      case 'polygon':
      case 'star':
      case 'arrow':
        return <ShapeElement {...commonProps} />;
      case 'barcode':
        return <BarcodeElement {...commonProps} />;
      case 'qrcode':
        return <QRCodeElement {...commonProps} />;
      case 'stamp':
        return <StampElement {...commonProps} />;
      case 'group':
        return <GroupElement {...commonProps} />;
      default:
        return null;
    }
  }, [selectedElements, handleElementSelect, handleElementChange, snapToGrid, previewMode]);

  // Render label grid
  const renderLabelGrid = useCallback(() => {
    if (!labelGrid.enabled) return null;
    
    const grids = [];
    const { rows, columns, rowGap, columnGap, margins } = labelGrid;
    const labelWidth = (currentPage.size.width - margins.left - margins.right - (columnGap * (columns - 1))) / columns;
    const labelHeight = (currentPage.size.height - margins.top - margins.bottom - (rowGap * (rows - 1))) / rows;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const x = margins.left + col * (labelWidth + columnGap);
        const y = margins.top + row * (labelHeight + rowGap);
        
        grids.push(
          <Rect
            key={`grid-${row}-${col}`}
            x={x}
            y={y}
            width={labelWidth}
            height={labelHeight}
            stroke="#0066cc"
            strokeWidth={1}
            dash={[5, 5]}
            fill="transparent"
          />
        );
      }
    }
    
    return grids;
  }, [labelGrid, currentPage?.size]);

  if (!currentPage) return null;

  return (
    <div 
      ref={containerRef}
      className="canvas-area bg-light overflow-hidden position-relative"
      style={{ cursor: dragStart ? 'crosshair' : 'default' }}
    >
      {/* Rulers */}
      <GuideRuler />
      
      {/* Main canvas */}
      <div 
        className="canvas-wrapper"
        style={{
          transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: 'top left'
        }}
      >
        <Stage
          ref={stageRef}
          width={currentPage.size.width}
          height={currentPage.size.height}
          onClick={handleStageClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="canvas-stage shadow"
          style={{ background: currentPage.background }}
        >
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={currentPage.size.width}
              height={currentPage.size.height}
              fill={currentPage.background}
            />
            
            {/* Grid overlay */}
            {currentPage.grid.visible && <GridOverlay />}
            
            {/* Label grid */}
            {renderLabelGrid()}
            
            {/* Elements */}
            {visibleElements.map(renderElement)}
            
            {/* Selection box */}
            {selectionBox && (
              <SelectionBox
                x={selectionBox.x}
                y={selectionBox.y}
                width={selectionBox.width}
                height={selectionBox.height}
              />
            )}
          </Layer>
        </Stage>
      </div>
      
      {/* Canvas overlay for UI elements */}
      <div className="canvas-overlay">
        {/* Zoom controls */}
        <div className="zoom-controls position-absolute bottom-0 end-0 p-3">
          <div className="btn-group-vertical">
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setZoom(zoom * 1.2)}
              aria-label="Zoom in"
            >
              <i className="fas fa-plus"></i>
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setZoom(zoom / 1.2)}
              aria-label="Zoom out"
            >
              <i className="fas fa-minus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;
