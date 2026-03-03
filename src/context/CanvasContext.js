import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

const CanvasContext = createContext();

const initialState = {
  // Canvas properties
  pages: [{
    id: 'page-1',
    name: 'Page 1',
    elements: [],
    background: '#ffffff',
    size: { width: 794, height: 1123 }, // A4
    grid: { size: 10, visible: true, snap: true }
  }],
  currentPage: 0,
  
  // Selection and editing
  selectedElements: [],
  clipboard: [],
  
  // View properties
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  previewMode: false,
  
  // History
  history: [],
  historyIndex: -1,
  
  // Templates and assets
  templates: [],
  images: [],
  
  // Grid and layout
  labelGrid: {
    enabled: false,
    rows: 3,
    columns: 3,
    rowGap: 10,
    columnGap: 10,
    margins: { top: 20, right: 20, bottom: 20, left: 20 }
  },
  
  // Sample data
  sampleData: {
    'invoice.number': 'INV-2025-001',
    'invoice.date': '2025-01-15',
    'invoice.total': '$1,250.00',
    'customer.name': 'John Doe',
    'customer.email': 'john@example.com',
    'company.name': 'Your Company Inc.',
    'product.name': 'Premium Widget',
    'product.sku': 'PWD-001',
    'product.price': '$25.00',
    'product.quantity': '5'
  },
  
  // Performance
  renderOptimization: true,
  virtualScrolling: true
};

// Helper functions
const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const saveToHistory = (state) => {
  const currentSnapshot = {
    pages: JSON.parse(JSON.stringify(state.pages)),
    currentPage: state.currentPage
  };
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(currentSnapshot);
  if (newHistory.length > 50) newHistory.shift();
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
};

const getElementBounds = (element) => {
  const x = element.x || 0;
  const y = element.y || 0;

  let width = 50;
  let height = 20;

  if (typeof element.width === 'number') width = element.width;
  if (typeof element.height === 'number') height = element.height;

  if (typeof element.size === 'number') {
    width = element.size;
    height = element.size;
  }

  if (typeof element.radius === 'number') {
    width = element.radius * 2;
    height = element.radius * 2;
  }

  if (element.type === 'text') {
    const fontSize = element.fontSize || 14;
    const textLength = (element.text || '').length || 10;
    if (typeof element.width !== 'number') {
      width = Math.max(80, Math.round(textLength * fontSize * 0.55));
    }
    if (typeof element.height !== 'number') {
      height = Math.max(24, Math.round(fontSize * 1.8));
    }
  }

  return {
    minX: x,
    minY: y,
    maxX: x + Math.max(1, width),
    maxY: y + Math.max(1, height)
  };
};

const fitTemplateElementsToPage = (elements, pageSize, padding = 12) => {
  if (!Array.isArray(elements) || elements.length === 0) return [];

  const boundsList = elements.map(getElementBounds);
  const minX = Math.min(...boundsList.map(b => b.minX));
  const minY = Math.min(...boundsList.map(b => b.minY));
  const maxX = Math.max(...boundsList.map(b => b.maxX));
  const maxY = Math.max(...boundsList.map(b => b.maxY));

  const contentWidth = Math.max(1, maxX - minX);
  const contentHeight = Math.max(1, maxY - minY);
  const availableWidth = Math.max(1, (pageSize?.width || 794) - (padding * 2));
  const availableHeight = Math.max(1, (pageSize?.height || 1123) - (padding * 2));

  const scale = Math.min(1, availableWidth / contentWidth, availableHeight / contentHeight);

  return elements.map(element => {
    const next = JSON.parse(JSON.stringify(element));
    next.x = Math.round((((element.x || 0) - minX) * scale) + padding);
    next.y = Math.round((((element.y || 0) - minY) * scale) + padding);

    if (typeof next.width === 'number') next.width = Math.max(1, Math.round(next.width * scale));
    if (typeof next.height === 'number') next.height = Math.max(1, Math.round(next.height * scale));
    if (typeof next.size === 'number') next.size = Math.max(12, Math.round(next.size * scale));
    if (typeof next.radius === 'number') next.radius = Math.max(4, Math.round(next.radius * scale));
    if (typeof next.fontSize === 'number') next.fontSize = Math.max(8, Math.round(next.fontSize * scale));
    if (typeof next.strokeWidth === 'number') next.strokeWidth = Math.max(1, next.strokeWidth * scale);

    if (next.type === 'table' && Array.isArray(next.columns)) {
      next.columns = next.columns.map(col => ({
        ...col,
        width: typeof col.width === 'number' ? Math.max(20, Math.round(col.width * scale)) : col.width
      }));
    }

    return next;
  });
};

