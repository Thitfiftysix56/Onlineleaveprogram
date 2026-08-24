import {
  Box,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import {
  colorTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
} from '../theme/tokens.js';

export function PageContainer({
  children,
  maxWidth = 1280,
  sx,
  ...props
}) {
  return (
    <Box
      {...props}
      sx={{
        width: '100%',
        maxWidth,
        marginInline: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: `${spacingTokens['2xl']}px`,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  sx,
  ...props
}) {
  return (
    <Stack
      {...props}
      component="header"
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      justifyContent="space-between"
      gap={`${spacingTokens.lg}px`}
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        ...sx,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="h1"
          variant="h2"
          sx={{ color: colorTokens.text.primary }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body1"
            sx={{
              color: colorTokens.text.secondary,
              marginTop: `${spacingTokens.xs}px`,
              maxWidth: '72ch',
            }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? (
  <Box
    sx={{
      flexShrink: 0,
      width: { xs: '100%', sm: 'auto' },
      marginLeft: { xs: 0, sm: 'auto' },
      '& > *': {
        maxWidth: '100%',
      },
    }}
  >
    {actions}
  </Box>
) : null}
    </Stack>
  );
}

const surfaceVariants = {
  default: {
    backgroundColor: '#FCFDFE',
    borderColor: colorTokens.border,
    boxShadow: shadowTokens.none,
  },
  subtle: {
    backgroundColor: colorTokens.surfaceSubtle,
    borderColor: colorTokens.border,
    boxShadow: shadowTokens.none,
  },
  elevated: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.border,
    boxShadow: shadowTokens.floating,
  },
};

export function Surface({
  children,
  variant = 'default',
  padding = spacingTokens['2xl'],
  sx,
  ...props
}) {
  const visualStyle =
    surfaceVariants[variant] ||
    surfaceVariants.default;

  return (
    <Paper
      {...props}
      variant="outlined"
      sx={{
        ...visualStyle,
        borderRadius: `${radiusTokens.surface}px`,
        padding: `${padding}px`,
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}
