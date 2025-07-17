import { debounce, throttle } from 'lodash';

class PerformanceOptimizer {
  constructor() {
    this.renderCache = new Map();
    this.visibilityCache = new Map();
    this.lastRenderTime = 0;
    this.renderThreshold = 16; // 60fps
  }

  // Optimize state updates
  optimizeState = debounce((state) => {
    // Remove unnecessary re-renders
    const optimizedState = { ...state };
    
    // Clean up unused cached data
    this.cleanupCaches();
    
    return optimizedState;
  }, 100);

  // Check if element is visible in viewport
  isElementVisible(element, viewport) {
    const cacheKey = `${element.id}-${viewport.x}-${viewport.y}-${viewport.width}-${viewport.height}`;
    
    if (this.visibilityCache.has(cacheKey)) {
      return this.visibilityCache.get(cacheKey);
    }
    
    const elementBounds = {
      x: element.x,
      y: element.y,
      width: element.width || 0,
      height: element.height || 0
    };
    
    const visible = !(
      elementBounds.x + elementBounds.width < viewport.x ||
      elementBounds.x > viewport.x + viewport.width ||
      elementBounds.y + elementBounds.height < viewport.y ||
      elementBounds.y > viewport.y + viewport.height
    );
    
    this.visibilityCache.set(cacheKey, visible);
    return visible;
  }

  // Throttled render function
  throttledRender = throttle((renderFunction) => {
    const now = performance.now();
    if (now - this.lastRenderTime >= this.renderThreshold) {
      renderFunction();
      this.lastRenderTime = now;
    }
  }, 16);

  // Optimize large element lists
  optimizeElementList(elements, viewport) {
    // Use virtual scrolling for large lists
    if (elements.length > 1000) {
      return this.virtualizeElements(elements, viewport);
    }
    
    // Filter visible elements
    return elements.filter(element => this.isElementVisible(element, viewport));
  }

  // Virtual scrolling implementation
  virtualizeElements(elements, viewport) {
    const startIndex = Math.floor(viewport.y / 100); // Assuming 100px item height
    const endIndex = Math.min(
      startIndex + Math.ceil(viewport.height / 100) + 5, // +5 for buffer
      elements.length
    );
    
    return elements.slice(startIndex, endIndex);
  }

  // Memory management
  cleanupCaches() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    for (const [key, value] of this.renderCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.renderCache.delete(key);
      }
    }
    
    for (const [key, value] of this.visibilityCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.visibilityCache.delete(key);
      }
    }
  }

  // Optimize images
  optimizeImage(imageElement, canvasSize) {
    const maxWidth = canvasSize.width;
    const maxHeight = canvasSize.height;
    
    // Calculate optimal size
    let { width, height } = imageElement;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }
    
    return { width, height };
  }

  // Batch updates
  batchUpdates(updates) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        updates.forEach(update => update());
        resolve();
      });
    });
  }

  // Lazy loading for images
  lazyLoadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}

export const performanceOptimizer = new PerformanceOptimizer();
