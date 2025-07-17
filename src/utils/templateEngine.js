import { sampleInvoiceData, sampleLabelData } from '../data/sampleData';

class TemplateEngine {
  constructor() {
    this.templates = [];
  }

  async loadDefaultTemplates() {
    return [
      {
        id: 'invoice-basic',
        name: 'Basic Invoice',
        description: 'Simple invoice template with header, items table, and totals',
        category: 'invoice',
        tags: ['business', 'formal', 'simple'],
        elements: [
          {
            type: 'text',
            x: 50,
            y: 50,
            text: '{{company.name}}',
            fontSize: 24,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'left'
          },
          {
            type: 'text',
            x: 50,
            y: 80,
            text: '{{company.address}}',
            fontSize: 12,
            fontFamily: 'Arial',
            fill: '#666666',
            align: 'left'
          },
          {
            type: 'text',
            x: 450,
            y: 50,
            text: 'INVOICE',
            fontSize: 32,
            fontFamily: 'Arial',
            fill: '#0066cc',
            align: 'right'
          },
          {
            type: 'text',
            x: 450,
            y: 90,
            text: '{{invoice.number}}',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'right'
          },
          {
            type: 'text',
            x: 50,
            y: 150,
            text: 'Bill To:',
            fontSize: 14,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'left'
          },
          {
            type: 'text',
            x: 50,
            y: 170,
            text: '{{customer.name}}',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'left'
          },
          {
            type: 'text',
            x: 50,
            y: 190,
            text: '{{customer.address}}',
            fontSize: 12,
            fontFamily: 'Arial',
            fill: '#666666',
            align: 'left'
          },
          {
            type: 'table',
            x: 50,
            y: 250,
            width: 450,
            height: 200,
            columns: [
              { header: 'Description', width: 250 },
              { header: 'Quantity', width: 100 },
              { header: 'Rate', width: 100 },
              { header: 'Amount', width: 100 }
            ],
            rows: [
              ['{{product.name}}', '{{product.quantity}}', '{{product.price}}', '{{product.total}}']
            ]
          },
          {
            type: 'text',
            x: 350,
            y: 500,
            text: 'Total: {{invoice.total}}',
            fontSize: 18,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'right'
          }
        ],
        pageSize: { width: 794, height: 1123 },
        background: '#ffffff',
        preview: this.generateTemplatePreview('invoice-basic'),
        created: new Date().toISOString(),
        author: 'System'
      },
      {
        id: 'label-product',
        name: 'Product Label',
        description: 'Standard product label with barcode and QR code',
        category: 'label',
        tags: ['product', 'barcode', 'retail'],
        elements: [
          {
            type: 'text',
            x: 20,
            y: 20,
            text: '{{product.name}}',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'left'
          },
          {
            type: 'text',
            x: 20,
            y: 45,
            text: 'SKU: {{product.sku}}',
            fontSize: 12,
            fontFamily: 'Arial',
            fill: '#666666',
            align: 'left'
          },
          {
            type: 'text',
            x: 20,
            y: 65,
            text: '{{product.price}}',
            fontSize: 20,
            fontFamily: 'Arial',
            fill: '#0066cc',
            align: 'left'
          },
          {
            type: 'barcode',
            x: 20,
            y: 90,
            width: 200,
            height: 50,
            value: '{{product.barcode}}',
            format: 'CODE128'
          },
          {
            type: 'qrcode',
            x: 240,
            y: 20,
            size: 80,
            value: '{{product.url}}'
          }
        ],
        pageSize: { width: 288, height: 432 },
        background: '#ffffff',
        preview: this.generateTemplatePreview('label-product'),
        created: new Date().toISOString(),
        author: 'System'
      },
      {
        id: 'receipt-pos',
        name: 'POS Receipt',
        description: 'Point of sale receipt template',
        category: 'receipt',
        tags: ['pos', 'receipt', 'retail'],
        elements: [
          {
            type: 'text',
            x: 140,
            y: 20,
            text: '{{company.name}}',
            fontSize: 18,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'center'
          },
          {
            type: 'text',
            x: 140,
            y: 45,
            text: '{{company.address}}',
            fontSize: 12,
            fontFamily: 'Arial',
            fill: '#666666',
            align: 'center'
          },
          {
            type: 'text',
            x: 140,
            y: 65,
            text: 'Tel: {{company.phone}}',
            fontSize: 12,
            fontFamily: 'Arial',
            fill: '#666666',
            align: 'center'
          },
          {
            type: 'text',
            x: 20,
            y: 100,
            text: 'Receipt: {{receipt.number}}',
            fontSize: 12,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'left'
          },
          {
            type: 'text',
            x: 260,
            y: 100,
            text: '{{receipt.date}}',
            fontSize: 12,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'right'
          },
          {
            type: 'table',
            x: 20,
            y: 130,
            width: 240,
            height: 150,
            columns: [
              { header: 'Item', width: 120 },
              { header: 'Qty', width: 40 },
              { header: 'Price', width: 80 }
            ],
            rows: [
              ['{{product.name}}', '{{product.quantity}}', '{{product.price}}']
            ]
          },
          {
            type: 'text',
            x: 260,
            y: 320,
            text: 'Total: {{receipt.total}}',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'right'
          },
          {
            type: 'text',
            x: 140,
            y: 360,
            text: 'Thank you for your business!',
            fontSize: 14,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'center'
          }
        ],
        pageSize: { width: 280, height: 400 },
        background: '#ffffff',
        preview: this.generateTemplatePreview('receipt-pos'),
        created: new Date().toISOString(),
        author: 'System'
      },
      {
        id: 'badge-name',
        name: 'Name Badge',
        description: 'Event name badge with company logo space',
        category: 'badge',
        tags: ['event', 'conference', 'name'],
        elements: [
          {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 300,
            height: 200,
            fill: '#ffffff',
            stroke: '#0066cc',
            strokeWidth: 2
          },
          {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 300,
            height: 40,
            fill: '#0066cc',
            stroke: 'none'
          },
          {
            type: 'text',
            x: 150,
            y: 25,
            text: '{{event.name}}',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center'
          },
          {
            type: 'text',
            x: 150,
            y: 80,
            text: '{{attendee.name}}',
            fontSize: 24,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'center'
          },
          {
            type: 'text',
            x: 150,
            y: 110,
            text: '{{attendee.title}}',
            fontSize: 14,
            fontFamily: 'Arial',
            fill: '#666666',
            align: 'center'
          },
          {
            type: 'text',
            x: 150,
            y: 130,
            text: '{{attendee.company}}',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: '#0066cc',
            align: 'center'
          },
          {
            type: 'qrcode',
            x: 220,
            y: 150,
            size: 40,
            value: '{{attendee.id}}'
          }
        ],
        pageSize: { width: 300, height: 200 },
        background: '#ffffff',
        preview: this.generateTemplatePreview('badge-name'),
        created: new Date().toISOString(),
        author: 'System'
      }
    ];
  }

