import { createTheme } from '@mui/material/styles';

import {
  colorTokens,
  radiusTokens,
  roleAccentTokens,
  shadowTokens,
  spacingTokens,
} from './tokens.js';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: roleAccentTokens.employee.primary,
      dark: roleAccentTokens.employee.dark,
      light: roleAccentTokens.employee.soft,
      contrastText: colorTokens.text.inverse,
    },
    success: {
      main: colorTokens.status.success.main,
      light: colorTokens.status.success.soft,
    },
    warning: {
      main: colorTokens.status.warning.main,
      light: colorTokens.status.warning.soft,
    },
    error: {
      main: colorTokens.status.error.main,
      light: colorTokens.status.error.soft,
    },
    info: {
      main: colorTokens.status.info.main,
      light: colorTokens.status.info.soft,
    },
    background: {
      default: colorTokens.background,
      paper: colorTokens.surface,
    },
    text: {
      primary: colorTokens.text.primary,
      secondary: colorTokens.text.secondary,
      disabled: colorTokens.text.disabled,
    },
    divider: colorTokens.border,
    action: {
      hover: colorTokens.surfaceSubtle,
      selected: roleAccentTokens.employee.soft,
      disabled: colorTokens.text.disabled,
      disabledBackground: '#E9EEF5',
    },
  },

  typography: {
    fontFamily:
      "'IBM Plex Sans Thai', 'IBM Plex Sans', 'Noto Sans Thai', system-ui, 'Segoe UI', sans-serif",
    htmlFontSize: 16,
    fontSize: 15,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.45,
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: colorTokens.text.primary,
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.55,
    },
    subtitle1: {
      fontSize: '0.9375rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    subtitle2: {
      fontSize: '0.8125rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.6,
      color: colorTokens.text.muted,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.04em',
      textTransform: 'none',
    },
  },

  shape: {
    borderRadius: radiusTokens.control,
  },

  shadows: [
    shadowTokens.none,
    shadowTokens.subtle,
    shadowTokens.subtle,
    shadowTokens.floating,
    shadowTokens.floating,
    ...Array(20).fill(shadowTokens.floating),
  ],

  tokens: {
    colors: colorTokens,
    roles: roleAccentTokens,
    spacing: spacingTokens,
    radius: radiusTokens,
    shadows: shadowTokens,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colorTokens.background,
          color: colorTokens.text.primary,
          lineHeight: 1.7,
          WebkitFontSmoothing: 'antialiased',
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: radiusTokens.control,
          paddingInline: spacingTokens.lg,
          boxShadow: shadowTokens.none,
          transition:
            'background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease, opacity 180ms ease, transform 180ms ease',
          '&:focus-visible': {
            outline: '3px solid currentColor',
            outlineOffset: 2,
          },
          '&.Mui-disabled': {
            opacity: 0.62,
          },
          '&.MuiButton-sizeSmall': {
            minHeight: 34,
            paddingInline: spacingTokens.md,
            fontSize: '0.8125rem',
          },
        },
        outlined: {
          color: colorTokens.text.secondary,
          borderColor: colorTokens.border,
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
          '&:hover': {
            color: colorTokens.text.primary,
            borderColor: 'var(--role-border, #CBD5E1)',
            backgroundColor: '#FFFFFF',
          },
        },
        containedPrimary: {
          background: '#2563EB',
          boxShadow: 'none',
          '&:hover': {
            background: '#1D4ED8',
            boxShadow: 'none',
          },
        },
        textError: {
          color: colorTokens.status.error.main,
          '&:hover': {
            backgroundColor: colorTokens.status.error.soft,
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.control,
          transition:
            'background-color 180ms ease, color 180ms ease, box-shadow 180ms ease, opacity 180ms ease, transform 180ms ease',
          '&:hover': {
            backgroundColor: 'var(--role-hover, #F1F5F9)',
          },
          '&:focus-visible': {
            outline: '3px solid currentColor',
            outlineOffset: 2,
          },
          '&.Mui-disabled': {
            opacity: 0.55,
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        size: 'medium',
      },
    },

    MuiSelect: {
      styleOverrides: {
        select: {
          minHeight: 'auto',
          display: 'flex',
          alignItems: 'center',
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          lineHeight: 1.6,
        },
        input: {
          '&::placeholder': {
            color: colorTokens.text.muted,
            opacity: 1,
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.control,
          backgroundColor: '#FFFFFF',
          transition: 'background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--role-border, #CBD5E1)',
          },
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
            boxShadow: '0 0 0 3px var(--role-focus, rgba(37, 99, 235, 0.10))',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--role-primary, #2563EB)',
            borderWidth: 1,
          },
        },
        notchedOutline: {
          borderColor: '#CBD5E1',
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 600,
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          fontWeight: 500,
          lineHeight: 1.6,
        },
      },
    },

    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
        },
        outlined: {
          borderColor: colorTokens.border,
        },
      },
    },

    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.surface,
          border: `1px solid ${colorTokens.border}`,
          boxShadow: shadowTokens.none,
          backgroundColor: '#FFFFFF',
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radiusTokens.dialog,
          boxShadow: shadowTokens.floating,
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.125rem',
          fontWeight: 600,
          lineHeight: 1.45,
        },
      },
    },

    MuiDialogContentText: {
      styleOverrides: {
        root: {
          color: colorTokens.text.secondary,
          fontSize: '0.875rem',
          lineHeight: 1.7,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.pill,
          fontWeight: 600,
        },
        label: {
          fontSize: '0.75rem',
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: colorTokens.border,
          color: colorTokens.text.secondary,
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          padding: `${spacingTokens.lg}px ${spacingTokens.lg}px`,
        },
        head: {
          backgroundColor: '#EEF3F8',
          color: colorTokens.text.primary,
          fontWeight: 700,
          height: 44,
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': {
            backgroundColor: 'var(--role-row-hover, #F1F5F9)',
          },
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: 'var(--role-hover, #EAF2FF)',
          },
        },
      },
    },

    MuiTablePagination: {
      styleOverrides: {
        root: {
          color: colorTokens.text.secondary,
          borderTop: `1px solid ${colorTokens.border}`,
        },
        toolbar: {
          minHeight: 50,
          paddingInline: spacingTokens.lg,
        },
        selectLabel: { fontSize: '0.75rem' },
        displayedRows: { fontSize: '0.75rem' },
        actions: {
          '& .MuiIconButton-root': {
            width: 34,
            height: 34,
            borderRadius: radiusTokens.control,
          },
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          lineHeight: 1.6,
          '&:focus-visible': {
            outline: '3px solid currentColor',
            outlineOffset: -3,
          },
        },
      },
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.control,
          '&:focus-visible': {
            outline: '3px solid currentColor',
            outlineOffset: 2,
          },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.surface,
        },
        message: {
          fontSize: '0.8125rem',
          lineHeight: 1.65,
        },
      },
    },

    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
      styleOverrides: {
        tooltip: {
          backgroundColor: colorTokens.text.primary,
          borderRadius: radiusTokens.control,
          fontSize: '0.75rem',
          lineHeight: 1.5,
        },
        arrow: {
          color: colorTokens.text.primary,
        },
      },
    },
  },
});

export default theme;
