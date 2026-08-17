import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import {
  createTheme,
  ThemeProvider,
} from '@mui/material/styles';

import App from './App.jsx';
import ApplicationErrorBoundary from './components/applicationerrorboundary.jsx';
import './index.css';
import { installThaiUi } from './i18n/thai.js';

const theme = createTheme({
  typography: {
    fontFamily:
      "'Prompt', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    htmlFontSize: 16,
    fontSize: 15,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    h1: {
      fontSize: '1.875rem',
      fontWeight: 800,
      lineHeight: 1.35,
    },
    h2: {
      fontSize: '1.375rem',
      fontWeight: 800,
      lineHeight: 1.4,
    },
    h3: {
      fontSize: '1.125rem',
      fontWeight: 700,
      lineHeight: 1.45,
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.65,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 700,
      lineHeight: 1.5,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          lineHeight: 1.7,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem !important',
          fontWeight: 700,
          lineHeight: 1.5,
          transition:
            'background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease, opacity 180ms ease',
          '&:focus-visible': {
            outline: '3px solid currentColor',
            outlineOffset: '2px',
          },
          '&.Mui-disabled': {
            opacity: 0.62,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition:
            'background-color 180ms ease, color 180ms ease, box-shadow 180ms ease, opacity 180ms ease',
          '&:focus-visible': {
            outline: '3px solid currentColor',
            outlineOffset: '2px',
          },
          '&.Mui-disabled': {
            opacity: 0.55,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem !important',
          lineHeight: 1.6,
          transition:
            'background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          transition:
            'border-color 180ms ease, border-width 180ms ease',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem !important',
          fontWeight: 600,
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem !important',
          fontWeight: 500,
          lineHeight: 1.6,
          color: '#475569',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem !important',
          lineHeight: 1.6,
          color: '#334155',
        },
        head: {
          fontWeight: 700,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 180ms ease',
          '&.MuiTableRow-hover:hover': {
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem !important',
          lineHeight: 1.6,
          transition:
            'background-color 180ms ease, color 180ms ease',
          '&:focus-visible': {
            outline: '3px solid currentColor',
            outlineOffset: '-3px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        label: {
          fontSize: '0.75rem !important',
          fontWeight: 700,
          lineHeight: 1.5,
          transition:
            'background-color 180ms ease, color 180ms ease, border-color 180ms ease',
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          transition:
            'background-color 180ms ease, color 180ms ease, border-color 180ms ease',
          '&:focus-visible': {
            outline: '3px solid currentColor',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        message: {
          fontSize: '0.8125rem !important',
          lineHeight: 1.65,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.125rem',
          fontWeight: 800,
          lineHeight: 1.45,
        },
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          lineHeight: 1.7,
        },
      },
    },
  },
});

installThaiUi();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <ApplicationErrorBoundary>
          <App />
        </ApplicationErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
