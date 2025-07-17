// Screen reader announcements
export const announceToScreenReader = (message) => {
  const announcement = document.getElementById('sr-announcement');
  if (announcement) {
    announcement.textContent = message;
  }
};

// Keyboard navigation
export const setupKeyboardNavigation = (canvasRef) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', 'Design canvas');

  canvas.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'Tab':
        // Navigate between elements
        break;
      case 'Enter':
      case ' ':
        // Select element
        break;
      case 'Escape':
        // Clear selection
        break;
      case 'Delete':
        // Delete selected elements
        break;
      default:
        break;
    }
  });
};

// High contrast mode
export const applyHighContrastMode = (enabled) => {
  const root = document.documentElement;
  
  if (enabled) {
    root.classList.add('high-contrast');
    root.style.setProperty('--primary-color', '#000000');
    root.style.setProperty('--secondary-color', '#ffffff');
    root.style.setProperty('--accent-color', '#0066cc');
  } else {
    root.classList.remove('high-contrast');
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--secondary-color');
    root.style.removeProperty('--accent-color');
  }
};

// Focus management
export const manageFocus = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// Alternative text for images
export const generateAltText = (element) => {
  switch (element.type) {
    case 'text':
      return `Text element: ${element.text}`;
    case 'image':
      return `Image element: ${element.alt || 'No description'}`;
    case 'barcode':
      return `Barcode element: ${element.value}`;
    case 'qrcode':
      return `QR code element: ${element.value}`;
    case 'table':
      return `Table element with ${element.rows?.length || 0} rows`;
    default:
      return `${element.type} element`;
  }
};
