import React, { useState, useCallback } from 'react';
import { useCanvas } from '../../context/CanvasContext';

const GuideRuler = () => {
  const { currentPage, zoom, dispatch } = useCanvas();
  const [horizontalGuides, setHorizontalGuides] = useState([]);
  const [verticalGuides, setVerticalGuides] = useState([]);
  const [showRulers, setShowRulers] = useState(true);

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

  if (!showRulers || !currentPage) return null;

  return (
    <div className="guide-ruler-container">
      {/* Horizontal Ruler */}
      <div 
        className="ruler horizontal-ruler"
        style={{
          position: 'absolute',
          top: '0',
          left: '20px',
          width: `${currentPage.size.width * zoom}px`,
          height: '20px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          zIndex: 10
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / zoom;
          addVerticalGuide(x);
        }}
      >
        {generateRulerMarks(currentPage.size.width, true)}
      </div>

      {/* Vertical Ruler */}
      <div 
        className="ruler vertical-ruler"
        style={{
          position: 'absolute',
          top: '20px',
          left: '0',
          width: '20px',
          height: `${currentPage.size.height * zoom}px`,
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #ddd',
          zIndex: 10
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const y = (e.clientY - rect.top) / zoom;
          addHorizontalGuide(y);
        }}
      >
        {generateRulerMarks(currentPage.size.height, false)}
      </div>

      {/* Corner */}
      <div 
        className="ruler-corner"
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '20px',
          height: '20px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          zIndex: 11,
          cursor: 'pointer'
        }}
        onClick={() => setShowRulers(!showRulers)}
      >
        <i className="fas fa-ruler-combined" style={{ fontSize: '10px', padding: '5px' }}></i>
      </div>

      {/* Horizontal Guides */}
      {horizontalGuides.map(guide => (
        <div
          key={guide.id}
          className="guide-line horizontal-guide"
          style={{
            position: 'absolute',
            top: `${guide.position * zoom + 20}px`,
            left: '20px',
            width: `${currentPage.size.width * zoom}px`,
            height: '1px',
            backgroundColor: '#0066cc',
            cursor: 'ns-resize',
            zIndex: 5
          }}
          onDoubleClick={() => removeGuide(guide.id)}
        />
      ))}

      {/* Vertical Guides */}
      {verticalGuides.map(guide => (
        <div
          key={guide.id}
          className="guide-line vertical-guide"
          style={{
            position: 'absolute',
            top: '20px',
            left: `${guide.position * zoom + 20}px`,
            width: '1px',
            height: `${currentPage.size.height * zoom}px`,
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
