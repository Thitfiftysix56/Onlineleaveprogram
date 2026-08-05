import {
  useEffect,
  useState,
} from 'react';

import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';

import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import api from '../api/axios.js';

import {
  clearAuthSession,
  getDashboardPathByRole,
  saveBackendAuthSession,
} from '../utils/authstorage.js';

function ProtectedRoute({
  allowedRoles = [],
}) {
  const location =
    useLocation();

  const [
    session,
    setSession,
  ] = useState(null);

  const [
    isCheckingSession,
    setIsCheckingSession,
  ] = useState(true);

  const [
    authError,
    setAuthError,
  ] = useState('');

  useEffect(() => {
    let isActive = true;

    const restoreSession =
      async () => {
        setIsCheckingSession(true);
        setAuthError('');

        try {
          const response =
            await api.get(
              '/auth/me',
            );

          if (
            response.data?.status !==
              'ok' ||
            !response.data?.user
          ) {
            throw new Error(
              response.data?.message ||
                'Unable to verify the current session.',
            );
          }

          const restoredSession =
            saveBackendAuthSession(
              response.data.user,
            );

          if (isActive) {
            setSession(
              restoredSession,
            );
          }
        } catch (error) {
          clearAuthSession();

          if (isActive) {
            setSession(null);

            setAuthError(
              error.response?.data
                ?.message ||
                'Please sign in to continue.',
            );
          }
        } finally {
          if (isActive) {
            setIsCheckingSession(
              false,
            );
          }
        }
      };

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  if (isCheckingSession) {
    return (
      <Box
        sx={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'center',
          flexDirection:
            'column',
          gap: '16px',
          backgroundColor:
            '#F5F7FB',
        }}
      >
        <CircularProgress />

        <Typography
          sx={{
            color: '#6B7280',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Verifying your session...
        </Typography>
      </Box>
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,

          authError:
            authError ||
            'Please sign in to continue.',
        }}
      />
    );
  }

  const currentRole =
    String(
      session.role || '',
    )
      .trim()
      .toLowerCase();

  const normalizedAllowedRoles =
    allowedRoles.map(
      (role) =>
        String(role)
          .trim()
          .toLowerCase(),
    );

  const hasPermission =
    normalizedAllowedRoles.length ===
      0 ||
    normalizedAllowedRoles.includes(
      currentRole,
    );

  const changePasswordPath =
    `/${currentRole}/change-password`;

  if (
    session.mustChangePassword &&
    location.pathname !==
      changePasswordPath
  ) {
    return (
      <Navigate
        to={changePasswordPath}
        replace
      />
    );
  }

  if (!hasPermission) {
    return (
      <Navigate
        to={getDashboardPathByRole(
          currentRole,
        )}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
