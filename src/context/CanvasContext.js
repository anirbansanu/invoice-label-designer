import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

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
  // Add safety check to prevent undefined state
  if (!state) {
    console.error('State is undefined in canvasReducer, returning initialState');
    return initialState;
  }

  switch (action.type) {
    case 'ADD_ELEMENT':
      return {
        ...state,
        pages: state.pages.map((page, index) => 
          index === state.currentPage 
            ? { ...page, elements: [...page.elements, { ...action.payload, id: generateId() }] }
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

    case 'SET_ZOOM':
      return {
        ...state,
        zoom: Math.max(0.1, Math.min(5, action.payload))
      };

    case 'TOGGLE_PREVIEW':
      return {
        ...state,
        previewMode: !state.previewMode,
        selectedElements: []
      };

    // Add other cases as needed...

    default:
      return state;
  }
};

// Helper functions
const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getCurrentPageElements = (state) => {
  if (!state || !state.pages || !state.pages[state.currentPage]) {
    return [];
  }
  return state.pages[state.currentPage].elements || [];
};

export const CanvasProvider = ({ children }) => {
  // Add error boundary for useReducer
  let state, dispatch;
  
  try {
    [state, dispatch] = useReducer(canvasReducer, initialState);
  } catch (error) {
    console.error('Error initializing useReducer:', error);
    // Fallback to initial state
    state = initialState;
    dispatch = () => console.error('Dispatch is not available due to reducer initialization error');
  }

  // Safety check - ensure state is defined
  if (!state) {
    console.error('State is undefined, using fallback');
    state = initialState;
  }

  // Memoized selectors with safety checks
  const currentPage = useMemo(() => {
    if (!state.pages || !state.pages[state.currentPage]) {
      return state.pages?.[0] || initialState.pages[0];
    }
    return state.pages[state.currentPage];
  }, [state.pages, state.currentPage]);

  const selectedElementsData = useMemo(() => {
    if (!currentPage?.elements || !state.selectedElements) {
      return [];
    }
    return currentPage.elements.filter(el => state.selectedElements.includes(el.id)) || [];
  }, [currentPage?.elements, state.selectedElements]);

  // Actions with safety checks
  const addElement = useCallback((element) => {
    if (dispatch) {
      dispatch({ type: 'ADD_ELEMENT', payload: element });
    }
  }, [dispatch]);

  const updateElement = useCallback((element) => {
    if (dispatch) {
      dispatch({ type: 'UPDATE_ELEMENT', payload: element });
    }
  }, [dispatch]);

  const deleteElements = useCallback((ids) => {
    if (dispatch) {
      dispatch({ type: 'DELETE_ELEMENTS', payload: Array.isArray(ids) ? ids : [ids] });
    }
  }, [dispatch]);

  const selectElements = useCallback((ids) => {
    if (dispatch) {
      dispatch({ type: 'SELECT_ELEMENTS', payload: Array.isArray(ids) ? ids : [ids] });
    }
  }, [dispatch]);

  const setZoom = useCallback((zoom) => {
    if (dispatch) {
      dispatch({ type: 'SET_ZOOM', payload: zoom });
    }
  }, [dispatch]);

  const togglePreview = useCallback(() => {
    if (dispatch) {
      dispatch({ type: 'TOGGLE_PREVIEW' });
    }
  }, [dispatch]);

  // Create context value with safety checks
  const value = useMemo(() => ({
    // State (with fallbacks)
    pages: state.pages || initialState.pages,
    currentPage: state.currentPage || 0,
    selectedElements: state.selectedElements || [],
    zoom: state.zoom || 1,
    previewMode: state.previewMode || false,
    sampleData: state.sampleData || initialState.sampleData,
    
    // Computed values
    currentPage: currentPage,
    selectedElementsData: selectedElementsData,
    
    // Actions
    addElement,
    updateElement,
    deleteElements,
    selectElements,
    setZoom,
    togglePreview,
    dispatch: dispatch || (() => {})
  }), [
    state,
    currentPage,
    selectedElementsData,
    addElement,
    updateElement,
    deleteElements,
    selectElements,
    setZoom,
    togglePreview,
    dispatch
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

// Export CanvasContext for other components that need it
export { CanvasContext };
