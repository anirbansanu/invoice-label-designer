import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { CanvasProvider } from './context/CanvasContext';
import { ThemeProvider } from './context/ThemeContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import reportWebVitals from './reportWebVitals';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles/App.css';
import './styles/themes.css';
import './styles/accessibility.css';
import './styles/responsive.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AccessibilityProvider>
      <ThemeProvider>
        <CanvasProvider>
          <App />
        </CanvasProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
