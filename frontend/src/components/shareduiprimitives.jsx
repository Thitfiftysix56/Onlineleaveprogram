import { useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TableContainer,
  TableHead,
  TablePagination,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import {
  colorTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
} from '../theme/tokens.js';
import { Surface } from './sharedvisualfoundation.jsx';

const semanticAccents = {
  neutral: {
    main: colorTokens.text.muted,
    soft: colorTokens.surfaceSubtle,
    border: colorTokens.borderStrong,
  },
  info: colorTokens.status.info,
  cyan: {
    main: '#0E7490',
    soft: '#CFFAFE',
    border: '#67E8F9',
  },
  success: colorTokens.status.success,
  warning: colorTokens.status.warning,
  error: colorTokens.status.error,
};

const getAccent = (accent) =>
  semanticAccents[accent] || semanticAccents.neutral;

export function StatCard({
  title,
  value,
  supportingText,
  icon,
  accent = 'neutral',
  compactInline = false,
  unit,
  onClick,
  sx,
  ...props
}) {
  const accentStyle = getAccent(accent);
  const interactiveProps = onClick
    ? { component: 'button', type: 'button', onClick }
    : {};

  return (
    <Surface
      {...props}
      {...interactiveProps}
      padding={compactInline ? 18 : spacingTokens.xl}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: compactInline ? 72 : 116,
        overflow: 'hidden',
        textAlign: 'left',
        font: 'inherit',
        color: 'inherit',
        borderColor: accentStyle.border,
        backgroundColor: accent === 'neutral'
          ? '#FFFFFF'
          : `color-mix(in srgb, ${accentStyle.soft} 54%, #FFFFFF)`,
        borderRadius: `${radiusTokens.surface}px`,
        boxShadow: shadowTokens.none,
        transition: 'background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          insetBlockStart: 0,
          insetInline: 0,
          height: 3,
          backgroundColor: accentStyle.main,
        },
        ...(onClick && {
          cursor: 'pointer',
          '&:hover': {
            borderColor: accentStyle.border,
            boxShadow: shadowTokens.subtle,
          },
          '&:focus-visible': {
            outline: `3px solid ${accentStyle.soft}`,
            outlineOffset: 2,
            borderColor: accentStyle.main,
          },
        }),
        ...sx,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          width: 112,
          height: 112,
          insetBlockStart: -58,
          insetInlineEnd: -42,
          borderRadius: '50%',
          backgroundColor: accentStyle.soft,
          opacity: 0.52,
        }}
      />
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Box sx={{ minWidth: 0, width: compactInline ? '100%' : 'auto', display: compactInline ? 'flex' : 'block', alignItems: 'baseline', justifyContent: compactInline ? 'space-between' : 'initial', gap: compactInline ? '16px' : 0 }}>
          <Typography
            variant="body2"
            noWrap={compactInline}
            sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}
          >
            {title}
          </Typography>
          <Typography
            component="p"
            sx={{
              color: accent === 'neutral' ? colorTokens.text.primary : accentStyle.main,
              fontSize: compactInline ? '1.125rem' : '1.75rem',
              fontWeight: 700,
              lineHeight: 1.25,
              marginTop: compactInline ? 0 : `${spacingTokens.sm}px`,
              whiteSpace: compactInline ? 'nowrap' : 'normal',
            }}
          >
            {value}{unit ? ` ${unit}` : ''}
          </Typography>
          {supportingText && !compactInline ? (
            <Typography
              variant="body2"
              sx={{
                color: colorTokens.text.muted,
                marginTop: `${spacingTokens.xs}px`,
              }}
            >
              {supportingText}
            </Typography>
          ) : null}
        </Box>
        {icon ? (
          <Box
            aria-hidden="true"
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: '13px',
              color: accentStyle.main,
              backgroundColor: accentStyle.soft,
              border: `1px solid ${accentStyle.border}`,
              boxShadow: 'none',
            }}
          >
            {icon}
          </Box>
        ) : null}
      </Stack>
    </Surface>
  );
}

