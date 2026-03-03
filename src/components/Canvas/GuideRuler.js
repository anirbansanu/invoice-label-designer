import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useCanvas } from '../../context/CanvasContext';

const GuideRuler = () => {
  const { currentPageData, zoom } = useCanvas();
  const [horizontalGuides, setHorizontalGuides] = useState([]);
  const [verticalGuides, setVerticalGuides] = useState([]);
  const [showRulers, setShowRulers] = useState(true);
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Sync ruler position with parent scroll container and canvas wrapper offset
  useEffect(() => {
    const scrollParent = containerRef.current?.parentElement;
    if (!scrollParent) return;

    const syncPosition = () => {
      setScrollOffset({ x: scrollParent.scrollLeft, y: scrollParent.scrollTop });

      // Find the canvas-wrapper to get the actual canvas offset within scroll area
      const wrapper = scrollParent.querySelector('.canvas-wrapper');
      if (wrapper && wrapper.firstChild) {
        // The zoom transform div is the first child of canvas-wrapper
        const zoomDiv = wrapper.firstChild;
        const wrapperRect = scrollParent.getBoundingClientRect();
        const zoomRect = zoomDiv.getBoundingClientRect();
        setCanvasOffset({
          x: zoomRect.left - wrapperRect.left + scrollParent.scrollLeft,
          y: zoomRect.top - wrapperRect.top + scrollParent.scrollTop
        });
      }
    };

    syncPosition();
    scrollParent.addEventListener('scroll', syncPosition, { passive: true });
    window.addEventListener('resize', syncPosition, { passive: true });

    // Re-sync when zoom changes
    const observer = new MutationObserver(syncPosition);
    observer.observe(scrollParent, { childList: true, subtree: true, attributes: true });

    return () => {
      scrollParent.removeEventListener('scroll', syncPosition);
      window.removeEventListener('resize', syncPosition);
      observer.disconnect();
    };
  }, [zoom]);

  const addHorizontalGuide = useCallback((y) => {
    const newGuide = {
      id: `h-${Date.now()}`,
      position: y,
      type: 'horizontal'
    };
    setHorizontalGuides(prev => [...prev, newGuide]);
  }, []);

  const addVerticalGuide = useCallback((x) => {
    const newGuide = {
      id: `v-${Date.now()}`,
      position: x,
      type: 'vertical'
    };
    setVerticalGuides(prev => [...prev, newGuide]);
  }, []);

  const removeGuide = useCallback((id) => {
    setHorizontalGuides(prev => prev.filter(guide => guide.id !== id));
    setVerticalGuides(prev => prev.filter(guide => guide.id !== id));
  }, []);

  const generateRulerMarks = useCallback((length, isHorizontal) => {
    const marks = [];
    const step = 10; // 10px steps
    const majorStep = 100; // 100px major marks

    for (let i = 0; i <= length; i += step) {
      const isMajor = i % majorStep === 0;
      const markLength = isMajor ? 12 : 6;
      
      marks.push(
        <div
          key={i}
          className={`ruler-mark ${isMajor ? 'major' : 'minor'}`}
          style={{
            position: 'absolute',
            [isHorizontal ? 'left' : 'top']: `${i * zoom}px`,
            [isHorizontal ? 'height' : 'width']: `${markLength}px`,
            [isHorizontal ? 'width' : 'height']: '1px',
            backgroundColor: '#666',
            [isHorizontal ? 'top' : 'left']: isMajor ? '8px' : '12px'
          }}
        />
      );

      if (isMajor && i > 0) {
        marks.push(
          <div
            key={`label-${i}`}
            className="ruler-label"
            style={{
              position: 'absolute',
              [isHorizontal ? 'left' : 'top']: `${i * zoom - 8}px`,
              [isHorizontal ? 'top' : 'left']: '2px',
              fontSize: '10px',
              color: '#666',
              [isHorizontal ? 'width' : 'height']: '16px',
              textAlign: 'center'
            }}
          >
            {i}
          </div>
        );
      }
    }

    return marks;
  }, [zoom]);

  if (!showRulers || !currentPageData) return null;

  const rulerSize = 20;
  const pageWidth = currentPageData.size.width;
  const pageHeight = currentPageData.size.height;

  // The horizontal ruler sticks to the top of the scroll viewport
  // Its marks start at the canvas X offset and span the page width
  const hRulerLeft = canvasOffset.x - scrollOffset.x + rulerSize;
  const vRulerTop = canvasOffset.y - scrollOffset.y + rulerSize;

  return (
    <div className="guide-ruler-container" ref={containerRef}>
      {/* Horizontal Ruler — sticks to top */}
      <div 
        className="ruler horizontal-ruler"
        style={{
          position: 'fixed',
          top: containerRef.current?.parentElement?.getBoundingClientRect().top || 0,
          left: (containerRef.current?.parentElement?.getBoundingClientRect().left || 0) + rulerSize,
          width: `calc(100% - ${rulerSize}px)`,
          height: `${rulerSize}px`,
          backgroundColor: 'var(--bg-surface, #f5f5f5)',
          borderBottom: '1px solid var(--border-default, #ddd)',
          zIndex: 10,
          overflow: 'hidden',
          pointerEvents: 'auto'
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left - (hRulerLeft - rulerSize)) / zoom;
          if (x >= 0 && x <= pageWidth) addVerticalGuide(x);
        }}
      >
        <div style={{
          position: 'absolute',
          left: `${hRulerLeft - rulerSize}px`,
          top: 0,
          width: `${pageWidth * zoom}px`,
          height: `${rulerSize}px`
        }}>
          {generateRulerMarks(pageWidth, true)}
        </div>
      </div>

      {/* Vertical Ruler — sticks to left */}
      <div 
        className="ruler vertical-ruler"
        style={{
          position: 'fixed',
          top: (containerRef.current?.parentElement?.getBoundingClientRect().top || 0) + rulerSize,
          left: containerRef.current?.parentElement?.getBoundingClientRect().left || 0,
          width: `${rulerSize}px`,
          height: `calc(100% - ${rulerSize}px)`,
          backgroundColor: 'var(--bg-surface, #f5f5f5)',
          borderRight: '1px solid var(--border-default, #ddd)',
          zIndex: 10,
          overflow: 'hidden',
          pointerEvents: 'auto'
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const y = (e.clientY - rect.top - (vRulerTop - rulerSize)) / zoom;
          if (y >= 0 && y <= pageHeight) addHorizontalGuide(y);
        }}
      >
        <div style={{
          position: 'absolute',
          top: `${vRulerTop - rulerSize}px`,
          left: 0,
          width: `${rulerSize}px`,
          height: `${pageHeight * zoom}px`
        }}>
          {generateRulerMarks(pageHeight, false)}
        </div>
      </div>

      {/* Corner */}
      <div 
        className="ruler-corner"
        style={{
          position: 'fixed',
          top: containerRef.current?.parentElement?.getBoundingClientRect().top || 0,
          left: containerRef.current?.parentElement?.getBoundingClientRect().left || 0,
          width: `${rulerSize}px`,
          height: `${rulerSize}px`,
          backgroundColor: 'var(--bg-surface, #f5f5f5)',
          borderRight: '1px solid var(--border-default, #ddd)',
          borderBottom: '1px solid var(--border-default, #ddd)',
          zIndex: 11,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={() => setShowRulers(!showRulers)}
      >
        <i className="fas fa-ruler-combined" style={{ fontSize: '8px', color: 'var(--text-muted, #666)' }}></i>
      </div>

      {/* Horizontal Guides — position relative to canvas within scroll area */}
      {horizontalGuides.map(guide => (
        <div
          key={guide.id}
          className="guide-line horizontal-guide"
          style={{
            position: 'absolute',
            top: `${canvasOffset.y + (guide.position * zoom)}px`,
            left: `${canvasOffset.x}px`,
            width: `${pageWidth * zoom}px`,
            height: '1px',
            backgroundColor: '#0066cc',
            cursor: 'ns-resize',
            zIndex: 5
          }}
          onDoubleClick={() => removeGuide(guide.id)}
        />
      ))}

      {/* Vertical Guides — position relative to canvas within scroll area */}
      {verticalGuides.map(guide => (
        <div
          key={guide.id}
          className="guide-line vertical-guide"
          style={{
            position: 'absolute',
            top: `${canvasOffset.y}px`,
            left: `${canvasOffset.x + (guide.position * zoom)}px`,
            width: '1px',
            height: `${pageHeight * zoom}px`,
            backgroundColor: '#0066cc',
            cursor: 'ew-resize',
            zIndex: 5
          }}
          onDoubleClick={() => removeGuide(guide.id)}
        />
      ))}
    </div>
  );
};

export default GuideRuler;
