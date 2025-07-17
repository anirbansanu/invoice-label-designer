export const importUtils = {
  // Validate import data structure
  validateImportData: (data) => {
    if (!data || typeof data !== 'object') return false;
    
    // Check for required fields
    if (!data.pages || !Array.isArray(data.pages)) return false;
    
    // Validate pages
    for (const page of data.pages) {
      if (!page.elements || !Array.isArray(page.elements)) return false;
      if (!page.size || typeof page.size !== 'object') return false;
      if (typeof page.size.width !== 'number' || typeof page.size.height !== 'number') return false;
    }
    
    return true;
  },

  // Process import data
  processImportData: async (data, progressCallback) => {
    if (progressCallback) progressCallback(0);
    
    // Validate data
    if (!importUtils.validateImportData(data)) {
      throw new Error('Invalid import data format');
    }
    
    if (progressCallback) progressCallback(25);
    
    // Process pages
    const processedPages = await Promise.all(
      data.pages.map(async (page, index) => {
        const processedElements = await importUtils.processElements(page.elements);
        
        if (progressCallback) {
          progressCallback(25 + (index / data.pages.length) * 50);
        }
        
        return {
          ...page,
          elements: processedElements,
          id: page.id || `page_${Date.now()}_${index}`
        };
      })
    );
    
    if (progressCallback) progressCallback(75);
    
    // Process metadata
    const processedData = {
      pages: processedPages,
      metadata: {
        ...data.metadata,
        importDate: new Date().toISOString(),
        originalVersion: data.metadata?.version || 'unknown'
      },
      sampleData: data.sampleData || {},
      templates: data.templates || []
    };
    
    if (progressCallback) progressCallback(100);
    
    return processedData;
  },

  // Process elements
  processElements: async (elements) => {
    return Promise.all(
      elements.map(async (element) => {
        // Generate new ID to avoid conflicts
        const processedElement = {
          ...element,
          id: importUtils.generateId()
        };
        
        // Process element-specific data
        switch (element.type) {
          case 'image':
            return importUtils.processImageElement(processedElement);
          case 'barcode':
            return importUtils.processBarcodeElement(processedElement);
          case 'qrcode':
            return importUtils.processQRCodeElement(processedElement);
          case 'group':
            return {
              ...processedElement,
              children: await importUtils.processElements(element.children || [])
            };
          default:
            return processedElement;
        }
      })
    );
  },

  // Process image element
  processImageElement: async (element) => {
    // Validate image source
    if (!element.src) {
      throw new Error('Image element missing source');
    }
    
    // Check if image is accessible
    try {
      await importUtils.validateImageSource(element.src);
    } catch (error) {
      console.warn('Image source not accessible:', element.src);
      // You might want to provide a placeholder or ask user to re-upload
    }
    
    return element;
  },

  // Process barcode element
  processBarcodeElement: (element) => {
    // Validate barcode format
    const validFormats = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC'];
    if (!validFormats.includes(element.format)) {
      element.format = 'CODE128'; // Default fallback
    }
    
    return element;
  },

  // Process QR code element
  processQRCodeElement: (element) => {
    // Ensure minimum size
    if (element.size < 20) {
      element.size = 100;
    }
    
    return element;
  },

  // Validate image source
  validateImageSource: (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
  },

  // Generate element ID
  generateId: () => {
    return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Migrate old format to new format
  migrateData: (data) => {
    // Handle version migration
    const version = data.metadata?.version || '1.0';
    
    if (version === '1.0') {
      // Migrate from v1.0 to current version
      return importUtils.migrateFromV1(data);
    }
    
    return data;
  },

  // Migrate from version 1.0
  migrateFromV1: (data) => {
    // Example migration logic
    const migratedPages = data.pages.map(page => ({
      ...page,
      elements: page.elements.map(element => ({
        ...element,
        // Add any new required fields
        visible: element.visible !== false,
        locked: element.locked || false,
        opacity: element.opacity || 1
      }))
    }));
    
    return {
      ...data,
      pages: migratedPages,
      metadata: {
        ...data.metadata,
        version: '2.0',
        migratedFrom: '1.0'
      }
    };
  }
};