export function DashboardTablePagination({ count, page, onPageChange }) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={5}
      onRowsPerPageChange={() => {}}
      rowsPerPageOptions={[5]}
      labelRowsPerPage=""
      labelDisplayedRows={() =>
        `หน้า ${page + 1} จาก ${Math.max(1, Math.ceil(count / 5))}`
      }
      sx={{
        borderTop: 0,
        color: '#4B5563',
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input': { display: 'none' },
        '& .MuiTablePagination-displayedRows': { fontSize: '12px' },
        '& .MuiTablePagination-toolbar': { minHeight: '50px', paddingInline: { xs: '10px', sm: '16px' } },
        '& .MuiTablePagination-actions .MuiIconButton-root': { width: '32px', height: '32px', border: 'none' },
      }}
    />
  );
}

export const SummaryCard = StatCard;

export function ConfirmationDialog({ open, title, description, confirmLabel = 'ยืนยัน', loading = false, tone = 'error', onCancel, onConfirm }) {
  return (
    <DialogShell
      open={open}
      onClose={() => !loading && onCancel?.()}
      title={title}
      description={description}
      destructive={tone === 'error'}
      actions={(
        <>
        <Button type="button" variant="outlined" color="secondary" disabled={loading} onClick={onCancel}>ยกเลิก</Button>
        <Button type="button" variant="contained" color={tone} disabled={loading} onClick={onConfirm}>
          {loading ? 'กำลังบันทึก...' : confirmLabel}
        </Button>
        </>
      )}
    />
  );
}

export function DataListToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'ค้นหา',
  filters,
  activeFilters = [],
  resultLabel,
  sx,
}) {
  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        gap={`${spacingTokens.lg}px`}
        sx={{ columnGap: `${spacingTokens.lg}px`, rowGap: `${spacingTokens.md}px` }}
      >
        <TextField
          size="small"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.target.blur();
            }
          }}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: colorTokens.text.muted, fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchValue ? (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    size="small"
                    aria-label="ล้างคำค้นหา"
                    onClick={() => onSearchChange?.('')}
                    sx={{ width: 30, height: 30 }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            width: { xs: '100%', md: 360 },
            flexShrink: 0,
            '& .MuiOutlinedInput-root': { height: 44, backgroundColor: '#FFFFFF' },
          }}
        />
        {filters ? (
          <Stack
            direction="row"
            gap={`${spacingTokens.lg}px`}
            useFlexGap
            flexWrap="wrap"
            sx={{
              flex: 1,
              width: { xs: '100%', md: 'auto' },
              columnGap: `${spacingTokens.lg}px`,
              rowGap: `${spacingTokens.md}px`,
              '& .MuiFormControl-root': {
                minWidth: { xs: 0, sm: 176 },
                flex: { xs: '1 1 calc(50% - 8px)', sm: '0 1 196px' },
              },
              '& .MuiOutlinedInput-root': { height: 44, backgroundColor: '#FFFFFF' },
              '& .MuiSelect-select': {
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
                paddingRight: '36px !important',
                lineHeight: 1.4,
              },
            }}
          >
            {filters}
          </Stack>
        ) : null}
      </Stack>

      {resultLabel || activeFilters.length > 0 ? <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={`${spacingTokens.sm}px`}
        sx={{ marginTop: `${spacingTokens.md}px`, minHeight: 28 }}
      >
        <Typography variant="body2" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
          {resultLabel}
        </Typography>
        {activeFilters.length > 0 ? (
          <Stack direction="row" alignItems="center" gap={`${spacingTokens.xs}px`} useFlexGap flexWrap="wrap">
            {activeFilters.map((filter) => (
              <Chip
                key={filter.key || filter.label}
                size="small"
                label={filter.label}
                onDelete={filter.onDelete}
                sx={{ backgroundColor: 'var(--role-hover, #F1F5F9)', color: colorTokens.text.secondary }}
              />
            ))}
          </Stack>
        ) : null}
      </Stack> : null}
    </Box>
  );
}

