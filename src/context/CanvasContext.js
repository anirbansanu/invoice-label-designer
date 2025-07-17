import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { performanceOptimizer } from '../utils/performanceOptimizer';

const CanvasContext = createContext();

const initialState = {
  // Canvas properties
  pages: [{
    id: 'page-1',
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
    'product.price': '$25.00'
  },
  
  // Performance
  renderOptimization: true,
  virtualScrolling: true
};

const canvasReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ELEMENT':
      return performanceOptimizer.optimizeState({
        ...state,
        pages: state.pages.map((page, index) => 
          index === state.currentPage 
            ? { ...page, elements: [...page.elements, { ...action.payload, id: generateId() }] }
            : page
        )
      });

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
      return {
        ...state,
        pages: state.pages.map((page, index) => 
          index === state.currentPage 
            ? {
                ...page,
                elements: page.elements.filter(el => !action.payload.includes(el.id))
              }
            : page
        ),
        selectedElements: []
      };

    case 'SELECT_ELEMENTS':
      return {
        ...state,
        selectedElements: action.payload
      };

    case 'ADD_PAGE':
      return {
        ...state,
        pages: [...state.pages, {
          id: generateId(),
          elements: [],
          background: '#ffffff',
          size: action.payload.size || { width: 794, height: 1123 },
          grid: { size: 10, visible: true, snap: true }
        }]
      };

    case 'DELETE_PAGE':
      if (state.pages.length <= 1) return state;
      const newPages = state.pages.filter((_, index) => index !== action.payload);
      return {
        ...state,
        pages: newPages,
        currentPage: Math.min(state.currentPage, newPages.length - 1)
      };

    case 'SET_CURRENT_PAGE':
      return {
        ...state,
        currentPage: action.payload,
        selectedElements: []
      };

    case 'SET_ZOOM':
      return {
        ...state,
        zoom: Math.max(0.1, Math.min(5, action.payload))
      };

    case 'SET_PAN_OFFSET':
      return {
        ...state,
        panOffset: action.payload
      };

    case 'TOGGLE_PREVIEW':
      return {
        ...state,
        previewMode: !state.previewMode,
        selectedElements: []
      };

    case 'SET_LABEL_GRID':
      return {
        ...state,
        labelGrid: { ...state.labelGrid, ...action.payload }
      };

    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [...state.templates, action.payload]
      };

    case 'ADD_IMAGE':
      return {
        ...state,
        images: [...state.images, action.payload]
      };

    case 'SAVE_HISTORY':
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        history: [...newHistory, action.payload],
        historyIndex: newHistory.length
      };

    case 'UNDO':
      if (state.historyIndex > 0) {
        const prevState = state.history[state.historyIndex - 1];
        return {
          ...state,
          ...prevState,
          historyIndex: state.historyIndex - 1
        };
      }
      return state;

    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        return {
          ...state,
          ...nextState,
          historyIndex: state.historyIndex + 1
        };
      }
      return state;

    case 'COPY_ELEMENTS':
      return {
        ...state,
        clipboard: action.payload
      };

    case 'PASTE_ELEMENTS':
      const pastedElements = action.payload.map(el => ({
        ...el,
        id: generateId(),
        x: el.x + 20,
        y: el.y + 20
      }));
      return {
        ...state,
        pages: state.pages.map((page, index) => 
          index === state.currentPage 
            ? { ...page, elements: [...page.elements, ...pastedElements] }
            : page
        ),
        selectedElements: pastedElements.map(el => el.id)
      };

    case 'GROUP_ELEMENTS':
      const elementsToGroup = getCurrentPageElements(state).filter(el => 
        action.payload.includes(el.id)
      );
      const groupBounds = calculateGroupBounds(elementsToGroup);
      const groupElement = {
        id: generateId(),
        type: 'group',
        x: groupBounds.x,
        y: groupBounds.y,
        width: groupBounds.width,
        height: groupBounds.height,
        children: elementsToGroup.map(el => ({
          ...el,
          x: el.x - groupBounds.x,
          y: el.y - groupBounds.y
        }))
      };
      
      return {
        ...state,
        pages: state.pages.map((page, index) => 
          index === state.currentPage 
            ? {
                ...page,
                elements: [
                  ...page.elements.filter(el => !action.payload.includes(el.id)),
                  groupElement
                ]
              }
            : page
        ),
        selectedElements: [groupElement.id]
      };

    case 'UNGROUP_ELEMENTS':
      const updatedElements = [];
      getCurrentPageElements(state).forEach(el => {
        if (action.payload.includes(el.id) && el.type === 'group') {
          el.children.forEach(child => {
            updatedElements.push({
              ...child,
              x: child.x + el.x,
              y: child.y + el.y
            });
          });
        } else if (!action.payload.includes(el.id)) {
          updatedElements.push(el);
        }
      });
      
      return {
        ...state,
        pages: state.pages.map((page, index) => 
          index === state.currentPage 
            ? { ...page, elements: updatedElements }
            : page
        ),
        selectedElements: []
      };

    default:
      return state;
  }
};

