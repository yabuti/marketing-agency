import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { LangProvider } from './LangContext';
import { ThemeProvider } from './ThemeContext';
import { SiteSettingsProvider } from './SiteSettingsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SiteSettingsProvider>
    <ThemeProvider>
      <LangProvider>
        <App />
      </LangProvider>
    </ThemeProvider>
  </SiteSettingsProvider>
);