export function RowActionMenu({ actions, label = 'การดำเนินการ' }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const availableActions = actions.filter(Boolean);

  if (availableActions.length === 0) return null;

  const closeMenu = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        type="button"
        size="small"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        onClick={(event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
        sx={{
          width: 36,
          height: 36,
          color: colorTokens.text.secondary,
          '&:hover': { backgroundColor: colorTokens.surfaceSubtle },
          '&:focus-visible': { outline: `2px solid ${colorTokens.status.info.main}`, outlineOffset: 1 },
        }}
      >
        <MoreVertRoundedIcon sx={{ fontSize: 20 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        slotProps={{ paper: { sx: { minWidth: 156, padding: '4px', borderRadius: `${radiusTokens.surface}px`, boxShadow: shadowTokens.floating } } }}
      >
        {availableActions.map((action) => (
          <MenuItem
            key={action.label}
            disabled={action.disabled}
            onClick={(event) => {
              event.stopPropagation();
              closeMenu();
              action.onClick();
            }}
            sx={{
              minHeight: 38,
              borderRadius: `${radiusTokens.control}px`,
              color: action.tone === 'danger' ? colorTokens.status.error.main : action.tone === 'success' ? colorTokens.status.success.main : colorTokens.text.primary,
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function TableShell({ children, sx, ...props }) {
  return (
    <Surface
      padding={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderColor: colorTokens.border,
        boxShadow: shadowTokens.subtle,
        ...sx,
      }}
    >
      <TableContainer {...props} sx={{ width: '100%', overflowX: 'auto' }}>
        {children}
      </TableContainer>
    </Surface>
  );
}

export function TableHeader({ children, sx, ...props }) {
  return (
    <TableHead
      {...props}
      sx={{
        '& .MuiTableCell-head': {
          height: 44,
          whiteSpace: 'nowrap',
          backgroundColor: '#EEF3F8',
          color: colorTokens.text.primary,
          fontWeight: 600,
        },
        ...sx,
      }}
    >
      {children}
    </TableHead>
  );
}

export function RowActions({ children, sx, ...props }) {
  return (
    <Stack
      {...props}
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      gap={`${spacingTokens.xs}px`}
      sx={{
        whiteSpace: 'nowrap',
        '& .MuiButton-root': {
          minWidth: 0,
          minHeight: 32,
          paddingInline: `${spacingTokens.md}px`,
        },
        '& .MuiIconButton-root': {
          width: 36,
          height: 36,
        },
        '@media (max-width: 600px)': {
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          '& .MuiButton-root': {
            flex: '0 0 auto',
          },
        },
        ...sx,
      }}
    >
      {children}
    </Stack>
  );
}

export function FormSection({
  title,
  description,
  children,
  actions,
  contained = false,
  sx,
  ...props
}) {
  const Wrapper = contained ? Surface : Box;
  const wrapperProps = contained
    ? { padding: spacingTokens['2xl'] }
    : {};

  return (
    <Wrapper
      {...props}
      {...wrapperProps}
      component="section"
      sx={sx}
    >
      {title || description || actions ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          gap={`${spacingTokens.lg}px`}
          sx={{ marginBottom: `${spacingTokens.xl}px` }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title ? (
              <Typography component="h2" variant="h6">
                {title}
              </Typography>
            ) : null}
            {description ? (
              <Typography
                variant="body2"
                sx={{
                  color: colorTokens.text.secondary,
                  marginTop: title ? `${spacingTokens.xs}px` : 0,
                  maxWidth: '72ch',
                }}
              >
                {description}
              </Typography>
            ) : null}
          </Box>
          {actions ? <Box sx={{ flexShrink: 0 }}>{actions}</Box> : null}
        </Stack>
      ) : null}
      <Stack gap={`${spacingTokens.xl}px`}>{children}</Stack>
    </Wrapper>
  );
}

const statusStyles = {
  draft: semanticAccents.neutral,
  pending: semanticAccents.warning,
  approved: semanticAccents.success,
  rejected: semanticAccents.error,
  cancelled: semanticAccents.error,
};

export function StatusChip({ status, label, sx, ...props }) {
  const normalizedStatus = String(status || '').trim().toLowerCase();
  const visualStyle = statusStyles[normalizedStatus] || semanticAccents.neutral;

  return (
    <Chip
      {...props}
      label={label ?? status}
      size="small"
      variant="outlined"
      sx={{
        color: visualStyle.main,
        backgroundColor: visualStyle.soft,
        borderColor: visualStyle.border,
        fontWeight: 700,
        ...sx,
      }}
    />
  );
}

const stateDefaults = {
  empty: {
    icon: <InboxOutlinedIcon />,
    color: colorTokens.text.muted,
  },
  loading: {
    icon: <CircularProgress size={24} thickness={4} />,
    color: colorTokens.status.info.main,
  },
  error: {
    icon: <ErrorOutlineRoundedIcon />,
    color: colorTokens.status.error.main,
  },
};

export function StatePresentation({
  variant = 'empty',
  icon,
  title,
  supportingText,
  action,
  compact = false,
  sx,
  ...props
}) {
  const state = stateDefaults[variant] || stateDefaults.empty;

  return (
    <Stack
      {...props}
      role={variant === 'error' ? 'alert' : 'status'}
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      gap={`${spacingTokens.sm}px`}
      sx={{
        minHeight: compact ? 144 : 220,
        padding: `${compact ? spacingTokens.xl : spacingTokens['3xl']}px`,
        color: colorTokens.text.secondary,
        ...sx,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          display: 'grid',
          placeItems: 'center',
          width: 44,
          height: 44,
          color: state.color,
          '& .MuiSvgIcon-root': { fontSize: 28 },
        }}
      >
        {icon ?? state.icon}
      </Box>
      {title ? (
        <Typography variant="subtitle1" sx={{ color: colorTokens.text.primary }}>
          {title}
        </Typography>
      ) : null}
      {supportingText ? (
        <Typography variant="body2" sx={{ maxWidth: '52ch' }}>
          {supportingText}
        </Typography>
      ) : null}
      {action ? <Box sx={{ marginTop: `${spacingTokens.sm}px` }}>{action}</Box> : null}
    </Stack>
  );
}

export function EmptyState(props) {
  return <StatePresentation {...props} variant="empty" />;
}

export function LoadingState(props) {
  return <StatePresentation {...props} variant="loading" />;
}

export function ErrorState(props) {
  return <StatePresentation {...props} variant="error" />;
}

export function EmptyTableState(props) {
  return <EmptyState {...props} compact />;
}

export function DialogShell({
  title,
  description,
  children,
  actions,
  destructive = false,
  maxWidth = 'sm',
  ...props
}) {
  return (
    <Dialog
      {...props}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{
        sx: {
          width: { xs: 'calc(100% - 32px)', sm: '100%' },
          margin: `${spacingTokens.lg}px`,
          border: `1px solid ${
            destructive ? colorTokens.status.error.border : colorTokens.border
          }`,
          borderRadius: `${radiusTokens.dialog}px`,
          boxShadow: shadowTokens.floating,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: destructive
            ? colorTokens.status.error.main
            : colorTokens.text.primary,
          padding: `${spacingTokens['2xl']}px ${spacingTokens['2xl']}px ${spacingTokens.sm}px`,
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent
        sx={{
          padding: `${spacingTokens.md}px ${spacingTokens['2xl']}px ${spacingTokens['2xl']}px`,
        }}
      >
        {description ? (
          <DialogContentText sx={{ marginBottom: children ? `${spacingTokens.xl}px` : 0 }}>
            {description}
          </DialogContentText>
        ) : null}
        {children}
      </DialogContent>
      {actions ? (
        <DialogActions
          sx={{
            gap: `${spacingTokens.sm}px`,
            padding: `${spacingTokens.lg}px ${spacingTokens['2xl']}px ${spacingTokens['2xl']}px`,
            borderTop: 0,
          }}
        >
          {actions}
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
