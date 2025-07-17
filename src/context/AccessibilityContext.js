import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    screenReader: false,
    highContrast: false,
    largeText: false,
    keyboardNavigation: true,
    motionReduced: false,
    announcements: true
  });

  // Detect user preferences
  useEffect(() => {
    const mediaQueries = {
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      motionReduced: window.matchMedia('(prefers-reduced-motion: reduce)'),
      largeText: window.matchMedia('(prefers-reduced-motion: reduce)')
    };

    Object.entries(mediaQueries).forEach(([key, mq]) => {
      if (mq.matches) {
        setSettings(prev => ({ ...prev, [key]: true }));
      }
      
      mq.addEventListener('change', (e) => {
        setSettings(prev => ({ ...prev, [key]: e.matches }));
      });
    });

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', () => {});
      });
    };
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const announceToScreenReader = (message) => {
    if (settings.announcements) {
      const announcement = document.getElementById('sr-announcement');
      if (announcement) {
        announcement.textContent = message;
        setTimeout(() => {
          announcement.textContent = '';
        }, 1000);
      }
    }
  };

  const value = {
    ...settings,
    updateSetting,
    announceToScreenReader
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
