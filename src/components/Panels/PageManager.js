import React, { useState, useCallback } from 'react';
import { Card, Button, Form, Row, Col, Badge, Dropdown } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { useCanvas } from '../../context/CanvasContext';

const PageManager = () => {
  const { 
    pages, 
    currentPage, 
    setCurrentPage, 
    addPage, 
    deletePage, 
    dispatch 
  } = useCanvas();
  
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageSettings, setNewPageSettings] = useState({
    name: '',
    size: 'A4',
    orientation: 'portrait',
    background: '#ffffff',
    copyFrom: null
  });

  const pageSizes = {
    'A4': { width: 794, height: 1123 },
    'A3': { width: 1123, height: 1587 },
    'A5': { width: 559, height: 794 },
    'Letter': { width: 816, height: 1056 },
    'Legal': { width: 816, height: 1344 },
    'Tabloid': { width: 1056, height: 1632 },
    'Label_4x6': { width: 288, height: 432 },
    'Label_4x4': { width: 288, height: 288 },
    'Custom': { width: 800, height: 600 }
  };

  const handleAddPage = useCallback(() => {
    const size = pageSizes[newPageSettings.size];
    const finalSize = newPageSettings.orientation === 'landscape' 
      ? { width: size.height, height: size.width }
      : size;

    const pageConfig = {
      name: newPageSettings.name || `Page ${pages.length + 1}`,
      size: finalSize,
      background: newPageSettings.background
    };

    // Copy elements from existing page if specified
    if (newPageSettings.copyFrom !== null) {
      const sourcePage = pages[newPageSettings.copyFrom];
      pageConfig.elements = sourcePage.elements.map(el => ({
        ...el,
        id: `${el.id}_copy_${Date.now()}`
      }));
    }

    addPage(pageConfig);
    setShowAddPage(false);
    setNewPageSettings({
      name: '',
      size: 'A4',
      orientation: 'portrait',
      background: '#ffffff',
      copyFrom: null
    });
  }, [pages, newPageSettings, addPage]);

  const handleDeletePage = useCallback((index) => {
    if (pages.length > 1 && window.confirm('Are you sure you want to delete this page?')) {
      deletePage(index);
    }
  }, [pages.length, deletePage]);

  const handleDuplicatePage = useCallback((index) => {
    const sourcePage = pages[index];
    const pageConfig = {
      name: `${sourcePage.name} (Copy)`,
      size: sourcePage.size,
      background: sourcePage.background,
      elements: sourcePage.elements.map(el => ({
        ...el,
        id: `${el.id}_copy_${Date.now()}`
      }))
    };
    
    addPage(pageConfig);
  }, [pages, addPage]);

  const handlePageReorder = useCallback((result) => {
    if (!result.destination) return;

    const newPages = Array.from(pages);
    const [reorderedPage] = newPages.splice(result.source.index, 1);
    newPages.splice(result.destination.index, 0, reorderedPage);

    dispatch({ type: 'REORDER_PAGES', payload: newPages });
  }, [pages, dispatch]);

  const handlePageUpdate = useCallback((index, updates) => {
    dispatch({ 
      type: 'UPDATE_PAGE', 
      payload: { index, updates } 
    });
  }, [dispatch]);

  const generatePageThumbnail = useCallback((page) => {
    // Generate a thumbnail representation of the page
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = page.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw simplified elements
    page.elements.forEach(element => {
      const scaleX = canvas.width / page.size.width;
      const scaleY = canvas.height / page.size.height;
      
      ctx.save();
      ctx.translate(element.x * scaleX, element.y * scaleY);
      
      switch (element.type) {
        case 'text':
          ctx.fillStyle = element.fill || '#000000';
          ctx.font = `${(element.fontSize || 16) * scaleX}px ${element.fontFamily || 'Arial'}`;
          ctx.fillText(element.text?.substring(0, 10) || '', 0, 0);
          break;
        case 'rectangle':
          ctx.fillStyle = element.fill || '#ffffff';
          ctx.strokeStyle = element.stroke || '#000000';
          ctx.lineWidth = element.strokeWidth || 1;
          ctx.fillRect(0, 0, (element.width || 0) * scaleX, (element.height || 0) * scaleY);
          ctx.strokeRect(0, 0, (element.width || 0) * scaleX, (element.height || 0) * scaleY);
          break;
        default:
          // Simple representation for other elements
          ctx.fillStyle = '#cccccc';
          ctx.fillRect(0, 0, 10, 10);
      }
      
      ctx.restore();
    });
    
    return canvas.toDataURL();
  }, []);

  return (
    <Card className="page-manager">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Pages ({pages.length})</h6>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={() => setShowAddPage(true)}
        >
          <i className="fas fa-plus"></i> Add Page
        </Button>
      </Card.Header>
      
      <Card.Body className="p-0">
        {showAddPage && (
          <div className="p-3 border-bottom">
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Page Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={newPageSettings.name}
                      onChange={(e) => setNewPageSettings(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter page name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Page Size</Form.Label>
                    <Form.Select
                      value={newPageSettings.size}
                      onChange={(e) => setNewPageSettings(prev => ({ ...prev, size: e.target.value }))}
                    >
                      {Object.keys(pageSizes).map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Orientation</Form.Label>
                    <Form.Select
                      value={newPageSettings.orientation}
                      onChange={(e) => setNewPageSettings(prev => ({ ...prev, orientation: e.target.value }))}
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Background</Form.Label>
                    <Form.Control
                      type="color"
                      value={newPageSettings.background}
                      onChange={(e) => setNewPageSettings(prev => ({ ...prev, background: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Copy From Page</Form.Label>
                <Form.Select
                  value={newPageSettings.copyFrom ?? ''}
                  onChange={(e) => setNewPageSettings(prev => ({ 
                    ...prev, 
                    copyFrom: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                >
                  <option value="">Create blank page</option>
                  {pages.map((page, index) => (
                    <option key={index} value={index}>{page.name || `Page ${index + 1}`}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <div className="d-flex gap-2">
                <Button variant="primary" size="sm" onClick={handleAddPage}>
                  Add Page
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowAddPage(false)}>
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        )}
        
        <DragDropContext onDragEnd={handlePageReorder}>
          <Droppable droppableId="pages">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {pages.map((page, index) => (
                  <Draggable key={page.id} draggableId={page.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`page-item p-2 border-bottom ${
                          currentPage === index ? 'active' : ''
                        } ${snapshot.isDragging ? 'dragging' : ''}`}
                        onClick={() => setCurrentPage(index)}
                      >
                        <div className="d-flex align-items-center">
                          <div {...provided.dragHandleProps} className="drag-handle me-2">
                            <i className="fas fa-grip-vertical text-muted"></i>
                          </div>
                          
                          <div className="page-thumbnail me-2">
                            <img
                              src={generatePageThumbnail(page)}
                              alt={`Page ${index + 1} thumbnail`}
                              className="img-fluid"
                              style={{ width: '40px', height: '50px', objectFit: 'cover' }}
                            />
                          </div>
                          
                          <div className="page-info flex-grow-1">
                            <div className="d-flex align-items-center">
                              <strong>{page.name || `Page ${index + 1}`}</strong>
                              {currentPage === index && (
                                <Badge bg="primary" className="ms-2">Current</Badge>
                              )}
                            </div>
                            <small className="text-muted">
                              {page.size.width} × {page.size.height}px
                              {page.elements.length > 0 && ` • ${page.elements.length} elements`}
                            </small>
                          </div>
                          
                          <Dropdown align="end">
                            <Dropdown.Toggle variant="link" size="sm" className="text-muted">
                              <i className="fas fa-ellipsis-v"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleDuplicatePage(index)}>
                                <i className="fas fa-copy me-2"></i>Duplicate
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handlePageUpdate(index, { name: prompt('Enter new name:', page.name) })}>
                                <i className="fas fa-edit me-2"></i>Rename
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item 
                                onClick={() => handleDeletePage(index)}
                                className="text-danger"
                                disabled={pages.length === 1}
                              >
                                <i className="fas fa-trash me-2"></i>Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Card.Body>
    </Card>
  );
};

export default PageManager;
