export const defaultTemplates = [
  {
    id: 'invoice-modern',
    name: 'Modern Invoice',
    category: 'invoice',
    description: 'Clean, modern invoice template with professional styling',
    tags: ['business', 'professional', 'modern'],
    elements: [
      // Company header
      {
        type: 'text',
        x: 50,
        y: 50,
        width: 300,
        height: 40,
        text: '{{company.name}}',
        fontSize: 28,
        fontFamily: 'Arial',
        fill: '#2c3e50',
        align: 'left'
      },
      {
        type: 'text',
        x: 50,
        y: 90,
        width: 300,
        height: 60,
        text: '{{company.address}}\n{{company.phone}}\n{{company.email}}',
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#7f8c8d',
        align: 'left'
      },
      
      // Invoice title and number
      {
        type: 'text',
        x: 400,
        y: 50,
        width: 300,
        height: 40,
        text: 'INVOICE',
        fontSize: 36,
        fontFamily: 'Arial',
        fill: '#e74c3c',
        align: 'right'
      },
      {
        type: 'text',
        x: 400,
        y: 100,
        width: 300,
        height: 30,
        text: '{{invoice.number}}',
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#2c3e50',
        align: 'right'
      },
      
      // Bill to section
      {
        type: 'text',
        x: 50,
        y: 180,
        width: 100,
        height: 25,
        text: 'Bill To:',
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#34495e',
        align: 'left'
      },
      {
        type: 'text',
        x: 50,
        y: 205,
        width: 300,
        height: 80,
        text: '{{customer.name}}\n{{customer.address}}\n{{customer.email}}\n{{customer.phone}}',
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#2c3e50',
        align: 'left'
      },
      
      // Invoice details
      {
        type: 'text',
        x: 400,
        y: 180,
        width: 300,
        height: 80,
        text: 'Date: {{invoice.date}}\nDue Date: {{invoice.dueDate}}\nTerms: {{invoice.terms}}',
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#2c3e50',
        align: 'right'
      },
      
      // Items table
      {
        type: 'table',
        x: 50,
        y: 320,
        width: 650,
        height: 200,
        columns: [
          { header: 'Description', width: 300 },
          { header: 'Quantity', width: 100 },
          { header: 'Rate', width: 125 },
          { header: 'Amount', width: 125 }
        ],
        rows: [
          ['{{product.name}}', '{{product.quantity}}', '{{product.price}}', '{{product.total}}'],
          ['Web Design Services', '40 hrs', '$75.00', '$3,000.00'],
          ['Hosting Setup', '1', '$200.00', '$200.00']
        ]
      },
      
      // Total section
      {
        type: 'text',
        x: 400,
        y: 550,
        width: 300,
        height: 100,
        text: 'Subtotal: {{invoice.subtotal}}\nTax ({{invoice.taxRate}}): {{invoice.tax}}\n\nTotal: {{invoice.total}}',
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#2c3e50',
        align: 'right'
      },
      
      // Footer
      {
        type: 'text',
        x: 50,
        y: 700,
        width: 650,
        height: 50,
        text: 'Thank you for your business!\n{{invoice.notes}}',
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#7f8c8d',
        align: 'center'
      }
    ],
    pageSize: { width: 794, height: 1123 },
    background: '#ffffff'
  },
  
  {
    id: 'shipping-label-standard',
    name: 'Standard Shipping Label',
    category: 'label',
    description: 'Standard shipping label with sender, recipient, and tracking',
    tags: ['shipping', 'logistics', 'standard'],
    elements: [
      // From section
      {
        type: 'text',
        x: 20,
        y: 20,
        width: 60,
        height: 20,
        text: 'FROM:',
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#000000',
        align: 'left'
      },
      {
        type: 'text',
        x: 20,
        y: 40,
        width: 200,
        height: 80,
        text: '{{company.name}}\n{{company.address}}\n{{company.phone}}',
        fontSize: 10,
        fontFamily: 'Arial',
        fill: '#000000',
        align: 'left'
      },
      
      // To section
      {
        type: 'text',
        x: 20,
        y: 140,
        width: 40,
        height: 20,
        text: 'TO:',
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#000000',
        align: 'left'
      },
      {
        type: 'text',
        x: 20,
        y: 160,
        width: 200,
        height: 100,
        text: '{{customer.name}}\n{{customer.address}}\n{{customer.phone}}',
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#000000',
        align: 'left'
      },
      
      // Tracking barcode
      {
        type: 'barcode',
        x: 20,
        y: 280,
        width: 200,
        height: 50,
        value: '{{shipping.tracking}}',
        format: 'CODE128'
      },
      
      // Tracking number
      {
        type: 'text',
        x: 20,
        y: 340,
        width: 200,
        height: 20,
        text: '{{shipping.tracking}}',
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#000000',
        align: 'center'
      },
      
      // Service info
      {
        type: 'text',
        x: 20,
        y: 380,
        width: 200,
        height: 40,
        text: 'Service: {{shipping.service}}\nWeight: {{shipping.weight}}',
        fontSize: 10,
        fontFamily: 'Arial',
        fill: '#000000',
        align: 'left'
      }
    ],
    pageSize: { width: 288, height: 432 },
    background: '#ffffff'
  }
];
