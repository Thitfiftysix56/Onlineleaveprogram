import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';

import {
  AddCircleOutlineRounded,
  AssessmentRounded,
  BadgeRounded,
  CalendarMonthRounded,
  CategoryRounded,
  CloseRounded,
  DashboardRounded,
  DescriptionRounded,
  EventAvailableRounded,
  FactCheckRounded,
  GroupsRounded,
  HistoryRounded,
  LockOutlined,
  LogoutRounded,
  ManageAccountsRounded,
  MenuRounded,
  NotificationsNoneRounded,
  PersonOutlineRounded,
  WorkOutlineRounded,
} from '@mui/icons-material';

import {
  useEffect,
  useState,
} from 'react';

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

const menuLabels = {
  Dashboard:
    'แดชบอร์ด',

  'Leave Request':
    'ยื่นคำขอลา',

  'My Requests':
    'คำขอของฉัน',

  'Leave Balance':
    'สิทธิ์การลา',

  Approval:
    'รายการรออนุมัติ',

  'Team Reports':
    'รายงานทีม',

  'Employee Management':
    'จัดการพนักงาน',

  'Leave Entitlement':
    'จัดการสิทธิ์การลา',

  'Leave Type':
    'จัดการประเภทการลา',

  'Holiday Management':
    'จัดการวันหยุด',

  Reports:
    'รายงานการลา',

  'User Management':
    'จัดการผู้ใช้งาน',

  'Department Management':
    'จัดการแผนก',

  'Position Management':
    'จัดการตำแหน่ง',

  'Audit Log':
    'ประวัติการใช้งาน',

  Notification:
    'การแจ้งเตือน',

  Profile:
    'ข้อมูลส่วนตัว',

  'Change Password':
    'เปลี่ยนรหัสผ่าน',

  Logout:
    'ออกจากระบบ',
};

const roleLabels = {
  employee:
    'Employee',

  supervisor:
    'Supervisor',

  hr:
    'Human Resources',

  admin:
    'Administrator',
};

const getInitials = (
  name,
) =>
  String(
    name || 'User',
  )
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part
          .charAt(0)
          .toUpperCase(),
    )
    .join('') || 'U';

const getMenuIcon = (
  menuItem,
) => {
  const icons = {
    Dashboard:
      DashboardRounded,

    'Leave Request':
      AddCircleOutlineRounded,

    'My Requests':
      DescriptionRounded,

    'Leave Balance':
      EventAvailableRounded,

    Approval:
      FactCheckRounded,

    'Team Reports':
      AssessmentRounded,

    'Employee Management':
      GroupsRounded,

    'Leave Entitlement':
      EventAvailableRounded,

    'Leave Type':
      CategoryRounded,

    'Holiday Management':
      CalendarMonthRounded,

    Reports:
      AssessmentRounded,

    'User Management':
      ManageAccountsRounded,

    'Department Management':
      GroupsRounded,

    'Position Management':
      WorkOutlineRounded,

    'Audit Log':
      HistoryRounded,

    Notification:
      NotificationsNoneRounded,

    Profile:
      PersonOutlineRounded,

    'Change Password':
      LockOutlined,

    Logout:
      LogoutRounded,
  };

  return (
    icons[menuItem] ||
    BadgeRounded
  );
};

