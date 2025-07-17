import React from 'react';
import { Navbar, Nav, ButtonGroup, Dropdown, Form } from 'react-bootstrap';
import { useCanvas } from '../../context/CanvasContext';
import IconButton from '../Common/IconButton';

const Toolbar = ({ 
  onExport, 
  onImport, 
  onTableEdit, 
  onImageUpload, 
  onGridSettings 
}) => {
  const { 
    zoom, 
    setZoom, 
    currentPage, 
    showGrid, 
    snapToGrid, 
    previewMode, 
    togglePreview,
    undo,
    redo,
    history,
    historyIndex,
    dispatch 
  } = useCanvas();

  const addElement = (type) => {
    const elementDefaults = {
      text: {
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
      },
      rectangle: {
        type: 'rectangle',
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1
      },
      circle: {
        type: 'circle',
        x: 200,
        y: 200,
        radius: 50,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1
      },
      table: {
        type: 'table',
        x: 250,
        y: 250,
        width: 400,
        height: 200,
        columns: [
          { header: 'Product', width: 200 },
          { header: 'Quantity', width: 100 },
          { header: 'Price', width: 100 }
        ],
        rows: [
          ['{{product.name}}', '{{product.quantity}}', '{{product.price}}']
        ]
      },
      barcode: {
        type: 'barcode',
        x: 300,
        y: 300,
        width: 200,
        height: 50,
        value: '{{product.sku}}',
        format: 'CODE128'
      },
      qrcode: {
        type: 'qrcode',
        x: 350,
        y: 350,
        size: 100,
        value: '{{invoice.number}}'
      }
    };

    dispatch({
      type: 'ADD_ELEMENT',
      payload: elementDefaults[type]
    });
  };

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  const zoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 5));
  };

  const zoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.1));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <Navbar bg="light" expand="lg" className="border-bottom px-3">
      <Nav className="me-auto">
        {/* File Operations */}
        <ButtonGroup className="me-3">
          <IconButton
            icon="file-plus"
            tooltip="New Design"
            onClick={() => dispatch({ type: 'NEW_DESIGN' })}
          >
            New
          </IconButton>
          
          <IconButton
            icon="folder-open"
            tooltip="Import Design"
            onClick={onImport}
          >
            Import
          </IconButton>
          
          <IconButton
            icon="download"
            tooltip="Export Design"
            onClick={onExport}
          >
            Export
          </IconButton>
        </ButtonGroup>

        {/* Edit Operations */}
        <ButtonGroup className="me-3">
          <IconButton
            icon="undo"
            tooltip="Undo"
            onClick={undo}
            disabled={!canUndo}
          />
          
          <IconButton
            icon="redo"
            tooltip="Redo"
            onClick={redo}
            disabled={!canRedo}
          />
        </ButtonGroup>

        {/* Add Elements */}
        <ButtonGroup className="me-3">
          <IconButton
            icon="font"
            tooltip="Add Text"
            onClick={() => addElement('text')}
          />
          
          <IconButton
            icon="square"
            tooltip="Add Rectangle"
            onClick={() => addElement('rectangle')}
          />
          
          <IconButton
            icon="circle"
            tooltip="Add Circle"
            onClick={() => addElement('circle')}
          />
          
          <IconButton
            icon="table"
            tooltip="Add Table"
            onClick={() => addElement('table')}
          />
          
          <IconButton
            icon="barcode"
            tooltip="Add Barcode"
            onClick={() => addElement('barcode')}
          />
          
          <IconButton
            icon="qrcode"
            tooltip="Add QR Code"
            onClick={() => addElement('qrcode')}
          />
          
          <IconButton
            icon="image"
            tooltip="Add Image"
            onClick={onImageUpload}
          />
        </ButtonGroup>

        {/* View Controls */}
        <ButtonGroup className="me-3">
          <IconButton
            icon="th"
            tooltip="Toggle Grid"
            active={showGrid}
            onClick={() => dispatch({ type: 'TOGGLE_GRID' })}
          />
          
          <IconButton
            icon="magnet"
            tooltip="Toggle Snap"
            active={snapToGrid}
            onClick={() => dispatch({ type: 'TOGGLE_SNAP' })}
          />
          
          <IconButton
            icon="cog"
            tooltip="Grid Settings"
            onClick={onGridSettings}
          />
        </ButtonGroup>

        {/* Zoom Controls */}
        <ButtonGroup className="me-3">
          <IconButton
            icon="search-minus"
            tooltip="Zoom Out"
            onClick={zoomOut}
          />
          
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm">
              {Math.round(zoom * 100)}%
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleZoomChange(0.25)}>25%</Dropdown.Item>
              <Dropdown.Item onClick={() => handleZoomChange(0.5)}>50%</Dropdown.Item>
              <Dropdown.Item onClick={() => handleZoomChange(0.75)}>75%</Dropdown.Item>
              <Dropdown.Item onClick={() => handleZoomChange(1)}>100%</Dropdown.Item>
              <Dropdown.Item onClick={() => handleZoomChange(1.25)}>125%</Dropdown.Item>
              <Dropdown.Item onClick={() => handleZoomChange(1.5)}>150%</Dropdown.Item>
              <Dropdown.Item onClick={() => handleZoomChange(2)}>200%</Dropdown.Item>
              <Dropdown.Item onClick={() => handleZoomChange(3)}>300%</Dropdown.Item>
              <Dropdown.Item onClick={() => handleZoomChange(4)}>400%</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <IconButton
            icon="search-plus"
            tooltip="Zoom In"
            onClick={zoomIn}
          />
          
          <IconButton
            icon="compress-arrows-alt"
            tooltip="Reset Zoom"
            onClick={resetZoom}
          />
        </ButtonGroup>
      </Nav>

      <Nav>
        {/* Preview Mode */}
        <Form.Check
          type="switch"
          id="preview-mode"
          label="Preview Mode"
          checked={previewMode}
          onChange={togglePreview}
          className="me-3"
        />

        {/* Additional Tools */}
        <ButtonGroup>
          <IconButton
            icon="table"
            tooltip="Table Editor"
            onClick={onTableEdit}
          />
          
          <IconButton
            icon="palette"
            tooltip="Color Palette"
            onClick={() => console.log('Color palette')}
          />
          
          <IconButton
            icon="question-circle"
            tooltip="Help"
            onClick={() => console.log('Help')}
          />
        </ButtonGroup>
      </Nav>
    </Navbar>
  );
};

export default Toolbar;
