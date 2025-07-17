import React from 'react';
import { Card, ListGroup, Button, ButtonGroup, Badge } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useCanvas } from '../../context/CanvasContext';

const LayerManager = () => {
  const { 
    currentPage, 
    selectedElements, 
    selectElements, 
    updateElement, 
    deleteElements,
    dispatch 
  } = useCanvas();

  const elements = currentPage?.elements || [];

  const handleElementSelect = (elementId, multiSelect = false) => {
    if (multiSelect) {
      const newSelection = selectedElements.includes(elementId)
        ? selectedElements.filter(id => id !== elementId)
        : [...selectedElements, elementId];
      selectElements(newSelection);
    } else {
      selectElements([elementId]);
    }
  };

  const handleLayerReorder = (result) => {
    if (!result.destination) return;

    const newElements = Array.from(elements);
    const [reorderedElement] = newElements.splice(result.source.index, 1);
    newElements.splice(result.destination.index, 0, reorderedElement);

    dispatch({
      type: 'REORDER_ELEMENTS',
      payload: { pageIndex: currentPage, elements: newElements }
    });
  };

  const toggleVisibility = (elementId) => {
    const element = elements.find(el => el.id === elementId);
    updateElement({ ...element, visible: !element.visible });
  };

  const toggleLock = (elementId) => {
    const element = elements.find(el => el.id === elementId);
    updateElement({ ...element, locked: !element.locked });
  };

  const duplicateElement = (elementId) => {
    const element = elements.find(el => el.id === elementId);
    dispatch({
      type: 'ADD_ELEMENT',
      payload: {
        ...element,
        x: element.x + 20,
        y: element.y + 20,
        id: undefined // Will be generated
      }
    });
  };

  const deleteElement = (elementId) => {
    deleteElements([elementId]);
  };

  const getElementIcon = (type) => {
    const icons = {
      text: 'fas fa-font',
      rectangle: 'fas fa-square',
      circle: 'fas fa-circle',
      image: 'fas fa-image',
      table: 'fas fa-table',
      barcode: 'fas fa-barcode',
      qrcode: 'fas fa-qrcode',
      group: 'fas fa-object-group'
    };
    return icons[type] || 'fas fa-square';
  };

  const getElementDisplayName = (element) => {
    switch (element.type) {
      case 'text':
        return element.text?.substring(0, 20) || 'Text';
      case 'image':
        return element.name || 'Image';
      case 'table':
        return 'Table';
      case 'barcode':
        return `Barcode (${element.format})`;
      case 'qrcode':
        return 'QR Code';
      default:
        return element.type.charAt(0).toUpperCase() + element.type.slice(1);
    }
  };

  if (elements.length === 0) {
    return (
      <div className="layer-manager p-3">
        <div className="empty-state text-center">
          <i className="fas fa-layer-group fa-3x text-muted mb-3"></i>
          <p className="text-muted">No elements on this page</p>
          <p className="text-muted">Add elements to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="layer-manager">
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              Layers ({elements.length})
            </h6>
            <ButtonGroup size="sm">
              <Button
                variant="outline-secondary"
                onClick={() => selectElements(elements.map(el => el.id))}
                title="Select All"
              >
                <i className="fas fa-check-square"></i>
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => selectElements([])}
                title="Clear Selection"
              >
                <i className="fas fa-times"></i>
              </Button>
            </ButtonGroup>
          </div>
        </Card.Header>
        
        <Card.Body className="p-0">
          <DragDropContext onDragEnd={handleLayerReorder}>
            <Droppable droppableId="layers">
              {(provided) => (
                <ListGroup 
                  variant="flush" 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="layer-list"
                >
                  {elements.map((element, index) => (
                    <Draggable key={element.id} draggableId={element.id} index={index}>
                      {(provided, snapshot) => (
                        <ListGroup.Item
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`layer-item d-flex align-items-center ${
                            selectedElements.includes(element.id) ? 'active' : ''
                          } ${snapshot.isDragging ? 'dragging' : ''}`}
                          onClick={(e) => handleElementSelect(element.id, e.ctrlKey || e.metaKey)}
                        >
                          <div {...provided.dragHandleProps} className="drag-handle me-2">
                            <i className="fas fa-grip-vertical text-muted"></i>
                          </div>
                          
                          <div className="layer-icon me-2">
                            <i className={`${getElementIcon(element.type)} text-muted`}></i>
                          </div>
                          
                          <div className="layer-info flex-grow-1">
                            <div className="layer-name">
                              {getElementDisplayName(element)}
                            </div>
                            <div className="layer-meta text-muted small">
                              {element.type} • {Math.round(element.x)},{Math.round(element.y)}
                            </div>
                          </div>
                          
                          <div className="layer-status me-2">
                            {element.locked && (
                              <Badge bg="warning" className="me-1">
                                <i className="fas fa-lock"></i>
                              </Badge>
                            )}
                            {element.visible === false && (
                              <Badge bg="secondary">
                                <i className="fas fa-eye-slash"></i>
                              </Badge>
                            )}
                          </div>
                          
                          <ButtonGroup size="sm">
                            <Button
                              variant="outline-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleVisibility(element.id);
                              }}
                              title={element.visible === false ? 'Show' : 'Hide'}
                            >
                              <i className={`fas ${element.visible === false ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </Button>
                            
                            <Button
                              variant="outline-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLock(element.id);
                              }}
                              title={element.locked ? 'Unlock' : 'Lock'}
                            >
                              <i className={`fas ${element.locked ? 'fa-lock' : 'fa-unlock'}`}></i>
                            </Button>
                            
                            <Button
                              variant="outline-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateElement(element.id);
                              }}
                              title="Duplicate"
                            >
                              <i className="fas fa-copy"></i>
                            </Button>
                            
                            <Button
                              variant="outline-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(element.id);
                              }}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </ButtonGroup>
                        </ListGroup.Item>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ListGroup>
              )}
            </Droppable>
          </DragDropContext>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LayerManager;
