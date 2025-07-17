import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';

const FontPicker = ({ value, onChange, label, disabled = false }) => {
  const [availableFonts, setAvailableFonts] = useState([]);
  const [loading, setLoading] = useState(true);

  const systemFonts = [
    'Arial',
    'Arial Black',
    'Comic Sans MS',
    'Courier New',
    'Georgia',
    'Helvetica',
    'Impact',
    'Lucida Console',
    'Lucida Sans Unicode',
    'Palatino Linotype',
    'Tahoma',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana'
  ];

  const webFonts = [
    'Open Sans',
    'Roboto',
    'Lato',
    'Montserrat',
    'Poppins',
    'Source Sans Pro',
    'Oswald',
    'Raleway',
    'Slabo 27px',
    'Merriweather',
    'PT Sans',
    'PT Serif',
    'Playfair Display',
    'Lora',
    'Noto Sans'
  ];

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Check which fonts are available
        const availableSystemFonts = [];
        const availableWebFonts = [];

        // Test system fonts
        for (const font of systemFonts) {
          if (await isFontAvailable(font)) {
            availableSystemFonts.push(font);
          }
        }

        // For web fonts, assume they're available (would need actual font loading logic)
        availableWebFonts.push(...webFonts);

        setAvailableFonts([
          { group: 'System Fonts', fonts: availableSystemFonts },
          { group: 'Web Fonts', fonts: availableWebFonts }
        ]);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setAvailableFonts([
          { group: 'System Fonts', fonts: systemFonts }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadFonts();
  }, []);

  const isFontAvailable = (font) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Test with a known font first
      context.font = '12px monospace';
      const baselineWidth = context.measureText('Test').width;
      
      // Test with the desired font
      context.font = `12px ${font}, monospace`;
      const testWidth = context.measureText('Test').width;
      
      resolve(testWidth !== baselineWidth);
    });
  };

  const handleFontChange = (e) => {
    const selectedFont = e.target.value;
    onChange(selectedFont);
  };

  if (loading) {
    return (
      <div className="font-picker">
        {label && <label className="form-label">{label}</label>}
        <Form.Select disabled>
          <option>Loading fonts...</option>
        </Form.Select>
      </div>
    );
  }

  return (
    <div className="font-picker">
      {label && <label className="form-label">{label}</label>}
      
      <Form.Select
        value={value}
        onChange={handleFontChange}
        disabled={disabled}
        className="font-picker-select"
      >
        {availableFonts.map((group, groupIndex) => (
          <optgroup key={groupIndex} label={group.group}>
            {group.fonts.map((font) => (
              <option
                key={font}
                value={font}
                style={{ fontFamily: font }}
              >
                {font}
              </option>
            ))}
          </optgroup>
        ))}
      </Form.Select>
      
      {/* Font Preview */}
      <div 
        className="font-preview mt-2 p-2 border rounded"
        style={{ 
          fontFamily: value,
          fontSize: '14px',
          backgroundColor: '#f8f9fa'
        }}
      >
        The quick brown fox jumps over the lazy dog
      </div>
    </div>
  );
};

export default FontPicker;
