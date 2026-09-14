import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';

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
        paddingBlock: 0,
        marginBottom: {
          xs: '20px',
          sm: '24px',
        },
        ...sx,
      }}
    >
      {title ? (
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h1"
            sx={{
              color: colorTokens.text.primary,
              fontSize: {
                xs: '26px',
                sm: '30px',
              },
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: '-0.025em',
            }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="body1"
              sx={{
                color: colorTokens.text.secondary,
                marginTop: `${spacingTokens.sm}px`,
                maxWidth: '72ch',
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      ) : null}
      {actions ? (
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
            marginLeft: { xs: 0, sm: 'auto' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'flex-end', sm: 'flex-start' },
            gap: `${spacingTokens.sm}px`,
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

export function HeaderlessPageTopOffset({ sx, ...props }) {
  return (
    <Box
      {...props}
      aria-hidden="true"
      sx={{
        height: {
          xs: '12px',
          sm: '20px',
        },
        flexShrink: 0,
        ...sx,
      }}
    />
  );
}

export function BackButton({ children = 'กลับ', sx, ...props }) {
  return (
    <Button
      {...props}
      type="button"
      size="small"
      variant="outlined"
      startIcon={<ArrowBackRounded sx={{ fontSize: 18 }} />}
      sx={{
        minWidth: 0,
        minHeight: 38,
        paddingInline: `${spacingTokens.lg}px`,
        color: colorTokens.text.secondary,
        borderColor: colorTokens.borderStrong,
        backgroundColor: '#FFFFFF',
        borderRadius: `${radiusTokens.control}px`,
        boxShadow: shadowTokens.none,
        '&:hover': {
          color: '#374151',
          borderColor: '#94A3B8',
          backgroundColor: colorTokens.surfaceSubtle,
          transform: 'translateY(-1px)',
        },
        '&:active': { transform: 'translateY(0)' },
        '&:focus-visible': {
          outline: '3px solid #E2E8F0',
          outlineOffset: 2,
          borderColor: '#64748B',
        },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}

export function CompactSummaryCard({
  title,
  value,
  color = '#2563EB',
  background,
  glowColor,
  sx,
  ...props
}) {
  return (
    <Paper
      {...props}
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: `${spacingTokens.sm}px`,
        minHeight: 72,
        padding: `${spacingTokens.xl}px`,
        background:
          background ||
          `linear-gradient(135deg, ${color}14 0%, #FFFFFF 78%)`,
        border: `1px solid ${color}2E`,
        borderRadius: `${radiusTokens.surface}px`,
        boxShadow: shadowTokens.subtle,
        boxSizing: 'border-box',
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 118,
          height: 118,
          top: -47,
          right: -38,
          borderRadius: '50%',
          backgroundColor: glowColor || `${color}24`,
          filter: 'blur(3px)',
          pointerEvents: 'none',
        },
        ...sx,
      }}
    >
      <Typography
        noWrap
        sx={{
          position: 'relative',
          zIndex: 1,
          minWidth: 0,
          color: colorTokens.text.primary,
          fontSize: 15,
          fontWeight: 600,
          lineHeight: 1.4,
        }}
      >
        {title}
      </Typography>
      <Typography
        noWrap
        sx={{
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
          color,
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

export function InlineListSummary({ items = [], sx, ...props }) {
  if (!items.length) return null;

  return (
    <Stack
      {...props}
      direction="row"
      alignItems="center"
      useFlexGap
      flexWrap="wrap"
      sx={{
        columnGap: `${spacingTokens.sm}px`,
        rowGap: `${spacingTokens.sm}px`,
        marginBottom: `${spacingTokens.lg}px`,
        color: colorTokens.text.secondary,
        ...sx,
      }}
    >
      {items.map((item) => (
        <Box
          key={item.title || item.label}
          sx={{
            display: 'inline-flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: `${spacingTokens.md}px`,
            minHeight: 48,
            minWidth: { xs: '100%', sm: 164 },
            flex: { xs: '1 1 100%', sm: '0 1 auto' },
            padding: `${spacingTokens.sm}px ${spacingTokens.lg}px`,
            border: `1px solid ${colorTokens.border}`,
            borderRadius: `${radiusTokens.control}px`,
            background: '#FFFFFF',
            boxSizing: 'border-box',
          }}
        >
          <Typography sx={{ color: colorTokens.text.secondary, fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>
            {item.title || item.label}
          </Typography>
          <Typography sx={{ color: item.valueColor || item.color || colorTokens.text.primary, fontSize: 18, fontWeight: 700, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
            {item.value}{item.unit ? ` ${item.unit}` : ''}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

const surfaceVariants = {
  default: {
    backgroundColor: '#FFFFFF',
    borderColor: colorTokens.border,
    boxShadow: shadowTokens.none,
  },
  subtle: {
    backgroundColor: colorTokens.surfaceSubtle,
    borderColor: colorTokens.border,
    boxShadow: shadowTokens.none,
  },
  elevated: {
    backgroundColor: '#FFFFFF',
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
        boxSizing: 'border-box',
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}
