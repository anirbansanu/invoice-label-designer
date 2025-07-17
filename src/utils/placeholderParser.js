export const parsePlaceholders = (text, data) => {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    const value = getNestedValue(data, trimmedKey);
    return value !== undefined ? value : match;
  });
};

export const extractPlaceholders = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const matches = text.match(/\{\{(.*?)\}\}/g);
  return matches ? matches.map(match => match.slice(2, -2).trim()) : [];
};

export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

export const validatePlaceholder = (placeholder, data) => {
  const value = getNestedValue(data, placeholder);
  return value !== undefined;
};

export const getPlaceholderSuggestions = (partial, data) => {
  const suggestions = [];
  
  const searchInObject = (obj, prefix = '') => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (fullKey.toLowerCase().includes(partial.toLowerCase())) {
          suggestions.push({
            key: fullKey,
            value: obj[key],
            type: typeof obj[key]
          });
        }
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          searchInObject(obj[key], fullKey);
        }
      }
    }
  };
  
  searchInObject(data);
  return suggestions.sort((a, b) => a.key.localeCompare(b.key));
};

export const replacePlaceholderInElement = (element, data) => {
  const processedElement = { ...element };
  
  switch (element.type) {
    case 'text':
      processedElement.text = parsePlaceholders(element.text, data);
      break;
    case 'barcode':
      processedElement.value = parsePlaceholders(element.value, data);
      break;
    case 'qrcode':
      processedElement.value = parsePlaceholders(element.value, data);
      break;
    case 'table':
      if (element.rows) {
        processedElement.rows = element.rows.map(row =>
          row.map(cell => parsePlaceholders(cell, data))
        );
      }
      break;
    case 'group':
      if (element.children) {
        processedElement.children = element.children.map(child =>
          replacePlaceholderInElement(child, data)
        );
      }
      break;
  }
  
  return processedElement;
};

export const getAllPlaceholdersInElement = (element) => {
  const placeholders = [];
  
  switch (element.type) {
    case 'text':
      placeholders.push(...extractPlaceholders(element.text));
      break;
    case 'barcode':
      placeholders.push(...extractPlaceholders(element.value));
      break;
    case 'qrcode':
      placeholders.push(...extractPlaceholders(element.value));
      break;
    case 'table':
      if (element.rows) {
        element.rows.forEach(row =>
          row.forEach(cell =>
            placeholders.push(...extractPlaceholders(cell))
          )
        );
      }
      break;
    case 'group':
      if (element.children) {
        element.children.forEach(child =>
          placeholders.push(...getAllPlaceholdersInElement(child))
        );
      }
      break;
  }
  
  return [...new Set(placeholders)]; // Remove duplicates
};