const canvasReducer = (state, action) => {
  if (!state) return initialState;

  let historyUpdate;

  switch (action.type) {
    // ─── Element CRUD ───────────────────────────────────────────
    case 'ADD_ELEMENT':
      historyUpdate = saveToHistory(state);
      return {
        ...state,
        ...historyUpdate,
        pages: state.pages.map((page, index) => 
          index === state.currentPage 
            ? { ...page, elements: [...page.elements, { ...action.payload, id: action.payload.id || generateId() }] }
            : page
        )
      };

    case 'UPDATE_ELEMENT':
      return {
        ...state,
        pages: state.pages.map((page, index) => 
          index === state.currentPage 
            ? {
                ...page,
                elements: page.elements.map(el =>
                  el.id === action.payload.id ? { ...el, ...action.payload } : el
                )
              }
            : page
        )
      };

    case 'DELETE_ELEMENTS':
      historyUpdate = saveToHistory(state);
      return {
        ...state,
        ...historyUpdate,
        pages: state.pages.map((page, index) => 
          index === state.currentPage 
            ? { ...page, elements: page.elements.filter(el => !action.payload.includes(el.id)) }
            : page
        ),
        selectedElements: []
      };

    case 'MOVE_ELEMENT': {
      const { id, deltaX, deltaY } = action.payload;
      return {
        ...state,
        pages: state.pages.map((page, index) => 
          index === state.currentPage 
            ? {
                ...page,
                elements: page.elements.map(el =>
                  el.id === id ? { ...el, x: (el.x || 0) + deltaX, y: (el.y || 0) + deltaY } : el
                )
              }
            : page
        )
      };
    }

    case 'REORDER_ELEMENTS':
      return {
        ...state,
        pages: state.pages.map((page, index) => 
          index === (action.payload.pageIndex ?? state.currentPage)
            ? { ...page, elements: action.payload.elements }
            : page
        )
      };

    case 'BRING_TO_FRONT': {
      const pageForFront = state.pages[state.currentPage];
      const elIndex = pageForFront.elements.findIndex(el => el.id === action.payload);
      if (elIndex === -1) return state;
      const newElements = [...pageForFront.elements];
      const [moved] = newElements.splice(elIndex, 1);
      newElements.push(moved);
      return {
        ...state,
        pages: state.pages.map((page, idx) =>
          idx === state.currentPage ? { ...page, elements: newElements } : page
        )
      };
    }

    case 'SEND_TO_BACK': {
      const pageForBack = state.pages[state.currentPage];
      const elIdx = pageForBack.elements.findIndex(el => el.id === action.payload);
      if (elIdx === -1) return state;
      const newEls = [...pageForBack.elements];
      const [movedEl] = newEls.splice(elIdx, 1);
      newEls.unshift(movedEl);
      return {
        ...state,
        pages: state.pages.map((page, idx) =>
          idx === state.currentPage ? { ...page, elements: newEls } : page
        )
      };
    }

    // ─── Selection ──────────────────────────────────────────────
    case 'SELECT_ELEMENTS':
      return { ...state, selectedElements: action.payload };

    case 'SELECT_ALL':
      return {
        ...state,
        selectedElements: (state.pages[state.currentPage]?.elements || []).map(el => el.id)
      };

    case 'CLEAR_SELECTION':
      return { ...state, selectedElements: [] };

    // ─── Clipboard ──────────────────────────────────────────────
    case 'COPY_ELEMENTS': {
      const currentEls = state.pages[state.currentPage]?.elements || [];
      const copied = currentEls.filter(el => action.payload.includes(el.id));
      return { ...state, clipboard: JSON.parse(JSON.stringify(copied)) };
    }

    case 'PASTE_ELEMENTS': {
      if (state.clipboard.length === 0) return state;
      historyUpdate = saveToHistory(state);
      const pastedElements = state.clipboard.map(el => ({
        ...el, id: generateId(), x: (el.x || 0) + 20, y: (el.y || 0) + 20
      }));
      return {
        ...state,
        ...historyUpdate,
        pages: state.pages.map((page, index) =>
          index === state.currentPage
            ? { ...page, elements: [...page.elements, ...pastedElements] }
            : page
        ),
        selectedElements: pastedElements.map(el => el.id)
      };
    }

    case 'DUPLICATE_ELEMENTS': {
      const currPage = state.pages[state.currentPage];
      if (!currPage) return state;
      historyUpdate = saveToHistory(state);
      const toDuplicate = currPage.elements.filter(el => action.payload.includes(el.id));
      const duplicated = toDuplicate.map(el => ({
        ...el, id: generateId(), x: (el.x || 0) + 20, y: (el.y || 0) + 20
      }));
      return {
        ...state,
        ...historyUpdate,
        pages: state.pages.map((page, index) =>
          index === state.currentPage
            ? { ...page, elements: [...page.elements, ...duplicated] }
            : page
        ),
        selectedElements: duplicated.map(el => el.id)
      };
    }

    // ─── Grouping ───────────────────────────────────────────────
    case 'GROUP_ELEMENTS': {
      const groupPage = state.pages[state.currentPage];
      if (!groupPage) return state;
      historyUpdate = saveToHistory(state);
      const children = groupPage.elements.filter(el => action.payload.includes(el.id));
      if (children.length < 2) return state;
      const minX = Math.min(...children.map(c => c.x || 0));
      const minY = Math.min(...children.map(c => c.y || 0));
      const maxX = Math.max(...children.map(c => (c.x || 0) + (c.width || c.size || 50)));
      const maxY = Math.max(...children.map(c => (c.y || 0) + (c.height || c.size || 50)));
      const groupElement = {
        id: generateId(), type: 'group', x: minX, y: minY,
        width: maxX - minX, height: maxY - minY,
        rotation: 0, opacity: 1, visible: true, locked: false,
        children: children.map(c => ({ ...c, x: (c.x || 0) - minX, y: (c.y || 0) - minY }))
      };
      const remaining = groupPage.elements.filter(el => !action.payload.includes(el.id));
      return {
        ...state, ...historyUpdate,
        pages: state.pages.map((page, index) =>
          index === state.currentPage ? { ...page, elements: [...remaining, groupElement] } : page
        ),
        selectedElements: [groupElement.id]
      };
    }

    case 'UNGROUP_ELEMENTS': {
      const ugPage = state.pages[state.currentPage];
      if (!ugPage) return state;
      historyUpdate = saveToHistory(state);
      const groups = ugPage.elements.filter(el => action.payload.includes(el.id) && el.type === 'group');
      if (groups.length === 0) return state;
      let ungrouped = [];
      groups.forEach(group => {
        (group.children || []).forEach(child => {
          ungrouped.push({
            ...child, id: generateId(),
            x: (child.x || 0) + (group.x || 0),
            y: (child.y || 0) + (group.y || 0)
          });
        });
      });
      const rest = ugPage.elements.filter(el => !action.payload.includes(el.id));
      return {
        ...state, ...historyUpdate,
        pages: state.pages.map((page, index) =>
          index === state.currentPage ? { ...page, elements: [...rest, ...ungrouped] } : page
        ),
        selectedElements: ungrouped.map(el => el.id)
      };
    }

    // ─── Pages ──────────────────────────────────────────────────
    case 'ADD_PAGE':
      return {
        ...state,
        pages: [...state.pages, {
          id: generateId(),
          name: action.payload?.name || `Page ${state.pages.length + 1}`,
          elements: [],
          background: '#ffffff',
          size: action.payload?.size || { width: 794, height: 1123 },
          grid: { size: 10, visible: true, snap: true }
        }]
      };

    case 'DELETE_PAGE': {
      if (state.pages.length <= 1) return state;
      const filteredPages = state.pages.filter((_, index) => index !== action.payload);
      return {
        ...state,
        pages: filteredPages,
        currentPage: Math.min(state.currentPage, filteredPages.length - 1)
      };
    }

    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload, selectedElements: [] };

    case 'REORDER_PAGES': {
      const { sourceIndex, destinationIndex } = action.payload;
      const reorderedPages = [...state.pages];
      const [movedPage] = reorderedPages.splice(sourceIndex, 1);
      reorderedPages.splice(destinationIndex, 0, movedPage);
      return { ...state, pages: reorderedPages, currentPage: destinationIndex };
    }

    case 'UPDATE_PAGE': {
      const { pageIndex, updates } = action.payload;
      return {
        ...state,
        pages: state.pages.map((page, index) =>
          index === pageIndex ? { ...page, ...updates } : page
        )
      };
    }

    case 'UPDATE_PAGE_GRID': {
      const { pageIndex: pgIdx, grid } = action.payload;
      return {
        ...state,
        pages: state.pages.map((page, index) =>
          index === pgIdx ? { ...page, grid: { ...page.grid, ...grid } } : page
        )
      };
    }

    // ─── View ───────────────────────────────────────────────────
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.1, Math.min(5, action.payload)) };

    case 'ZOOM_IN':
      return { ...state, zoom: Math.min(5, (state.zoom || 1) * 1.2) };

    case 'ZOOM_OUT':
      return { ...state, zoom: Math.max(0.1, (state.zoom || 1) / 1.2) };

    case 'RESET_ZOOM':
      return { ...state, zoom: 1 };

    case 'SET_PAN_OFFSET':
      return { ...state, panOffset: action.payload };

    case 'TOGGLE_PREVIEW':
      return { ...state, previewMode: !state.previewMode, selectedElements: [] };

    case 'TOGGLE_GRID':
      return {
        ...state,
        pages: state.pages.map((page, index) => 
          index === state.currentPage 
            ? { ...page, grid: { ...page.grid, visible: !page.grid.visible } }
            : page
        )
      };

    case 'TOGGLE_SNAP':
      return {
        ...state,
        pages: state.pages.map((page, index) => 
          index === state.currentPage 
            ? { ...page, grid: { ...page.grid, snap: !page.grid.snap } }
            : page
        )
      };

    // ─── History / Undo / Redo ──────────────────────────────────
    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const prevIdx = state.historyIndex - 1;
      const prevSnap = state.history[prevIdx];
      return {
        ...state,
        pages: JSON.parse(JSON.stringify(prevSnap.pages)),
        currentPage: prevSnap.currentPage,
        historyIndex: prevIdx,
        selectedElements: []
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextIdx = state.historyIndex + 1;
      const nextSnap = state.history[nextIdx];
      return {
        ...state,
        pages: JSON.parse(JSON.stringify(nextSnap.pages)),
        currentPage: nextSnap.currentPage,
        historyIndex: nextIdx,
        selectedElements: []
      };
    }

    case 'SAVE_HISTORY':
      return { ...state, ...saveToHistory(state) };

    case 'CLEAR_HISTORY':
      return { ...state, history: [], historyIndex: -1 };

    // ─── Templates ──────────────────────────────────────────────
    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [...state.templates, { ...action.payload, id: action.payload.id || generateId() }]
      };

    case 'DELETE_TEMPLATE':
      return { ...state, templates: state.templates.filter(t => t.id !== action.payload) };

    case 'APPLY_TEMPLATE': {
      const templatePayload = action.payload?.template || action.payload;
      if (!templatePayload) return state;
      historyUpdate = saveToHistory(state);

      if (templatePayload.pages && Array.isArray(templatePayload.pages)) {
        return {
          ...state, ...historyUpdate,
          pages: JSON.parse(JSON.stringify(templatePayload.pages)),
          currentPage: 0,
          selectedElements: []
        };
      }

      if (!Array.isArray(templatePayload.elements)) return state;

      const currentPage = state.pages[state.currentPage];
      const targetPageSize = templatePayload.pageSize || currentPage?.size || { width: 794, height: 1123 };

      // If template defines its own pageSize, use the target page size directly
      // and scale elements from the template's design size to the target size.
      const templateDesignSize = templatePayload.pageSize || { width: 794, height: 1123 };
      const needsScaling = (
        templateDesignSize.width !== targetPageSize.width ||
        templateDesignSize.height !== targetPageSize.height
      );

      let fittedElements;
      if (needsScaling) {
        fittedElements = fitTemplateElementsToPage(templatePayload.elements, targetPageSize);
      } else {
        // Template designed for this page size — use elements as-is (deep clone only)
        fittedElements = JSON.parse(JSON.stringify(templatePayload.elements));
      }

      const appliedElements = fittedElements.map(element => ({
        ...element,
        id: generateId()
      }));

      return {
        ...state, ...historyUpdate,
        pages: state.pages.map((page, index) =>
          index === state.currentPage
            ? {
                ...page,
                elements: appliedElements,
                background: templatePayload.background || page.background,
                size: targetPageSize
              }
            : page
        ),
        selectedElements: []
      };
    }

    // ─── Images ─────────────────────────────────────────────────
    case 'ADD_IMAGE':
      return {
        ...state,
        images: [...state.images, { ...action.payload, id: action.payload.id || generateId() }]
      };

    case 'DELETE_IMAGE':
      return { ...state, images: state.images.filter(img => img.id !== action.payload) };

    case 'UPDATE_IMAGE':
      return {
        ...state,
        images: state.images.map(img =>
          img.id === action.payload.id ? { ...img, ...action.payload } : img
        )
      };

    // ─── Label Grid ─────────────────────────────────────────────
    case 'UPDATE_LABEL_GRID':
      return { ...state, labelGrid: { ...state.labelGrid, ...action.payload } };

    // ─── Import / New Design ────────────────────────────────────
    case 'IMPORT_DESIGN': {
      const imported = action.payload;
      historyUpdate = saveToHistory(state);
      return {
        ...state, ...historyUpdate,
        pages: imported.pages || state.pages,
        templates: imported.templates || state.templates,
        images: imported.images || state.images,
        sampleData: imported.sampleData || state.sampleData,
        currentPage: 0,
        selectedElements: []
      };
    }

    case 'NEW_DESIGN':
      return { ...initialState, history: [], historyIndex: -1 };

    // ─── Sample Data ────────────────────────────────────────────
    case 'UPDATE_SAMPLE_DATA':
      return { ...state, sampleData: { ...state.sampleData, ...action.payload } };

    default:
      return state;
  }
};