  generateTemplatePreview(templateId) {
    // Generate a base64 preview image for the template
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add border
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Add template-specific preview content
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(templateId.replace('-', ' ').toUpperCase(), canvas.width / 2, 30);
    
    // Add some placeholder content
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(20, 50, canvas.width - 40, 20);
    ctx.fillRect(20, 80, canvas.width - 40, 20);
    ctx.fillRect(20, 110, canvas.width - 40, 40);
    
    return canvas.toDataURL();
  }

  generatePreview(page) {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    
    // Scale factor
    const scaleX = canvas.width / page.size.width;
    const scaleY = canvas.height / page.size.height;
    const scale = Math.min(scaleX, scaleY);
    
    // Fill background
    ctx.fillStyle = page.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Render elements (simplified)
    page.elements.forEach(element => {
      ctx.save();
      ctx.scale(scale, scale);
      
      switch (element.type) {
        case 'text':
          ctx.fillStyle = element.fill;
          ctx.font = `${element.fontSize}px ${element.fontFamily}`;
          ctx.textAlign = element.align;
          ctx.fillText(element.text?.substring(0, 20) || '', element.x, element.y + element.fontSize);
          break;
        case 'rectangle':
          ctx.fillStyle = element.fill;
          ctx.fillRect(element.x, element.y, element.width, element.height);
          if (element.stroke) {
            ctx.strokeStyle = element.stroke;
            ctx.lineWidth = element.strokeWidth;
            ctx.strokeRect(element.x, element.y, element.width, element.height);
          }
          break;
        case 'circle':
          const radius = element.radius || Math.min(element.width, element.height) / 2;
          ctx.beginPath();
          ctx.arc(element.x + radius, element.y + radius, radius, 0, 2 * Math.PI);
          ctx.fillStyle = element.fill;
          ctx.fill();
          break;
        default:
          // Simple placeholder for other elements
          ctx.fillStyle = '#cccccc';
          ctx.fillRect(element.x, element.y, element.width || 50, element.height || 20);
      }
      
      ctx.restore();
    });
    
    return canvas.toDataURL();
  }

  applyTemplate(template, targetPage) {
    return {
      ...targetPage,
      elements: template.elements.map(element => ({
        ...element,
        id: `${element.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })),
      background: template.background,
      size: template.pageSize
    };
  }

  validateTemplate(template) {
    const requiredFields = ['id', 'name', 'elements', 'pageSize'];
    return requiredFields.every(field => template.hasOwnProperty(field));
  }
}

export const templateEngine = new TemplateEngine();
