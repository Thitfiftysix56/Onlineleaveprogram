import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import {
  ThemeProvider,
} from '@mui/material/styles';

import App from './App.jsx';
import ApplicationErrorBoundary from './components/applicationerrorboundary.jsx';
import ServerUnavailableOverlay from './components/serverunavailableoverlay.jsx';
import './index.css';
import { installThaiUi } from './i18n/thai.js';
import theme from './theme/theme.js';

installThaiUi();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <ApplicationErrorBoundary>
          <ServerUnavailableOverlay />
          <App />
        </ApplicationErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
