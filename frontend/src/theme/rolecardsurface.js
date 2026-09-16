import {
  radiusTokens,
  shadowTokens,
} from './tokens.js';

export const roleDashboardCardSurfaceSx = {
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 76%, var(--role-soft, #EFF6FF) 100%)',
  border: '1px solid #E2E8F0',
  borderRadius: `${radiusTokens.surface}px`,
  boxShadow: shadowTokens.subtle,
  boxSizing: 'border-box',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: 164,
    height: 164,
    top: -78,
    right: -54,
    borderRadius: '50%',
    backgroundColor: 'var(--role-primary, #2563EB)',
    opacity: 0.055,
    filter: 'blur(4px)',
    pointerEvents: 'none',
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
  '& > .MuiBox-root:first-of-type': {
    background: 'transparent !important',
    borderBottom: '0 !important',
  },
  '& > .MuiBox-root:last-of-type': {
    borderTop: '0 !important',
  },
};
