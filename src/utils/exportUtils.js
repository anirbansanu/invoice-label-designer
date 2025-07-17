import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

class ExportUtils {
  async exportDesign(exportData, progressCallback) {
    const { pages, settings, sampleData, labelGrid } = exportData;
    
    try {
      progressCallback(10);
      
      switch (settings.format) {
        case 'pdf':
          return await this.exportToPDF(pages, settings, labelGrid, progressCallback);
        case 'png':
          return await this.exportToPNG(pages, settings, progressCallback);
        case 'jpg':
          return await this.exportToJPG(pages, settings, progressCallback);
        case 'svg':
          return await this.exportToSVG(pages, settings, progressCallback);
        case 'zip':
          return await this.exportToZIP(pages, settings, sampleData, progressCallback);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async exportToPDF(pages, settings, labelGrid, progressCallback) {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [pages[0].size.width, pages[0].size.height]
    });

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      progressCallback(20 + (i / pages.length) * 60);

      if (i > 0) {
        pdf.addPage([page.size.width, page.size.height]);
      }

      // Generate canvas for page
      const canvas = await this.generatePageCanvas(page, settings);
      const imgData = canvas.toDataURL('image/png');
      
      if (labelGrid && labelGrid.enabled) {
        await this.addLabelGridToPDF(pdf, imgData, labelGrid, page.size);
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, page.size.width, page.size.height);
      }
    }

    progressCallback(90);
    pdf.save(`${settings.filename}.pdf`);
    progressCallback(100);
    