// Helper functions
const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getCurrentPageElements = (state) => {
  return state.pages[state.currentPage]?.elements || [];
};

const calculateGroupBounds = (elements) => {
  if (elements.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  
  const bounds = elements.reduce((acc, el) => ({
    minX: Math.min(acc.minX, el.x),
    minY: Math.min(acc.minY, el.y),
    maxX: Math.max(acc.maxX, el.x + (el.width || 0)),
    maxY: Math.max(acc.maxY, el.y + (el.height || 0))
  }), {
    minX: elements[0].x,
    minY: elements[0].y,
    maxX: elements[0].x + (elements[0].width || 0),
    maxY: elements[0].y + (elements[0].height || 0)
  });
  
  return {
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY
  };
};

export const CanvasProvider = ({ children }) => {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  // Memoized selectors
  const currentPage = useMemo(() => state.pages[state.currentPage], [state.pages, state.currentPage]);
  const selectedElementsData = useMemo(() => 
    currentPage?.elements.filter(el => state.selectedElements.includes(el.id)) || [],
    [currentPage?.elements, state.selectedElements]
  );

  // Actions
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

  const addPage = useCallback((pageConfig) => {
    dispatch({ type: 'ADD_PAGE', payload: pageConfig });
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

  const setLabelGrid = useCallback((gridConfig) => {
    dispatch({ type: 'SET_LABEL_GRID', payload: gridConfig });
  }, []);

  const groupElements = useCallback((elementIds) => {
    dispatch({ type: 'GROUP_ELEMENTS', payload: elementIds });
  }, []);

  const ungroupElements = useCallback((elementIds) => {
    dispatch({ type: 'UNGROUP_ELEMENTS', payload: elementIds });
  }, []);

  const copyElements = useCallback((elementIds) => {
    const elementsToCopy = currentPage?.elements.filter(el => elementIds.includes(el.id)) || [];
    dispatch({ type: 'COPY_ELEMENTS', payload: elementsToCopy });
  }, [currentPage?.elements]);

  const pasteElements = useCallback(() => {
    if (state.clipboard.length > 0) {
      dispatch({ type: 'PASTE_ELEMENTS', payload: state.clipboard });
    }
  }, [state.clipboard]);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const value = useMemo(() => ({
    // State
    ...state,
    currentPage,
    selectedElementsData,
    
    // Actions
    addElement,
    updateElement,
    deleteElements,
    selectElements,
    addPage,
    deletePage,
    setCurrentPage,
    setZoom,
    setPanOffset,
    togglePreview,
    setLabelGrid,
    groupElements,
    ungroupElements,
    copyElements,
    pasteElements,
    undo,
    redo,
    dispatch
  }), [
    state,
    currentPage,
    selectedElementsData,
    addElement,
    updateElement,
    deleteElements,
    selectElements,
    addPage,
    deletePage,
    setCurrentPage,
    setZoom,
    setPanOffset,
    togglePreview,
    setLabelGrid,
    groupElements,
    ungroupElements,
    copyElements,
    pasteElements,
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