function RoleLayout({
  children,
  activeMenu = '',
  menuItems = [],
  theme,
}) {
  const [
    currentUser,
    setCurrentUser,
  ] = useState(
    () =>
      getCurrentUser(),
  );

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const pathSegments =
    location.pathname
      .split('/');

  const currentRole = [
    'employee',
    'supervisor',
    'hr',
    'admin',
  ].includes(
    pathSegments[1],
  )
    ? pathSegments[1]
    : 'employee';

  const resolvedTheme = {
    primary:
      theme?.primary ||
      '#2563EB',

    dark:
      theme?.dark ||
      '#1D4ED8',

    soft:
      theme?.soft ||
      '#EFF6FF',

    border:
      theme?.border ||
      '#BFDBFE',

    text:
      theme?.text ||
      '#1E3A8A',
  };

  useEffect(() => {
    const handleAuthChanged =
      (event) => {
        setCurrentUser(
          event.detail ||
            getCurrentUser(),
        );
      };

    window.addEventListener(
      'auth-session-changed',
      handleAuthChanged,
    );

    return () => {
      window.removeEventListener(
        'auth-session-changed',
        handleAuthChanged,
      );
    };
  }, []);

  const displayName =
    currentUser
      ?.displayName ||
    currentUser
      ?.username ||
    roleLabels[
      currentRole
    ] ||
    'User';

  const profileRoleLabel =
    roleLabels[
      currentRole
    ] ||
    'User';

  const handleLogout =
    () => {
      const selectedUser =
        getCurrentUser();

      try {
        if (
          selectedUser
        ) {
          createAuditLog({
            userId:
              selectedUser
                .userId ||
              null,

            username:
              selectedUser
                .username ||
              'unknown',

            role:
              selectedUser
                .role ||
              currentRole,

            action:
              'logout',

            tableName:
              'auth_sessions',

            recordId:
              selectedUser
                .userId ||
              null,

            detail:
              `${selectedUser.username || 'User'} logged out of the system.`,

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
            replace:
              true,
          },
        );
      }
    };

  const handleMenuClick =
    (
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
        ]?.[
          menuItem
        ];

      if (
        !targetRoute
      ) {
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

        background:
          `linear-gradient(
            180deg,
            ${resolvedTheme.soft}55 0px,
            #F6F8FC 300px,
            #F6F8FC 100%
          )`,

        overflowX:
          'hidden',
      }}
    >
      <Box
        component="header"
        sx={{
          height: '64px',
          position: 'fixed',
          top: 0,
          right: 0,
          left: 0,
          zIndex: 20,
          display: {
            xs: 'flex',
            md: 'none',
          },
          alignItems: 'center',
          gap: '12px',
          padding: '0 16px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <IconButton
          type="button"
          aria-label="เปิดเมนูนำทาง"
          aria-controls="mobile-navigation-drawer"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(true)}
          sx={{
            color: resolvedTheme.primary,
            backgroundColor: resolvedTheme.soft,
          }}
        >
          <MenuRounded />
        </IconButton>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: '#111827',
              fontSize: '16px',
              fontWeight: 800,
              lineHeight: 1.25,
            }}
          >
            Leave Approval
          </Typography>
          <Typography
            sx={{
              color: resolvedTheme.primary,
              fontSize: '10px',
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {profileRoleLabel}
          </Typography>
        </Box>
      </Box>

      <Drawer
        id="mobile-navigation-drawer"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: {
            xs: 'block',
            md: 'none',
          },
          '& .MuiDrawer-paper': {
            width: '280px',
            maxWidth: '86vw',
            boxSizing: 'border-box',
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        <Box
          sx={{
            minHeight: '76px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px 14px 22px',
            borderBottom: '1px solid #EEF0F3',
          }}
        >
          <Box>
            <Typography sx={{ color: '#111827', fontSize: '18px', fontWeight: 800 }}>
              Leave Approval
            </Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px' }}>
              ONLINE LEAVE SYSTEM
            </Typography>
          </Box>
          <IconButton
            type="button"
            aria-label="ปิดเมนูนำทาง"
            onClick={() => setMobileMenuOpen(false)}
          >
            <CloseRounded />
          </IconButton>
        </Box>

        <Box sx={{ padding: '16px 16px 12px' }}>
          <ButtonBase
            type="button"
            onClick={() => {
              handleMenuClick('Profile');
              setMobileMenuOpen(false);
            }}
            sx={{
              width: '100%',
              minHeight: '68px',
              padding: '10px 12px',
              display: 'flex',
              justifyContent: 'flex-start',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              textAlign: 'left',
            }}
          >
            <Avatar
              src={currentUser?.profileImageUrl || undefined}
              alt={displayName}
              sx={{
                width: '44px',
                height: '44px',
                backgroundColor: resolvedTheme.primary,
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
              }}
            >
              {getInitials(displayName)}
            </Avatar>
            <Box sx={{ minWidth: 0, marginLeft: '11px' }}>
              <Typography noWrap sx={{ color: '#111827', fontSize: '13px', fontWeight: 800 }}>
                {displayName}
              </Typography>
              <Typography noWrap sx={{ color: '#64748B', fontSize: '10px', fontWeight: 600, marginTop: '4px' }}>
                {profileRoleLabel}
              </Typography>
            </Box>
          </ButtonBase>
        </Box>

        <Box component="nav" sx={{ padding: '8px 16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map((menuItem) => {
            const isActive = activeMenu === menuItem;
            const isLogout = menuItem === 'Logout';
            const MenuIcon = getMenuIcon(menuItem);

            return (
              <Button
                key={menuItem}
                type="button"
                fullWidth
                onClick={() => {
                  handleMenuClick(menuItem);
                  setMobileMenuOpen(false);
                }}
                startIcon={<MenuIcon sx={{ fontSize: '20px' }} />}
                sx={{
                  minHeight: '46px',
                  padding: '8px 12px',
                  justifyContent: 'flex-start',
                  backgroundColor: isActive ? resolvedTheme.soft : 'transparent',
                  color: isLogout ? '#DC2626' : isActive ? resolvedTheme.primary : '#475569',
                  border: isActive ? `1px solid ${resolvedTheme.border}` : '1px solid transparent',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 600,
                  textAlign: 'left',
                  textTransform: 'none',
                  '& .MuiButton-startIcon': { marginLeft: 0, marginRight: '12px' },
                  '&:hover': {
                    backgroundColor: isLogout ? '#FEF2F2' : resolvedTheme.soft,
                    color: isLogout ? '#DC2626' : resolvedTheme.primary,
                  },
                }}
              >
                {menuLabels[menuItem] || menuItem}
              </Button>
            );
          })}
        </Box>
      </Drawer>

      <Box
        component="aside"
        sx={{
          width:
            '280px',

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

          overflowX:
            'hidden',
        }}
      >
        {/* Brand */}
        <Box
          sx={{
            minHeight:
              '90px',

            flexShrink:
              0,

            display:
              'flex',

            flexDirection:
              'column',

            justifyContent:
              'center',

            padding:
              '18px 22px',

            borderBottom:
              '1px solid #EEF0F3',
          }}
        >
          <Typography
            sx={{
              color:
                '#111827',

              fontSize:
                '19px',

              fontWeight:
                800,

              lineHeight:
                1.25,
            }}
          >
            Leave Approval
          </Typography>

          <Typography
            sx={{
              color:
                '#94A3B8',

              fontSize:
                '9px',

              fontWeight:
                700,

              letterSpacing:
                '1.5px',

              marginTop:
                '4px',

              lineHeight:
                1.3,
            }}
          >
            ONLINE LEAVE SYSTEM
          </Typography>
        </Box>

        {/* Profile */}
        <Box
          sx={{
            padding:
              '16px 16px 12px',

            flexShrink:
              0,
          }}
        >
          <ButtonBase
            type="button"
            onClick={() =>
              handleMenuClick(
                'Profile',
              )
            }
            sx={{
              width:
                '100%',

              minHeight:
                '72px',

              padding:
                '11px 12px',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'flex-start',

              backgroundColor:
                '#F8FAFC',

              border:
                '1px solid #E5E7EB',

              borderRadius:
                '12px',

              position:
                'relative',

              overflow:
                'hidden',

              textAlign:
                'left',

              transition:
                'background-color 0.15s ease, border-color 0.15s ease',

              '&::before':
                {
                  content:
                    '""',

                  width:
                    '4px',

                  height:
                    '100%',

                  position:
                    'absolute',

                  left:
                    0,

                  top:
                    0,

                  backgroundColor:
                    resolvedTheme.primary,
                },

              '&:hover': {
                backgroundColor:
                  resolvedTheme.soft,

                borderColor:
                  resolvedTheme.border,
              },
            }}
          >
            <Avatar
              src={
                currentUser
                  ?.profileImageUrl ||
                undefined
              }
              alt={
                displayName
              }
              sx={{
                width:
                  '46px',

                height:
                  '46px',

                flexShrink:
                  0,

                marginLeft:
                  '3px',

                backgroundColor:
                  resolvedTheme.primary,

                color:
                  '#FFFFFF',

                fontSize:
                  '14px',

                fontWeight:
                  800,

                border:
                  '3px solid #FFFFFF',

                boxShadow:
                  '0 2px 8px rgba(15, 23, 42, 0.08)',
              }}
            >
              {getInitials(
                displayName,
              )}
            </Avatar>

            <Box
              sx={{
                flex:
                  1,

                minWidth:
                  0,

                marginLeft:
                  '11px',

                padding:
                  '2px 0',
              }}
            >
              <Typography
                sx={{
                  width:
                    '100%',

                  color:
                    '#111827',

                  fontSize:
                    '13px',

                  fontWeight:
                    800,

                  lineHeight:
                    1.35,

                  whiteSpace:
                    'nowrap',

                  overflow:
                    'hidden',

                  textOverflow:
                    'ellipsis',

                  margin:
                    0,
                }}
              >
                {
                  displayName
                }
              </Typography>

              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  minWidth:
                    0,

                  gap:
                    '6px',

                  marginTop:
                    '5px',
                }}
              >
                <Box
                  sx={{
                    width:
                      '7px',

                    height:
                      '7px',

                    flexShrink:
                      0,

                    backgroundColor:
                      resolvedTheme.primary,

                    borderRadius:
                      '50%',
                  }}
                />

                <Typography
                  sx={{
                    minWidth:
                      0,

                    color:
                      '#64748B',

                    fontSize:
                      '10px',

                    fontWeight:
                      600,

                    lineHeight:
                      1.3,

                    whiteSpace:
                      'nowrap',

                    overflow:
                      'hidden',

                    textOverflow:
                      'ellipsis',
                  }}
                >
                  {
                    profileRoleLabel
                  }
                </Typography>
              </Box>
            </Box>
          </ButtonBase>
        </Box>

        {/* Menu */}
        <Box
          component="nav"
          sx={{
            flex:
              1,

            padding:
              '8px 16px 20px',

            display:
              'flex',

            flexDirection:
              'column',

            gap:
              '6px',
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

              const MenuIcon =
                getMenuIcon(
                  menuItem,
                );

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
                  startIcon={
                    <Box
                      sx={{
                        width:
                          '32px',

                        height:
                          '32px',

                        flexShrink:
                          0,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'center',

                        backgroundColor:
                          isLogout
                            ? '#FEF2F2'
                            : isActive
                              ? '#FFFFFF'
                              : 'transparent',

                        color:
                          isLogout
                            ? '#DC2626'
                            : isActive
                              ? resolvedTheme.primary
                              : '#64748B',

                        border:
                          isActive
                            ? `1px solid ${resolvedTheme.border}`
                            : '1px solid transparent',

                        borderRadius:
                          '8px',
                      }}
                    >
                      <MenuIcon
                        sx={{
                          fontSize:
                            '19px',
                        }}
                      />
                    </Box>
                  }
                  sx={{
                    minHeight:
                      '48px',

                    padding:
                      '7px 10px',

                    justifyContent:
                      'flex-start',

                    backgroundColor:
                      isLogout
                        ? 'transparent'
                        : isActive
                          ? resolvedTheme.soft
                          : 'transparent',

                    color:
                      isLogout
                        ? '#DC2626'
                        : isActive
                          ? resolvedTheme.primary
                          : '#475569',

                    border:
                      isActive
                        ? `1px solid ${resolvedTheme.border}`
                        : '1px solid transparent',

                    borderRadius:
                      '10px',

                    fontSize:
                      '13px',

                    fontWeight:
                      isActive
                        ? 700
                        : 600,

                    lineHeight:
                      1.4,

                    textAlign:
                      'left',

                    textTransform:
                      'none',

                    whiteSpace:
                      'normal',

                    '& .MuiButton-startIcon':
                      {
                        marginLeft:
                          0,

                        marginRight:
                          '10px',
                      },

                    '&:hover': {
                      backgroundColor:
                        isLogout
                          ? '#FEF2F2'
                          : resolvedTheme.soft,

                      color:
                        isLogout
                          ? '#DC2626'
                          : resolvedTheme.primary,
                    },
                  }}
                >
                  {
                    menuLabels[
                      menuItem
                    ] ||
                    menuItem
                  }
                </Button>
              );
            },
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          width: {
            xs:
              '100%',

            md:
              'calc(100% - 280px)',
          },

          minWidth:
            0,

          minHeight:
            '100vh',

          marginLeft: {
            xs:
              0,

            md:
              '280px',
          },

          padding: {
            xs:
              '88px 18px 24px',

            sm:
              '92px 24px 28px',

            md:
              '32px',

            lg:
              '36px 40px',
          },

          position:
            'relative',

          overflowX:
            'hidden',

          '&::before': {
            content:
              '""',

            width:
              '320px',

            height:
              '320px',

            position:
              'fixed',

            top:
              '-170px',

            right:
              '-100px',

            borderRadius:
              '50%',

            backgroundColor:
              `${resolvedTheme.primary}08`,

            pointerEvents:
              'none',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default RoleLayout;
