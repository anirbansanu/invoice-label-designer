import React from 'react';
import { Card, Form, Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { useCanvas } from '../../context/CanvasContext';
import ColorPicker from '../Common/ColorPicker';
import FontPicker from '../Common/FontPicker';
import NumberInput from '../Common/NumberInput';

const ElementProperties = () => {
  const { selectedElementsData, updateElement, deleteElements, duplicateElements } = useCanvas();

  if (selectedElementsData.length === 0) {
    return (
      <div className="element-properties p-3">
        <div className="empty-state text-center">
          <i className="fas fa-mouse-pointer fa-3x text-muted mb-3"></i>
          <p className="text-muted">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const element = selectedElementsData[0];
  const isMultipleSelection = selectedElementsData.length > 1;

  const handlePropertyChange = (property, value) => {
    selectedElementsData.forEach(el => {
      updateElement({ ...el, [property]: value });
    });
  };

  const handleDuplicate = () => {
    duplicateElements(selectedElementsData.map(el => el.id));
  };

  const handleDelete = () => {
    deleteElements(selectedElementsData.map(el => el.id));
  };

  return (
    <div className="element-properties">
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              {isMultipleSelection ? `${selectedElementsData.length} Elements` : element.type}
            </h6>
            <ButtonGroup size="sm">
              <Button variant="outline-primary" onClick={handleDuplicate}>
                <i className="fas fa-copy"></i>
              </Button>
              <Button variant="outline-danger" onClick={handleDelete}>
                <i className="fas fa-trash"></i>
              </Button>
            </ButtonGroup>
          </div>
        </Card.Header>
        
        <Card.Body>
          {/* Position and Size */}
          <div className="property-group mb-4">
            <h6 className="property-group-title">Position & Size</h6>
            <Row>
              <Col sm={6}>
                <NumberInput
                  label="X"
                  value={element.x}
                  onChange={(value) => handlePropertyChange('x', value)}
                  unit="px"
                  precision={1}
                />
              </Col>
              <Col sm={6}>
                <NumberInput
                  label="Y"
                  value={element.y}
                  onChange={(value) => handlePropertyChange('y', value)}
                  unit="px"
                  precision={1}
                />
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <NumberInput
                  label="Width"
                  value={element.width}
                  onChange={(value) => handlePropertyChange('width', value)}
                  unit="px"
                  precision={1}
                  min={1}
                />
              </Col>
              <Col sm={6}>
                <NumberInput
                  label="Height"
                  value={element.height}
                  onChange={(value) => handlePropertyChange('height', value)}
                  unit="px"
                  precision={1}
                  min={1}
                />
              </Col>
            </Row>
          </div>

          {/* Text Properties */}
          {element.type === 'text' && (
            <>
              <div className="property-group mb-4">
                <h6 className="property-group-title">Text Content</h6>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={element.text}
                    onChange={(e) => handlePropertyChange('text', e.target.value)}
                    placeholder="Enter text or use {{placeholders}}"
                  />
                  <Form.Text className="text-muted">
                    Use {{variable}} for dynamic content
                  </Form.Text>
                </Form.Group>
              </div>

              <div className="property-group mb-4">
                <h6 className="property-group-title">Font</h6>
                <FontPicker
                  label="Font Family"
                  value={element.fontFamily}
                  onChange={(value) => handlePropertyChange('fontFamily', value)}
                />
                <NumberInput
                  label="Font Size"
                  value={element.fontSize}
                  onChange={(value) => handlePropertyChange('fontSize', value)}
                  unit="px"
                  min={6}
                  max={200}
                />
              </div>

              <div className="property-group mb-4">
                <h6 className="property-group-title">Text Style</h6>
                <ColorPicker
                  label="Text Color"
                  value={element.fill}
                  onChange={(value) => handlePropertyChange('fill', value)}
                />
                <Form.Group>
                  <Form.Label>Text Alignment</Form.Label>
                  <Form.Select
                    value={element.align}
                    onChange={(e) => handlePropertyChange('align', e.target.value)}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </>
          )}

          {/* Shape Properties */}
          {(element.type === 'rectangle' || element.type === 'circle') && (
            <div className="property-group mb-4">
              <h6 className="property-group-title">Fill & Stroke</h6>
              <ColorPicker
                label="Fill Color"
                value={element.fill}
                onChange={(value) => handlePropertyChange('fill', value)}
              />
              <ColorPicker
                label="Stroke Color"
                value={element.stroke}
                onChange={(value) => handlePropertyChange('stroke', value)}
              />
              <NumberInput
                label="Stroke Width"
                value={element.strokeWidth}
                onChange={(value) => handlePropertyChange('strokeWidth', value)}
                unit="px"
                min={0}
                max={50}
              />
            </div>
          )}

          {/* Barcode Properties */}
          {element.type === 'barcode' && (
            <div className="property-group mb-4">
              <h6 className="property-group-title">Barcode Settings</h6>
              <Form.Group>
                <Form.Label>Barcode Value</Form.Label>
                <Form.Control
                  type="text"
                  value={element.value}
                  onChange={(e) => handlePropertyChange('value', e.target.value)}
                  placeholder="Enter value or {{placeholder}}"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Barcode Format</Form.Label>
                <Form.Select
                  value={element.format}
                  onChange={(e) => handlePropertyChange('format', e.target.value)}
                >
                  <option value="CODE128">CODE128</option>
                  <option value="CODE39">CODE39</option>
                  <option value="EAN13">EAN13</option>
                  <option value="EAN8">EAN8</option>
                  <option value="UPC">UPC</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}

          {/* QR Code Properties */}
          {element.type === 'qrcode' && (
            <div className="property-group mb-4">
              <h6 className="property-group-title">QR Code Settings</h6>
              <Form.Group>
                <Form.Label>QR Code Value</Form.Label>
                <Form.Control
                  type="text"
                  value={element.value}
                  onChange={(e) => handlePropertyChange('value', e.target.value)}
                  placeholder="Enter value or {{placeholder}}"
                />
              </Form.Group>
              <NumberInput
                label="Size"
                value={element.size}
                onChange={(value) => handlePropertyChange('size', value)}
                unit="px"
                min={50}
                max={500}
              />
            </div>
          )}

          {/* Transform Properties */}
          <div className="property-group mb-4">
            <h6 className="property-group-title">Transform</h6>
            <NumberInput
              label="Rotation"
              value={element.rotation || 0}
              onChange={(value) => handlePropertyChange('rotation', value)}
              unit="°"
              min={-360}
              max={360}
            />
            <NumberInput
              label="Opacity"
              value={element.opacity || 1}
              onChange={(value) => handlePropertyChange('opacity', value)}
              min={0}
              max={1}
              step={0.1}
              precision={1}
            />
          </div>

          {/* Layer Properties */}
          <div className="property-group mb-4">
            <h6 className="property-group-title">Layer</h6>
            <Form.Check
              type="checkbox"
              label="Visible"
              checked={element.visible !== false}
              onChange={(e) => handlePropertyChange('visible', e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label="Locked"
              checked={element.locked || false}
              onChange={(e) => handlePropertyChange('locked', e.target.checked)}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ElementProperties;
