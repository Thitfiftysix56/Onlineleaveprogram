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

import {
  colorTokens,
  radiusTokens,
  roleAccentTokens,
  shadowTokens,
} from '../theme/tokens.js';


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


const accountMenuItems = [
  'Profile',
  'Change Password',
  'Logout',
];


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


  const resolvedTheme =
    roleAccentTokens[currentRole] ||
    roleAccentTokens.employee;


  const mainMenuItems =
    menuItems.filter(
      (menuItem) =>
        !accountMenuItems.includes(
          menuItem,
        ),
    );


  const visibleAccountMenuItems =
    menuItems.filter(
      (menuItem) =>
        accountMenuItems.includes(
          menuItem,
        ),
    );


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


  const renderNavigationItem = (
    menuItem,
    isMobile = false,
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
        onClick={() => {
          handleMenuClick(
            menuItem,
          );

          if (
            isMobile
          ) {
            setMobileMenuOpen(
              false,
            );
          }
        }}
        startIcon={
          <Box
            sx={{
              width:
                isMobile
                  ? '30px'
                  : '34px',

              height:
                isMobile
                  ? '30px'
                  : '34px',

              flexShrink:
                0,

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              borderRadius:
                '9px',

              backgroundColor:
                isLogout
                  ? colorTokens.status.error.soft
                  : isActive
                    ? resolvedTheme.primary
                    : 'transparent',

              color:
                isLogout
                  ? colorTokens.status.error.main
                  : isActive
                    ? '#FFFFFF'
                    : colorTokens.text.muted,

              border:
                isLogout
                  ? `1px solid ${colorTokens.status.error.border}`
                  : isActive
                    ? `1px solid ${resolvedTheme.primary}`
                    : '1px solid transparent',

              boxShadow:
                isActive
                  ? `0 5px 12px ${resolvedTheme.border}`
                  : 'none',

              transition:
                'all 0.18s ease',
            }}
          >
            <MenuIcon
              sx={{
                fontSize:
                  isMobile
                    ? '18px'
                    : '19px',
              }}
            />
          </Box>
        }
        sx={{
          minHeight:
            isMobile
              ? '46px'
              : '50px',

          padding:
            isMobile
              ? '7px 10px'
              : '7px 11px',

          justifyContent:
            'flex-start',

          background:
            isLogout
              ? 'transparent'
              : isActive
                ? `linear-gradient(
                    90deg,
                    ${resolvedTheme.soft} 0%,
                    rgba(255,255,255,0.78) 100%
                  )`
                : 'transparent',

          color:
            isLogout
              ? colorTokens.status.error.main
              : isActive
                ? resolvedTheme.dark
                : colorTokens.text.secondary,

          border:
            isLogout
              ? '1px solid transparent'
              : isActive
                ? `1px solid ${resolvedTheme.border}`
                : '1px solid transparent',

          borderRadius:
            '10px',

          boxShadow:
            isActive
              ? '0 4px 12px rgba(15, 23, 42, 0.055)'
              : 'none',

          fontSize:
            '13px',

          fontWeight:
            isActive
              ? 800
              : 600,

          lineHeight:
            1.4,

          textAlign:
            'left',

          textTransform:
            'none',

          whiteSpace:
            'normal',

          transition:
            'background-color 0.18s ease, color 0.18s ease, transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',

          '& .MuiButton-startIcon':
            {
              marginLeft:
                0,

              marginRight:
                '10px',
            },

          '&:hover': {
            background:
              isLogout
                ? colorTokens.status.error.soft
                : isActive
                  ? `linear-gradient(
                      90deg,
                      ${resolvedTheme.soft} 0%,
                      rgba(255,255,255,0.68) 100%
                    )`
                  : resolvedTheme.hoverBackground,

            color:
              isLogout
                ? colorTokens.status.error.main
                : resolvedTheme.dark,

            transform:
              isActive
                ? 'none'
                : 'translateX(2px)',

            borderColor:
              isLogout
                ? colorTokens.status.error.border
                : resolvedTheme.border,

            '& .MuiButton-startIcon > div':
              {
                color:
                  isLogout
                    ? colorTokens.status.error.main
                    : isActive
                      ? '#FFFFFF'
                      : resolvedTheme.primary,
              },
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
  };


  const renderSectionTitle = (
    title,
  ) => (
    <Typography
      sx={{
        padding:
          '0 10px',

        marginTop:
          '8px',

        marginBottom:
          '5px',

        color:
          colorTokens.text.disabled,

        fontSize:
          '9px',

        fontWeight:
          800,

        letterSpacing:
          '1.25px',

        lineHeight:
          1.5,

        textTransform:
          'uppercase',
      }}
    >
      {title}
    </Typography>
  );


  const renderProfileCard = (
    isMobile = false,
  ) => (
    <ButtonBase
      type="button"
      onClick={() => {
        handleMenuClick(
          'Profile',
        );

        if (
          isMobile
        ) {
          setMobileMenuOpen(
            false,
          );
        }
      }}
      sx={{
        width:
          '100%',

        minHeight:
          isMobile
            ? '72px'
            : '78px',

        padding:
          '12px',

        display:
          'flex',

        alignItems:
          'center',

        justifyContent:
          'flex-start',

        position:
          'relative',

        overflow:
          'hidden',

        background:
          resolvedTheme.profileBackground,

        border:
          `1px solid ${resolvedTheme.border}`,

        borderRadius:
          '13px',

        boxShadow:
          '0 4px 12px rgba(15, 23, 42, 0.055)',

        textAlign:
          'left',

        transition:
          'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',

        '&:hover': {
          transform:
            'translateY(-1px)',

          borderColor:
            resolvedTheme.primary,

          boxShadow:
            '0 8px 18px rgba(15, 23, 42, 0.09)',
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
            isMobile
              ? '46px'
              : '48px',

          height:
            isMobile
              ? '46px'
              : '48px',

          flexShrink:
            0,

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
            `0 5px 14px ${resolvedTheme.border}`,
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
        }}
      >
        <Typography
          sx={{
            width:
              '100%',

            color:
              colorTokens.text.primary,

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
          }}
        >
          {displayName}
        </Typography>


        <Box
          sx={{
            display:
              'flex',

            alignItems:
              'center',

            marginTop:
              '6px',
          }}
        >
          <Box
            sx={{
              display:
                'inline-flex',

              alignItems:
                'center',

              gap:
                '5px',

              maxWidth:
                '100%',

              padding:
                '3px 7px',

              borderRadius:
                '999px',

              color:
                resolvedTheme.text,

              backgroundColor:
                'rgba(255,255,255,0.68)',

              border:
                `1px solid ${resolvedTheme.border}`,
            }}
          >
            <Box
              sx={{
                width:
                  '6px',

                height:
                  '6px',

                flexShrink:
                  0,

                borderRadius:
                  '50%',

                backgroundColor:
                  resolvedTheme.primary,
              }}
            />

            <Typography
              noWrap
              sx={{
                color:
                  resolvedTheme.text,

                fontSize:
                  '9px',

                fontWeight:
                  800,

                lineHeight:
                  1.3,
              }}
            >
              {profileRoleLabel}
            </Typography>
          </Box>
        </Box>
      </Box>
    </ButtonBase>
  );


  const renderBrand = (
    isMobile = false,
  ) => (
    <Box
      sx={{
        minHeight:
          isMobile
            ? '92px'
            : '105px',

        flexShrink:
          0,

        position:
          'relative',

        overflow:
          'hidden',

        display:
          'flex',

        flexDirection:
          'column',

        justifyContent:
          'center',

        padding:
          isMobile
            ? '16px 60px 16px 22px'
            : '20px 22px',

        background:
          resolvedTheme.brandGradient,

        boxShadow:
          '0 8px 20px rgba(15, 23, 42, 0.10)',
      }}
    >

      {/* Circle decoration */}
      <Box
        aria-hidden="true"
        sx={{
          position:
            'absolute',

          width:
            '160px',

          height:
            '160px',

          top:
            '-95px',

          right:
            '-65px',

          borderRadius:
            '50%',

          backgroundColor:
            'rgba(255,255,255,0.11)',

          pointerEvents:
            'none',
        }}
      />


      <Box
        aria-hidden="true"
        sx={{
          position:
            'absolute',

          width:
            '105px',

          height:
            '105px',

          bottom:
            '-70px',

          left:
            '-38px',

          borderRadius:
            '50%',

          backgroundColor:
            'rgba(255,255,255,0.07)',

          pointerEvents:
            'none',
        }}
      />


      {/* Shine */}
      <Box
        aria-hidden="true"
        sx={{
          position:
            'absolute',

          width:
            '190px',

          height:
            '240px',

          top:
            '-80px',

          left:
            '88px',

          transform:
            'rotate(24deg)',

          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 50%, transparent 100%)',

          pointerEvents:
            'none',
        }}
      />


      <Typography
        sx={{
          position:
            'relative',

          zIndex:
            1,

          color:
            '#FFFFFF',

          fontSize:
            isMobile
              ? '19px'
              : '21px',

          fontWeight:
            900,

          lineHeight:
            1.25,

          letterSpacing:
            '-0.2px',
        }}
      >
        Leave Approval
      </Typography>


      <Typography
        sx={{
          position:
            'relative',

          zIndex:
            1,

          color:
            'rgba(255,255,255,0.78)',

          fontSize:
            '9px',

          fontWeight:
            800,

          letterSpacing:
            '1.6px',

          marginTop:
            '6px',

          lineHeight:
            1.3,
        }}
      >
        ONLINE LEAVE SYSTEM
      </Typography>
    </Box>
  );


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
          resolvedTheme.pageBackground ||
          colorTokens.background,

        overflowX:
          'hidden',
      }}
    >

      {/* =========================
          MOBILE HEADER
      ========================== */}
      <Box
        component="header"
        sx={{
          height:
            '64px',

          position:
            'fixed',

          top:
            0,

          right:
            0,

          left:
            0,

          zIndex:
            20,

          display: {
            xs:
              'flex',

            md:
              'none',
          },

          alignItems:
            'center',

          gap:
            '12px',

          padding:
            '0 16px',

          backgroundColor:
            colorTokens.surface,

          borderBottom:
            `1px solid ${resolvedTheme.border}`,

          boxShadow:
            shadowTokens.subtle,
        }}
      >
        <IconButton
          type="button"
          aria-label="เปิดเมนูนำทาง"
          aria-controls="mobile-navigation-drawer"
          aria-expanded={
            mobileMenuOpen
          }
          onClick={() =>
            setMobileMenuOpen(
              true,
            )
          }
          sx={{
            color:
              '#FFFFFF',

            backgroundColor:
              resolvedTheme.primary,

            borderRadius:
              `${radiusTokens.control}px`,

            boxShadow:
              `0 5px 12px ${resolvedTheme.border}`,

            '&:hover': {
              backgroundColor:
                resolvedTheme.dark,
            },
          }}
        >
          <MenuRounded />
        </IconButton>


        <Box
          sx={{
            minWidth:
              0,
          }}
        >
          <Typography
            sx={{
              color:
                colorTokens.text.primary,

              fontSize:
                '16px',

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
                resolvedTheme.primary,

              fontSize:
                '10px',

              fontWeight:
                800,

              lineHeight:
                1.3,
            }}
          >
            {profileRoleLabel}
          </Typography>
        </Box>
      </Box>


      {/* =========================
          MOBILE DRAWER
      ========================== */}
      <Drawer
        id="mobile-navigation-drawer"
        open={
          mobileMenuOpen
        }
        onClose={() =>
          setMobileMenuOpen(
            false,
          )
        }
        ModalProps={{
          keepMounted:
            true,
        }}
        sx={{
          display: {
            xs:
              'block',

            md:
              'none',
          },

          '& .MuiDrawer-paper':
            {
              width:
                '280px',

              maxWidth:
                '86vw',

              boxSizing:
                'border-box',

              background:
                resolvedTheme.sidebarBackground,

              borderRight:
                `1px solid ${resolvedTheme.border}`,
            },
        }}
      >
        <Box
          sx={{
            position:
              'relative',
          }}
        >
          {renderBrand(true)}

          <IconButton
            type="button"
            aria-label="ปิดเมนูนำทาง"
            onClick={() =>
              setMobileMenuOpen(
                false,
              )
            }
            sx={{
              position:
                'absolute',

              top:
                '25px',

              right:
                '14px',

              zIndex:
                2,

              color:
                '#FFFFFF',

              backgroundColor:
                'rgba(255,255,255,0.12)',

              '&:hover': {
                backgroundColor:
                  'rgba(255,255,255,0.20)',
              },
            }}
          >
            <CloseRounded />
          </IconButton>
        </Box>


        <Box
          sx={{
            padding:
              '16px 16px 8px',
          }}
        >
          {renderProfileCard(true)}
        </Box>


        <Box
          component="nav"
          sx={{
            padding:
              '2px 16px 20px',

            display:
              'flex',

            flexDirection:
              'column',

            gap:
              '5px',
          }}
        >
          {renderSectionTitle(
            'เมนูหลัก',
          )}

          {mainMenuItems.map(
            (
              menuItem,
            ) =>
              renderNavigationItem(
                menuItem,
                true,
              ),
          )}


          {visibleAccountMenuItems.length >
            0 &&
            renderSectionTitle(
              'บัญชี',
            )}


          {visibleAccountMenuItems.map(
            (
              menuItem,
            ) =>
              renderNavigationItem(
                menuItem,
                true,
              ),
          )}
        </Box>
      </Drawer>


      {/* =========================
          DESKTOP SIDEBAR
      ========================== */}
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

          background:
            resolvedTheme.sidebarBackground,

          borderRight:
            `1px solid ${resolvedTheme.border}`,

          boxShadow:
            '5px 0 18px rgba(15, 23, 42, 0.04)',

          overflowY:
            'auto',

          overflowX:
            'hidden',
        }}
      >

        {/* Brand */}
        {renderBrand(false)}


        {/* Profile */}
        <Box
          sx={{
            padding:
              '18px 16px 8px',

            flexShrink:
              0,
          }}
        >
          {renderProfileCard(false)}
        </Box>


        {/* Navigation */}
        <Box
          component="nav"
          sx={{
            flex:
              1,

            padding:
              '2px 16px 22px',

            display:
              'flex',

            flexDirection:
              'column',

            gap:
              '5px',
          }}
        >
          {renderSectionTitle(
            'เมนูหลัก',
          )}


          {mainMenuItems.map(
            (
              menuItem,
            ) =>
              renderNavigationItem(
                menuItem,
                false,
              ),
          )}


          {visibleAccountMenuItems.length >
            0 &&
            renderSectionTitle(
              'บัญชี',
            )}


          {visibleAccountMenuItems.map(
            (
              menuItem,
            ) =>
              renderNavigationItem(
                menuItem,
                false,
              ),
          )}
        </Box>
      </Box>


      {/* =========================
          MAIN CONTENT
      ========================== */}
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
              '32px 40px',
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