export const CanvasProvider = ({ children }) => {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  // Memoized selectors
  const currentPageData = useMemo(() => {
    if (!state.pages || !state.pages[state.currentPage]) {
      return state.pages?.[0] || initialState.pages[0];
    }
    return state.pages[state.currentPage];
  }, [state.pages, state.currentPage]);

  const selectedElementsData = useMemo(() => {
    if (!currentPageData?.elements || !state.selectedElements) return [];
    return currentPageData.elements.filter(el => state.selectedElements.includes(el.id));
  }, [currentPageData?.elements, state.selectedElements]);

  // ─── Action Creators ──────────────────────────────────────────
  const addElement = useCallback((element) => {
    dispatch({ type: 'ADD_ELEMENT', payload: element });
  }, []);

  const updateElement = useCallback((element) => {
    dispatch({ type: 'UPDATE_ELEMENT', payload: element });
  }, []);

  const deleteElements = useCallback((ids) => {
    dispatch({ type: 'DELETE_ELEMENTS', payload: Array.isArray(ids) ? ids : [ids] });
  }, []);

  const selectElements = useCallback((ids) => {
    dispatch({ type: 'SELECT_ELEMENTS', payload: Array.isArray(ids) ? ids : [ids] });
  }, []);

  const copyElements = useCallback((ids) => {
    dispatch({ type: 'COPY_ELEMENTS', payload: Array.isArray(ids) ? ids : [ids] });
  }, []);

  const pasteElements = useCallback(() => {
    dispatch({ type: 'PASTE_ELEMENTS' });
  }, []);

  const duplicateElements = useCallback((ids) => {
    dispatch({ type: 'DUPLICATE_ELEMENTS', payload: Array.isArray(ids) ? ids : [ids] });
  }, []);

  const groupElements = useCallback((ids) => {
    dispatch({ type: 'GROUP_ELEMENTS', payload: Array.isArray(ids) ? ids : [ids] });
  }, []);

  const ungroupElements = useCallback((ids) => {
    dispatch({ type: 'UNGROUP_ELEMENTS', payload: Array.isArray(ids) ? ids : [ids] });
  }, []);

  const addPage = useCallback((pageConfig) => {
    dispatch({ type: 'ADD_PAGE', payload: pageConfig || {} });
  }, []);

  const deletePage = useCallback((index) => {
    dispatch({ type: 'DELETE_PAGE', payload: index });
  }, []);

  const setCurrentPage = useCallback((index) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: index });
  }, []);

  const setZoom = useCallback((zoom) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const setPanOffset = useCallback((offset) => {
    dispatch({ type: 'SET_PAN_OFFSET', payload: offset });
  }, []);

  const togglePreview = useCallback(() => {
    dispatch({ type: 'TOGGLE_PREVIEW' });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  // ─── Context Value ────────────────────────────────────────────
  const value = useMemo(() => ({
    // State
    pages: state.pages || initialState.pages,
    currentPage: state.currentPage ?? 0,
    selectedElements: state.selectedElements || [],
    clipboard: state.clipboard || [],
    zoom: state.zoom || 1,
    previewMode: state.previewMode || false,
    sampleData: state.sampleData || initialState.sampleData,
    panOffset: state.panOffset || { x: 0, y: 0 },
    history: state.history || [],
    historyIndex: state.historyIndex ?? -1,
    templates: state.templates || [],
    images: state.images || [],
    labelGrid: state.labelGrid || initialState.labelGrid,
    renderOptimization: state.renderOptimization ?? true,
    virtualScrolling: state.virtualScrolling ?? true,
    
    // Computed values
    currentPageData,
    selectedElementsData,
    
    // Grid properties
    showGrid: currentPageData?.grid?.visible ?? false,
    snapToGrid: currentPageData?.grid?.snap ?? false,
    
    // Actions
    addElement,
    updateElement,
    deleteElements,
    selectElements,
    copyElements,
    pasteElements,
    duplicateElements,
    groupElements,
    ungroupElements,
    addPage,
    deletePage,
    setCurrentPage,
    setZoom,
    setPanOffset,
    togglePreview,
    undo,
    redo,
    dispatch
  }), [
    state,
    currentPageData,
    selectedElementsData,
    addElement,
    updateElement,
    deleteElements,
    selectElements,
    copyElements,
    pasteElements,
    duplicateElements,
    groupElements,
    ungroupElements,
    addPage,
    deletePage,
    setCurrentPage,
    setZoom,
    setPanOffset,
    togglePreview,
    undo,
    redo
  ]);

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

export { CanvasContext };
