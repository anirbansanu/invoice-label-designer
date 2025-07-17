import { expose } from 'comlink';

class ImageProcessor {
  constructor() {
    this.canvas = new OffscreenCanvas(1, 1);
    this.ctx = this.canvas.getContext('2d');
  }

  async processImage(imageData, operations) {
    try {
      const { width, height, data } = imageData;
      this.canvas.width = width;
      this.canvas.height = height;
      
      const imageDataObj = new ImageData(data, width, height);
      this.ctx.putImageData(imageDataObj, 0, 0);
      
      // Apply operations
      for (const operation of operations) {
        await this.applyOperation(operation);
      }
      
      const processedImageData = this.ctx.getImageData(0, 0, width, height);
      return {
        width,
        height,
        data: processedImageData.data
      };
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  async applyOperation(operation) {
    switch (operation.type) {
      case 'brightness':
        this.adjustBrightness(operation.value);
        break;
      case 'contrast':
        this.adjustContrast(operation.value);
        break;
      case 'saturation':
        this.adjustSaturation(operation.value);
        break;
      case 'blur':
        this.applyBlur(operation.value);
        break;
      case 'sharpen':
        this.applySharpen(operation.value);
        break;
      case 'grayscale':
        this.applyGrayscale();
        break;
      case 'sepia':
        this.applySepia();
        break;
      case 'invert':
        this.applyInvert();
        break;
      case 'crop':
        this.applyCrop(operation.x, operation.y, operation.width, operation.height);
        break;
      case 'resize':
        this.applyResize(operation.width, operation.height);
        break;
      case 'rotate':
        this.applyRotate(operation.angle);
        break;
      default:
        console.warn(`Unknown operation: ${operation.type}`);
    }
  }

  adjustBrightness(value) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] + value));     // Red
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + value)); // Green
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + value)); // Blue
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  adjustContrast(value) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const factor = (259 * (value + 255)) / (255 * (259 - value));
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  adjustSaturation(value) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      data[i] = Math.max(0, Math.min(255, gray + value * (data[i] - gray)));
      data[i + 1] = Math.max(0, Math.min(255, gray + value * (data[i + 1] - gray)));
      data[i + 2] = Math.max(0, Math.min(255, gray + value * (data[i + 2] - gray)));
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  applyGrayscale() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  applySepia() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
      data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
      data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  applyInvert() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  applyCrop(x, y, width, height) {
    const imageData = this.ctx.getImageData(x, y, width, height);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.putImageData(imageData, 0, 0);
  }

  applyResize(width, height) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.putImageData(imageData, 0, 0);
  }

  applyRotate(angle) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const { width, height } = this.canvas;
    
    this.ctx.save();
    this.ctx.translate(width / 2, height / 2);
    this.ctx.rotate(angle * Math.PI / 180);
    this.ctx.translate(-width / 2, -height / 2);
    this.ctx.putImageData(imageData, 0, 0);
    this.ctx.restore();
  }

  async generateThumbnail(imageData, size = 150) {
    const { width, height } = imageData;
    const scale = Math.min(size / width, size / height);
    const newWidth = Math.round(width * scale);
    const newHeight = Math.round(height * scale);
    
    await this.applyResize(newWidth, newHeight);
    
    return this.ctx.getImageData(0, 0, newWidth, newHeight);
  }

  async optimizeForWeb(imageData, quality = 0.8) {
    // Apply web optimization techniques
    const operations = [
      { type: 'resize', width: Math.min(imageData.width, 1920), height: Math.min(imageData.height, 1080) },
      { type: 'sharpen', value: 0.5 }
    ];
    
    return this.processImage(imageData, operations);
  }

  async optimizeForPrint(imageData, dpi = 300) {
    // Apply print optimization techniques
    const operations = [
      { type: 'sharpen', value: 1.0 },
      { type: 'contrast', value: 10 }
    ];
    
    return this.processImage(imageData, operations);
  }
}

expose(ImageProcessor);
