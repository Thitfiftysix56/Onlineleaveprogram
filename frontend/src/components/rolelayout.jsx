import {
  Box,
  Button,
  Typography,
} from '@mui/material';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  getCurrentUser,
  logoutUser,
} from '../utils/authstorage.js';

import {
  createAuditLog,
} from '../utils/auditlogstorage.js';

const roleRoutes = {
  employee: {
    Dashboard:
      '/employee/dashboard',

    'Leave Request':
      '/employee/leave-request',

    'My Requests':
      '/employee/my-requests',

    'Leave Balance':
      '/employee/leave-balance',

    Notification:
      '/employee/notifications',

    Profile:
      '/employee/profile',

    'Change Password':
      '/employee/change-password',
  },

  supervisor: {
    Dashboard:
      '/supervisor/dashboard',

    'Leave Request':
      '/supervisor/leave-request',

    'My Requests':
      '/supervisor/my-requests',

    'Leave Balance':
      '/supervisor/leave-balance',

    Approval:
      '/supervisor/approval',

    'Team Reports':
      '/supervisor/team-reports',

    Notification:
      '/supervisor/notifications',

    Profile:
      '/supervisor/profile',

    'Change Password':
      '/supervisor/change-password',
  },

  hr: {
    Dashboard:
      '/hr/dashboard',

    'Leave Request':
      '/hr/leave-request',

    'My Requests':
      '/hr/my-requests',

    'Leave Balance':
      '/hr/leave-balance',

    'Employee Management':
      '/hr/employee-management',

    'Leave Entitlement':
      '/hr/leave-entitlement',

    'Leave Type':
      '/hr/leave-types',

    'Holiday Management':
      '/hr/holiday-management',

    Reports:
      '/hr/reports',

    Notification:
      '/hr/notifications',

    Profile:
      '/hr/profile',

    'Change Password':
      '/hr/change-password',
  },

  admin: {
    Dashboard:
      '/admin/dashboard',

    'Leave Request':
      '/admin/leave-request',

    'My Requests':
      '/admin/my-requests',

    'Leave Balance':
      '/admin/leave-balance',

    'User Management':
      '/admin/user-management',

    'Department Management':
      '/admin/department-management',

    'Position Management':
      '/admin/position-management',

    'Audit Log':
      '/admin/audit-log',

    Notification:
      '/admin/notifications',

    Profile:
      '/admin/profile',

    'Change Password':
      '/admin/change-password',
  },
};

function RoleLayout({
  children,
  activeMenu = '',
  menuItems = [],
  theme,
}) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const pathSegments =
    location.pathname.split('/');

  const currentRole = [
    'employee',
    'supervisor',
    'hr',
    'admin',
  ].includes(pathSegments[1])
    ? pathSegments[1]
    : 'employee';

  const handleLogout = () => {
    const currentUser =
      getCurrentUser();

    try {
      if (currentUser) {
        createAuditLog({
          userId:
            currentUser.userId ||
            null,

          username:
            currentUser.username ||
            'unknown',

          role:
            currentUser.role ||
            currentRole,

          action:
            'logout',

          tableName:
            'auth_sessions',

          recordId:
            currentUser.userId ||
            null,

          detail:
            `${currentUser.username || 'User'} logged out of the system.`,

          ipAddress:
            '127.0.0.1',
        });
      }
    } catch (error) {
      console.error(
        'Unable to create logout audit log.',
        error,
      );
    } finally {
      logoutUser();

      navigate(
        '/login',
        {
          replace: true,
        },
      );
    }
  };

  const handleMenuClick = (
    menuItem,
  ) => {
    if (
      menuItem ===
      'Logout'
    ) {
      handleLogout();

      return;
    }

    const targetRoute =
      roleRoutes[
        currentRole
      ]?.[menuItem];

    if (!targetRoute) {
      window.alert(
        `Route for "${menuItem}" has not been configured yet.`,
      );

      return;
    }

    navigate(
      targetRoute,
    );
  };

  return (
    <Box
      sx={{
        width:
          '100%',

        minWidth:
          0,

        minHeight:
          '100vh',

        backgroundColor:
          '#F5F7FB',

        overflowX:
          'hidden',
      }}
    >
      <Box
        component="aside"
        sx={{
          width:
            '300px',

          height:
            '100vh',

          position:
            'fixed',

          top:
            0,

          left:
            0,

          zIndex:
            10,

          display: {
            xs:
              'none',

            md:
              'flex',
          },

          flexDirection:
            'column',

          backgroundColor:
            '#FFFFFF',

          borderRight:
            '1px solid #E5E7EB',

          overflowY:
            'auto',
        }}
      >
        <Box
          sx={{
            minHeight:
              '92px',

            flexShrink:
              0,

            padding:
              '24px',

            display:
              'flex',

            alignItems:
              'center',

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          <Typography
            sx={{
              color:
                '#111827',

              fontSize:
                '21px',

              fontWeight:
                800,
            }}
          >
            Leave Approval
          </Typography>
        </Box>

        <Box
          component="nav"
          sx={{
            flex:
              1,

            padding:
              '20px 16px',

            display:
              'flex',

            flexDirection:
              'column',

            gap:
              '8px',
          }}
        >
          {menuItems.map(
            (
              menuItem,
            ) => {
              const isActive =
                activeMenu ===
                menuItem;

              const isLogout =
                menuItem ===
                'Logout';

              return (
                <Button
                  key={
                    menuItem
                  }
                  type="button"
                  fullWidth
                  onClick={() =>
                    handleMenuClick(
                      menuItem,
                    )
                  }
                  sx={{
                    minHeight:
                      '46px',

                    padding:
                      '10px 16px',

                    justifyContent:
                      'flex-start',

                    backgroundColor:
                      isActive
                        ? theme.soft
                        : 'transparent',

                    color:
                      isLogout
                        ? '#DC2626'
                        : isActive
                          ? theme.primary
                          : '#374151',

                    borderRadius:
                      '8px',

                    fontSize:
                      '15px',

                    fontWeight:
                      isActive
                        ? 700
                        : 600,

                    textAlign:
                      'left',

                    textTransform:
                      'none',

                    whiteSpace:
                      'normal',

                    lineHeight:
                      1.4,

                    '&:hover':
                      {
                        backgroundColor:
                          isLogout
                            ? '#FEF2F2'
                            : theme.soft,

                        color:
                          isLogout
                            ? '#DC2626'
                            : theme.primary,
                      },
                  }}
                >
                  {menuItem}
                </Button>
              );
            },
          )}
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          width: {
            xs:
              '100%',

            md:
              'calc(100% - 300px)',
          },

          minWidth:
            0,

          minHeight:
            '100vh',

          marginLeft: {
            xs:
              0,

            md:
              '300px',
          },

          padding: {
            xs:
              '24px 18px',

            sm:
              '28px 24px',

            md:
              '32px',

            lg:
              '36px 40px',
          },

          overflowX:
            'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default RoleLayout;