    return { success: true };
  }

  async exportToPNG(pages, settings, progressCallback) {
    const results = [];
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      progressCallback(20 + (i / pages.length) * 70);
      
      const canvas = await this.generatePageCanvas(page, settings);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${settings.filename}${pages.length > 1 ? `_page_${i + 1}` : ''}.png`;
      link.click();
      URL.revokeObjectURL(url);
      
      results.push({ page: i + 1, success: true });
    }
    
    progressCallback(100);
    return { success: true, results };
  }

  async exportToJPG(pages, settings, progressCallback) {
    const results = [];
    const quality = this.getJPGQuality(settings.quality);
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      progressCallback(20 + (i / pages.length) * 70);
      
      const canvas = await this.generatePageCanvas(page, settings);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${settings.filename}${pages.length > 1 ? `_page_${i + 1}` : ''}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
      
      results.push({ page: i + 1, success: true });
    }
    
    progressCallback(100);
    return { success: true, results };
  }

  async exportToSVG(pages, settings, progressCallback) {
    const results = [];
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      progressCallback(20 + (i / pages.length) * 70);
      
      const svg = await this.generatePageSVG(page, settings);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${settings.filename}${pages.length > 1 ? `_page_${i + 1}` : ''}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      
      results.push({ page: i + 1, success: true });
    }
    
    progressCallback(100);
    return { success: true, results };
  }

  async exportToZIP(pages, settings, sampleData, progressCallback) {
    const zip = new JSZip();
    
    // Add design JSON
    const designData = {
      pages,
      settings,
      sampleData,
      metadata: {
        exportDate: new Date().toISOString(),
        version: '2.0.0'
      }
    };
    
    zip.file('design.json', JSON.stringify(designData, null, 2));
    progressCallback(20);
    
    // Add page images
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      progressCallback(20 + (i / pages.length) * 50);
      
      const canvas = await this.generatePageCanvas(page, settings);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      zip.file(`page_${i + 1}.png`, blob);
    }
    
    // Add preview thumbnail
    if (pages.length > 0) {
      const thumbnailCanvas = await this.generatePageCanvas(pages[0], {
        ...settings,
        scale: 0.25
      });
      const thumbnailBlob = await new Promise(resolve => 
        thumbnailCanvas.toBlob(resolve, 'image/png')
      );
      zip.file('thumbnail.png', thumbnailBlob);
    }
    
    progressCallback(80);
    
    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${settings.filename}.zip`;
    link.click();
    URL.revokeObjectURL(url);
    
    progressCallback(100);
    return { success: true };
  }

  async generatePageCanvas(page, settings) {
    const canvas = document.createElement('canvas');
    const dpi = this.getDPI(settings);
    const scale = dpi / 72;
    
    canvas.width = page.size.width * scale;
    canvas.height = page.size.height * scale;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    
    // Fill background
    ctx.fillStyle = page.background;
    ctx.fillRect(0, 0, page.size.width, page.size.height);
    
    // Render elements
    for (const element of page.elements) {
      await this.renderElementToCanvas(ctx, element, settings);
    }
    
    return canvas;
  }

  async renderElementToCanvas(ctx, element, settings) {
    ctx.save();
    ctx.translate(element.x, element.y);
    
    if (element.rotation) {
      ctx.rotate((element.rotation * Math.PI) / 180);
    }
    
    switch (element.type) {
      case 'text':
        this.renderTextElement(ctx, element);
        break;
      case 'rectangle':
        this.renderRectangleElement(ctx, element);
        break;
      case 'circle':
        this.renderCircleElement(ctx, element);
        break;
      case 'image':
        await this.renderImageElement(ctx, element);
        break;
      case 'barcode':
        await this.renderBarcodeElement(ctx, element);
        break;
      case 'qrcode':
        await this.renderQRCodeElement(ctx, element);
        break;
      // Add more element types as needed
    }
    
    ctx.restore();
  }

  renderTextElement(ctx, element) {
    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    ctx.fillStyle = element.fill;
    ctx.textAlign = element.align || 'left';
    ctx.fillText(element.text, 0, element.fontSize);
  }

  renderRectangleElement(ctx, element) {
    ctx.fillStyle = element.fill;
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;
    
    if (element.fill) {
      ctx.fillRect(0, 0, element.width, element.height);
    }
    if (element.stroke) {
      ctx.strokeRect(0, 0, element.width, element.height);
    }
  }

  renderCircleElement(ctx, element) {
    const radius = element.radius || Math.min(element.width, element.height) / 2;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    
    if (element.fill) {
      ctx.fillStyle = element.fill;
      ctx.fill();
    }
    if (element.stroke) {
      ctx.strokeStyle = element.stroke;
      ctx.lineWidth = element.strokeWidth;
      ctx.stroke();
    }
  }

  async renderImageElement(ctx, element) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, element.width, element.height);
        resolve();
      };
      img.onerror = resolve;
      img.src = element.src;
    });
  }

  async renderBarcodeElement(ctx, element) {
    // Implementation for barcode rendering
    // This would integrate with the barcode library
    const canvas = document.createElement('canvas');
    // Generate barcode on canvas
    ctx.drawImage(canvas, 0, 0, element.width, element.height);
  }

  async renderQRCodeElement(ctx, element) {
    // Implementation for QR code rendering
    // This would integrate with the QR code library
    const canvas = document.createElement('canvas');
    // Generate QR code on canvas
    ctx.drawImage(canvas, 0, 0, element.size, element.size);
  }

  async addLabelGridToPDF(pdf, imgData, labelGrid, pageSize) {
    const { rows, columns, rowGap, columnGap, margins } = labelGrid;
    const labelWidth = (pageSize.width - margins.left - margins.right - (columnGap * (columns - 1))) / columns;
    const labelHeight = (pageSize.height - margins.top - margins.bottom - (rowGap * (rows - 1))) / rows;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const x = margins.left + col * (labelWidth + columnGap);
        const y = margins.top + row * (labelHeight + rowGap);
        
        pdf.addImage(imgData, 'PNG', x, y, labelWidth, labelHeight);
      }
    }
  }

  generatePageSVG(page, settings) {
    let svg = `<svg width="${page.size.width}" height="${page.size.height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Add background
    svg += `<rect width="100%" height="100%" fill="${page.background}"/>`;
    
    // Add elements
    for (const element of page.elements) {
      svg += this.elementToSVG(element);
    }
    
    svg += '</svg>';
    return svg;
  }

  elementToSVG(element) {
    switch (element.type) {
      case 'text':
        return `<text x="${element.x}" y="${element.y + element.fontSize}" 
                font-family="${element.fontFamily}" font-size="${element.fontSize}" 
                fill="${element.fill}" text-anchor="${element.align}">${element.text}</text>`;
      case 'rectangle':
        return `<rect x="${element.x}" y="${element.y}" width="${element.width}" 
                height="${element.height}" fill="${element.fill}" stroke="${element.stroke}" 
                stroke-width="${element.strokeWidth}"/>`;
      case 'circle':
        const radius = element.radius || Math.min(element.width, element.height) / 2;
        return `<circle cx="${element.x + radius}" cy="${element.y + radius}" r="${radius}" 
                fill="${element.fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}"/>`;
      default:
        return '';
    }
  }

  getDPI(settings) {
    if (settings.quality === 'custom') {
      return settings.dpi;
    }
    
    const dpiMap = {
      print: 300,
      high: 300,
      screen: 72,
      medium: 150,
      low: 72
    };
    
    return dpiMap[settings.quality] || 300;
  }

  getJPGQuality(quality) {
    const qualityMap = {
      high: 0.9,
      medium: 0.7,
      low: 0.5
    };
    
    return qualityMap[quality] || 0.8;
  }
}

export const exportUtils = new ExportUtils();
