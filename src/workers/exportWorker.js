// Web Worker for handling heavy export operations
import { expose } from 'comlink';

class ExportWorker {
  constructor() {
    this.isProcessing = false;
  }

  async processPages(pages, settings, progressCallback) {
    this.isProcessing = true;
    const results = [];
    
    try {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const progress = Math.round((i / pages.length) * 100);
        
        if (progressCallback) {
          progressCallback(progress);
        }
        
        const processedPage = await this.processPage(page, settings);
        results.push(processedPage);
      }
      
      if (progressCallback) {
        progressCallback(100);
      }
      
      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      this.isProcessing = false;
    }
  }

  async processPage(page, settings) {
    return new Promise((resolve) => {
      // Simulate heavy processing
      setTimeout(() => {
        const processedElements = page.elements.map(element => {
          return this.processElement(element, settings);
        });
        
        resolve({
          ...page,
          elements: processedElements,
          processed: true,
          timestamp: Date.now()
        });
      }, 100);
    });
  }

  processElement(element, settings) {
    // Process element based on type and settings
    switch (element.type) {
      case 'text':
        return this.processTextElement(element, settings);
      case 'image':
        return this.processImageElement(element, settings);
      case 'barcode':
        return this.processBarcodeElement(element, settings);
      case 'qrcode':
        return this.processQRCodeElement(element, settings);
      default:
        return element;
    }
  }

  processTextElement(element, settings) {
    // Apply text processing based on settings
    let processedText = element.text;
    
    if (settings.replaceVariables) {
      processedText = this.replaceVariables(processedText, settings.sampleData);
    }
    
    if (settings.colorMode === 'grayscale') {
      // Convert color to grayscale
      const grayValue = this.colorToGrayscale(element.fill);
      return { ...element, fill: grayValue, text: processedText };
    }
    
    return { ...element, text: processedText };
  }

  processImageElement(element, settings) {
    // Process image based on settings
    if (settings.colorMode === 'grayscale') {
      // Would apply grayscale filter
      return { ...element, filters: { ...element.filters, grayscale: 100 } };
    }
    
    return element;
  }

  processBarcodeElement(element, settings) {
    // Process barcode
    let processedValue = element.value;
    
    if (settings.replaceVariables) {
      processedValue = this.replaceVariables(processedValue, settings.sampleData);
    }
    
    return { ...element, value: processedValue };
  }

  processQRCodeElement(element, settings) {
    // Process QR code
    let processedValue = element.value;
    
    if (settings.replaceVariables) {
      processedValue = this.replaceVariables(processedValue, settings.sampleData);
    }
    
    return { ...element, value: processedValue };
  }

  replaceVariables(text, data) {
    if (!text || typeof text !== 'string') return text;
    
    return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      const value = data[key.trim()];
      return value !== undefined ? value : match;
    });
  }

  colorToGrayscale(color) {
    // Convert hex color to grayscale
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      return `#${gray.toString(16).padStart(2, '0').repeat(3)}`;
    }
    
    return color;
  }

  optimizeForPrint(pages, settings) {
    return pages.map(page => ({
      ...page,
      elements: page.elements.map(element => {
        if (element.type === 'text') {
          return {
            ...element,
            fontSize: Math.max(element.fontSize, 8), // Minimum font size for print
            fontFamily: element.fontFamily || 'Arial' // Fallback font
          };
        }
        return element;
      })
    }));
  }

  generatePrintMarks(page, settings) {
    const marks = [];
    
    if (settings.includeBleed) {
      // Add bleed marks
      marks.push({
        type: 'line',
        x: -10,
        y: 0,
        points: [0, 0, 5, 0],
        stroke: '#000000',
        strokeWidth: 1
      });
    }
    
    if (settings.includeCropMarks) {
      // Add crop marks
      marks.push({
        type: 'line',
        x: 0,
        y: -10,
        points: [0, 0, 0, 5],
        stroke: '#000000',
        strokeWidth: 1
      });
    }
    
    return marks;
  }

  batchProcess(batches, settings, progressCallback) {
    return new Promise(async (resolve) => {
      const results = [];
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const progress = Math.round((i / batches.length) * 100);
        
        if (progressCallback) {
          progressCallback(progress);
        }
        
        const batchResult = await this.processPages(batch.pages, settings);
        results.push({ ...batch, result: batchResult });
      }
      
      if (progressCallback) {
        progressCallback(100);
      }
      
      resolve(results);
    });
  }
}

expose(ExportWorker);
