import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { Dropdown } from 'react-bootstrap';

const ColorPicker = ({ value, onChange, label, disabled = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [color, setColor] = useState(value || '#000000');

  const handleColorChange = (colorResult) => {
    const newColor = colorResult.hex;
    setColor(newColor);
    onChange(newColor);
  };

  const presetColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#808080', '#800000',
    '#008000', '#000080', '#808000', '#800080', '#008080',
    '#c0c0c0', '#ffa500', '#a52a2a', '#dda0dd', '#98fb98'
  ];

  return (
    <div className="color-picker">
      {label && <label className="form-label">{label}</label>}
      
      <Dropdown show={showPicker} onToggle={setShowPicker}>
        <Dropdown.Toggle
          variant="outline-secondary"
          disabled={disabled}
          className="color-picker-toggle d-flex align-items-center"
          style={{ width: '100%' }}
        >
          <div
            className="color-preview me-2"
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: color,
              border: '1px solid #ccc',
              borderRadius: '3px'
            }}
          />
          <span className="flex-grow-1 text-start">{color}</span>
        </Dropdown.Toggle>

        <Dropdown.Menu className="color-picker-menu p-0">
          <div className="p-2">
            <SketchPicker
              color={color}
              onChange={handleColorChange}
              presetColors={presetColors}
              width="240px"
            />
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default ColorPicker;
