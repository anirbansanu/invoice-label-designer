export const defaultShapes = {
  rectangle: {
    type: 'rectangle',
    width: 100,
    height: 100,
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 1,
    cornerRadius: 0
  },
  
  circle: {
    type: 'circle',
    radius: 50,
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 1
  },
  
  line: {
    type: 'line',
    points: [0, 0, 100, 0],
    stroke: '#000000',
    strokeWidth: 2,
    lineCap: 'round'
  },
  
  polygon: {
    type: 'polygon',
    sides: 6,
    radius: 50,
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 1
  },
  
  star: {
    type: 'star',
    numPoints: 5,
    innerRadius: 30,
    outerRadius: 50,
    fill: '#ffff00',
    stroke: '#000000',
    strokeWidth: 1
  },
  
  arrow: {
    type: 'arrow',
    points: [0, 0, 100, 0],
    pointerLength: 10,
    pointerWidth: 10,
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 2
  }
};

export const shapePresets = {
  businessCard: {
    width: 336,
    height: 210,
    name: 'Business Card (3.5" x 2.1")'
  },
  
  letterhead: {
    width: 612,
    height: 792,
    name: 'US Letter (8.5" x 11")'
  },
  
  a4: {
    width: 595,
    height: 842,
    name: 'A4 (210mm x 297mm)'
  },
  
  label_4x6: {
    width: 288,
    height: 432,
    name: 'Shipping Label (4" x 6")'
  },
  
  label_2x4: {
    width: 144,
    height: 288,
    name: 'Address Label (2" x 4")'
  },
  
  receipt: {
    width: 226,
    height: 800,
    name: 'Receipt (58mm wide)'
  }
};
