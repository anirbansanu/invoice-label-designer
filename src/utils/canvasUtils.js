export const canvasUtils = {
  // Convert canvas coordinates to screen coordinates
  canvasToScreen: (canvasX, canvasY, zoom, panOffset) => {
    return {
      x: canvasX * zoom + panOffset.x,
      y: canvasY * zoom + panOffset.y
    };
  },

  // Convert screen coordinates to canvas coordinates
  screenToCanvas: (screenX, screenY, zoom, panOffset) => {
    return {
      x: (screenX - panOffset.x) / zoom,
      y: (screenY - panOffset.y) / zoom
    };
  },

  // Calculate element bounds
  getElementBounds: (element) => {
    return {
      x: element.x,
      y: element.y,
      width: element.width || 0,
      height: element.height || 0,
      right: element.x + (element.width || 0),
      bottom: element.y + (element.height || 0)
    };
  },

  // Check if two elements intersect
  elementsIntersect: (element1, element2) => {
    const bounds1 = canvasUtils.getElementBounds(element1);
    const bounds2 = canvasUtils.getElementBounds(element2);

    return !(
      bounds1.right < bounds2.x ||
      bounds1.x > bounds2.right ||
      bounds1.bottom < bounds2.y ||
      bounds1.y > bounds2.bottom
    );
  },

  // Get elements within a selection area
  getElementsInArea: (elements, area) => {
    return elements.filter(element => {
      const bounds = canvasUtils.getElementBounds(element);
      return (
        bounds.x >= area.x &&
        bounds.y >= area.y &&
        bounds.right <= area.x + area.width &&
        bounds.bottom <= area.y + area.height
      );
    });
  },

  // Calculate group bounds
  getGroupBounds: (elements) => {
    if (elements.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

    const bounds = elements.reduce((acc, element) => {
      const elementBounds = canvasUtils.getElementBounds(element);
      return {
        minX: Math.min(acc.minX, elementBounds.x),
        minY: Math.min(acc.minY, elementBounds.y),
        maxX: Math.max(acc.maxX, elementBounds.right),
        maxY: Math.max(acc.maxY, elementBounds.bottom)
      };
    }, {
      minX: elements[0].x,
      minY: elements[0].y,
      maxX: elements[0].x + (elements[0].width || 0),
      maxY: elements[0].y + (elements[0].height || 0)
    });

    return {
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY
    };
  },

  // Align elements
  alignElements: (elements, alignment) => {
    if (elements.length < 2) return elements;

    const bounds = canvasUtils.getGroupBounds(elements);
    
    return elements.map(element => {
      const elementBounds = canvasUtils.getElementBounds(element);
      let newX = element.x;
      let newY = element.y;

      switch (alignment) {
        case 'left':
          newX = bounds.x;
          break;
        case 'right':
          newX = bounds.x + bounds.width - elementBounds.width;
          break;
        case 'center':
          newX = bounds.x + (bounds.width - elementBounds.width) / 2;
          break;
        case 'top':
          newY = bounds.y;
          break;
        case 'bottom':
          newY = bounds.y + bounds.height - elementBounds.height;
          break;
        case 'middle':
          newY = bounds.y + (bounds.height - elementBounds.height) / 2;
          break;
      }

      return { ...element, x: newX, y: newY };
    });
  },

  // Distribute elements
  distributeElements: (elements, distribution) => {
    if (elements.length < 3) return elements;

    const sortedElements = [...elements].sort((a, b) => {
      return distribution === 'horizontal' ? a.x - b.x : a.y - b.y;
    });

    const bounds = canvasUtils.getGroupBounds(sortedElements);
    const totalSpace = distribution === 'horizontal' ? bounds.width : bounds.height;
    const elementSpace = sortedElements.reduce((acc, element) => {
      return acc + (distribution === 'horizontal' ? element.width : element.height);
    }, 0);
    
    const gap = (totalSpace - elementSpace) / (sortedElements.length - 1);
    
    let currentPosition = distribution === 'horizontal' ? bounds.x : bounds.y;
    
    return sortedElements.map(element => {
      const newElement = { ...element };
      
      if (distribution === 'horizontal') {
        newElement.x = currentPosition;
        currentPosition += element.width + gap;
      } else {
        newElement.y = currentPosition;
        currentPosition += element.height + gap;
      }
      
      return newElement;
    });
  },

  // Generate element ID
  generateId: () => {
    return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Calculate zoom to fit
  calculateZoomToFit: (elements, canvasSize) => {
    if (elements.length === 0) return 1;

    const bounds = canvasUtils.getGroupBounds(elements);
    const padding = 50;
    
    const zoomX = (canvasSize.width - padding * 2) / bounds.width;
    const zoomY = (canvasSize.height - padding * 2) / bounds.height;
    
    return Math.min(zoomX, zoomY, 1);
  }
};
