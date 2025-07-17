import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

const NumberInput = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  placeholder,
  disabled = false,
  unit,
  showControls = true,
  precision = 0,
  className = '',
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value?.toString() || '');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(value?.toString() || '');
  }, [value]);

  const validateValue = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val === '') {
      setIsValid(true);
      onChange(undefined);
      return;
    }

    const isValidValue = validateValue(val);
    setIsValid(isValidValue);
    
    if (isValidValue) {
      const num = parseFloat(val);
      const roundedNum = precision > 0 ? 
        Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision) : 
        Math.round(num);
      onChange(roundedNum);
    }
  };

  const handleIncrement = () => {
    const currentValue = parseFloat(inputValue) || 0;
    const newValue = currentValue + step;
    if (max === undefined || newValue <= max) {
      const roundedValue = precision > 0 ? 
        Math.round(newValue * Math.pow(10, precision)) / Math.pow(10, precision) : 
        Math.round(newValue);
      setInputValue(roundedValue.toString());
      onChange(roundedValue);
    }
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(inputValue) || 0;
    const newValue = currentValue - step;
    if (min === undefined || newValue >= min) {
      const roundedValue = precision > 0 ? 
        Math.round(newValue * Math.pow(10, precision)) / Math.pow(10, precision) : 
        Math.round(newValue);
      setInputValue(roundedValue.toString());
      onChange(roundedValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  const handleBlur = () => {
    if (inputValue === '') return;
    
    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      let clampedValue = num;
      if (min !== undefined) clampedValue = Math.max(clampedValue, min);
      if (max !== undefined) clampedValue = Math.min(clampedValue, max);
      
      const roundedValue = precision > 0 ? 
        Math.round(clampedValue * Math.pow(10, precision)) / Math.pow(10, precision) : 
        Math.round(clampedValue);
      
      setInputValue(roundedValue.toString());
      onChange(roundedValue);
      setIsValid(true);
    }
  };

  return (
    <div className={`number-input ${className}`}>
      {label && <Form.Label>{label}</Form.Label>}
      
      <InputGroup>
        <Form.Control
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          isInvalid={!isValid}
          {...props}
        />
        
        {unit && (
          <InputGroup.Text>{unit}</InputGroup.Text>
        )}
        
        {showControls && (
          <div className="number-input-controls">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleIncrement}
              disabled={disabled || (max !== undefined && parseFloat(inputValue) >= max)}
              className="number-input-increment"
            >
              <i className="fas fa-chevron-up"></i>
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleDecrement}
              disabled={disabled || (min !== undefined && parseFloat(inputValue) <= min)}
              className="number-input-decrement"
            >
              <i className="fas fa-chevron-down"></i>
            </Button>
          </div>
        )}
      </InputGroup>
      
      {!isValid && (
        <Form.Control.Feedback type="invalid">
          Please enter a valid number{min !== undefined && ` (min: ${min})`}{max !== undefined && ` (max: ${max})`}
        </Form.Control.Feedback>
      )}
    </div>
  );
};

export default NumberInput;
