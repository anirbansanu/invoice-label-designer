import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

const IconButton = ({
  icon,
  onClick,
  variant = 'outline-secondary',
  size = 'sm',
  disabled = false,
  tooltip,
  active = false,
  children,
  className = '',
  ...props
}) => {
  const buttonContent = (
    <Button
      variant={active ? variant.replace('outline-', '') : variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={`icon-button ${className} ${active ? 'active' : ''}`}
      {...props}
    >
      {icon && <i className={`fas fa-${icon} ${children ? 'me-1' : ''}`}></i>}
      {children}
    </Button>
  );

  if (tooltip) {
    return (
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip>{tooltip}</Tooltip>}
        delay={{ show: 500, hide: 100 }}
      >
        {buttonContent}
      </OverlayTrigger>
    );
  }

  return buttonContent;
};

export default IconButton;
