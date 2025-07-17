import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useCanvas } from '../../context/CanvasContext';
import NumberInput from '../Common/NumberInput';
import ColorPicker from '../Common/ColorPicker';

const GridSettings = ({ show, onHide }) => {
  const { currentPage, dispatch } = useCanvas();
  const [gridSettings, setGridSettings] = useState({
    size: currentPage?.grid?.size || 10,
    visible: currentPage?.grid?.visible || true,
    snap: currentPage?.grid?.snap || true,
    color: currentPage?.grid?.color || '#e0e0e0',
    style: currentPage?.grid?.style || 'dot', // 'dot', 'line', 'cross'
    opacity: currentPage?.grid?.opacity || 0.5
  });

  const handleSettingChange = (key, value) => {
    setGridSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    dispatch({
      type: 'UPDATE_PAGE_GRID',
      payload: {
        pageIndex: currentPage,
        grid: gridSettings
      }
    });
    onHide();
  };

  const handleReset = () => {
    setGridSettings({
      size: 10,
      visible: true,
      snap: true,
      color: '#e0e0e0',
      style: 'dot',
      opacity: 0.5
    });
  };

  const presetSizes = [
    { label: '5px', value: 5 },
    { label: '10px', value: 10 },
    { label: '15px', value: 15 },
    { label: '20px', value: 20 },
    { label: '25px', value: 25 },
    { label: '50px', value: 50 }
  ];

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Grid Settings</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Grid Size</Form.Label>
              <NumberInput
                value={gridSettings.size}
                onChange={(value) => handleSettingChange('size', value)}
                min={1}
                max={100}
                step={1}
                unit="px"
              />
              
              <div className="mt-2">
                <small className="text-muted">Quick presets:</small>
                <div className="d-flex gap-1 mt-1">
                  {presetSizes.map(preset => (
                    <Button
                      key={preset.value}
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleSettingChange('size', preset.value)}
                      className={gridSettings.size === preset.value ? 'active' : ''}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Grid Style</Form.Label>
              <Form.Select
                value={gridSettings.style}
                onChange={(e) => handleSettingChange('style', e.target.value)}
              >
                <option value="dot">Dots</option>
                <option value="line">Lines</option>
                <option value="cross">Crosses</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <ColorPicker
                label="Grid Color"
                value={gridSettings.color}
                onChange={(value) => handleSettingChange('color', value)}
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Opacity</Form.Label>
              <Form.Range
                value={gridSettings.opacity * 100}
                onChange={(e) => handleSettingChange('opacity', e.target.value / 100)}
                min={10}
                max={100}
                step={10}
              />
              <div className="d-flex justify-content-between">
                <small className="text-muted">10%</small>
                <small className="text-muted">{Math.round(gridSettings.opacity * 100)}%</small>
                <small className="text-muted">100%</small>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Show Grid"
                checked={gridSettings.visible}
                onChange={(e) => handleSettingChange('visible', e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Snap to Grid"
                checked={gridSettings.snap}
                onChange={(e) => handleSettingChange('snap', e.target.checked)}
              />
            </Form.Group>

            {/* Preview */}
            <div className="grid-preview">
              <Form.Label>Preview</Form.Label>
              <div 
                className="preview-container"
                style={{
                  width: '100%',
                  height: '100px',
                  border: '1px solid #ccc',
                  position: 'relative',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden'
                }}
              >
                <div
                  className="grid-preview-pattern"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: gridSettings.visible ? gridSettings.opacity : 0,
                    backgroundImage: generateGridPattern(gridSettings),
                    backgroundSize: `${gridSettings.size}px ${gridSettings.size}px`
                  }}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleReset}>
          Reset to Default
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const generateGridPattern = (settings) => {
  const { size, color, style } = settings;
  
  switch (style) {
    case 'dot':
      return `radial-gradient(circle at center, ${color} 1px, transparent 1px)`;
    case 'line':
      return `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
    case 'cross':
      return `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
    default:
      return `radial-gradient(circle at center, ${color} 1px, transparent 1px)`;
  }
};

export default GridSettings;
