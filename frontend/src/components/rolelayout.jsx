import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonBase,
  Drawer,
  IconButton,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  Popover,
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
  useCallback,
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
import { getNotifications, markNotificationRead } from '../api/notification-service.js';

import {
  appPageBackground,
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

    'Edit Personal Information':
      '/employee/edit-personal-information',

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

    'Edit Personal Information':
      '/supervisor/edit-personal-information',

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

    Approval:
      '/hr/approval',

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

    'Edit Personal Information':
      '/hr/edit-personal-information',

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

    'Edit Personal Information':
      '/admin/edit-personal-information',

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
    'ประวัติการลาของทีม',

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
    'โปรไฟล์',

  'Edit Personal Information':
    'แก้ไขข้อมูลส่วนตัว',

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

    'Edit Personal Information':
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

  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [accountAnchor, setAccountAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

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

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--role-primary', resolvedTheme.primary);
    root.style.setProperty('--role-secondary', resolvedTheme.secondary || resolvedTheme.dark);
    root.style.setProperty('--role-soft', resolvedTheme.soft);
    root.style.setProperty('--role-border', resolvedTheme.border);
    root.style.setProperty('--role-text', resolvedTheme.text);
    root.style.setProperty('--role-focus', `${resolvedTheme.primary}1A`);
    root.style.setProperty('--role-hover', resolvedTheme.hoverBackground || resolvedTheme.soft);
    root.style.setProperty('--role-row-hover', `${resolvedTheme.primary}09`);
  }, [resolvedTheme]);

  const profileViewPath = roleRoutes[currentRole].Profile;
  const editPersonalInformationPath = roleRoutes[currentRole]['Edit Personal Information'];
  const changePasswordPath = roleRoutes[currentRole]['Change Password'];

  const isDashboardPage =
    location.pathname.replace(/\/+$/, '') ===
    String(
      roleRoutes[currentRole]?.Dashboard ||
        '',
    ).replace(/\/+$/, '');

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const data = await getNotifications();
      setNotifications(data?.notifications || data || []);
    } catch {
      setNotificationsError('ไม่สามารถโหลดการแจ้งเตือนได้');
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications, location.pathname]);

  useEffect(() => {
    const refreshUnreadCount = () => loadNotifications();
    window.addEventListener('notification-read-state-changed', refreshUnreadCount);
    return () => window.removeEventListener('notification-read-state-changed', refreshUnreadCount);
  }, [loadNotifications]);

  useEffect(() => {
    const refreshWhenActive = () => {
      if (document.visibilityState === 'visible') loadNotifications();
    };
    const intervalId = window.setInterval(loadNotifications, 30000);
    window.addEventListener('focus', refreshWhenActive);
    document.addEventListener('visibilitychange', refreshWhenActive);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshWhenActive);
      document.removeEventListener('visibilitychange', refreshWhenActive);
    };
  }, [loadNotifications]);

  const isNotificationRead = (item) => Boolean(item.read ?? item.isRead ?? item.readAt);
  const unreadCount = notifications.filter((item) => !isNotificationRead(item)).length;

  const handleNotificationClick = async (item) => {
    if (!isNotificationRead(item)) {
      await markNotificationRead(item.id || item.notificationId);
      setNotifications((items) => items.map((entry) =>
        (entry.id || entry.notificationId) === (item.id || item.notificationId)
          ? { ...entry, read: true, isRead: true, readAt: new Date().toISOString() }
          : entry));
    }
    setNotificationAnchor(null);
    const target = item.path || item.deepLink || (item.leaveRequestId
      ? `/${currentRole}/${['supervisor', 'hr'].includes(currentRole) && item.type === 'leave-submitted' ? 'approval' : 'my-requests'}/${item.leaveRequestId}`
      : null);
    if (target) navigate(target);
  };


  const mainMenuItems =
    menuItems.filter(
      (menuItem) =>
        !accountMenuItems.includes(
          menuItem,
        ) &&
        ![
          'Notification',
          'Change Password',
          'Edit Personal Information',
        ].includes(menuItem),
    );


  const visibleAccountMenuItems = [
    ...(
      menuItems.includes(
        'Profile',
      ) ||
      menuItems.includes(
        'Edit Personal Information',
      )
        ? ['Profile']
        : []
    ),

    ...(
      menuItems.includes(
        'Change Password',
      )
        ? ['Change Password']
        : []
    ),

    ...(
      menuItems.includes(
        'Logout',
      )
        ? ['Logout']
        : []
    ),
  ];


  useEffect(() => {
    const handleAuthChanged =
      (event) => {
        setCurrentUser(
          event.detail ||
            getCurrentUser(),
        );
      };

    const handleProfileUpdated =
      (event) => {
        const nextProfile =
          event.detail || {};

        setCurrentUser(
          (previous) => ({
            ...(previous || {}),
            displayName:
              nextProfile.fullName ||
              previous?.displayName,
            profileImageUrl:
              Object.prototype.hasOwnProperty.call(
                nextProfile,
                'profileImageUrl',
              )
                ? nextProfile.profileImageUrl
                : previous?.profileImageUrl,
            employeeCode:
              nextProfile.employeeCode ||
              previous?.employeeCode,
            department:
              nextProfile.department ||
              previous?.department,
            position:
              nextProfile.position ||
              previous?.position,
          }),
        );
      };

    window.addEventListener(
      'auth-session-changed',
      handleAuthChanged,
    );
    window.addEventListener(
      'profile-updated',
      handleProfileUpdated,
    );

    return () => {
      window.removeEventListener(
        'auth-session-changed',
        handleAuthChanged,
      );
      window.removeEventListener(
        'profile-updated',
        handleProfileUpdated,
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

  const _renderLegacyGlobalActions = (compact = false) => (
    <Box sx={{ marginLeft: 'auto', minWidth: 0, display: 'flex', alignItems: 'center', gap: { xs: '6px', sm: '10px' } }}>
      <Button
        type="button"
        variant="contained"
        startIcon={<AddCircleOutlineRounded />}
        onClick={() => navigate(`/${currentRole}/leave-request`)}
        sx={{ minWidth: 0, height: 40, paddingInline: { xs: '10px', sm: '14px' }, borderRadius: '9px', backgroundColor: '#2563EB', boxShadow: 'none', fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap', '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' }, '& .MuiButton-startIcon': { margin: compact ? 0 : undefined } }}
      >
        <Box component="span" sx={{ display: compact ? 'none' : { xs: 'none', sm: 'inline' } }}>สร้างคำขอลา</Box>
      </Button>

      <IconButton
        type="button"
        aria-label="เปิดการแจ้งเตือน"
        onClick={(event) => { setNotificationAnchor(event.currentTarget); loadNotifications(); }}
        sx={{ width: 40, height: 40, flexShrink: 0, color: '#334155', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', '&:hover': { backgroundColor: '#F8FAFC' } }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99} invisible={!unreadCount}>
          <NotificationsNoneRounded />
        </Badge>
      </IconButton>

      <ButtonBase
        type="button"
        aria-label="เปิดเมนูบัญชีผู้ใช้"
        onClick={(event) => setAccountAnchor(event.currentTarget)}
        sx={{ minWidth: 0, maxWidth: { xs: 44, sm: 210 }, height: 42, display: 'flex', alignItems: 'center', gap: '9px', padding: { xs: '4px', sm: '4px 10px 4px 5px' }, border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#FFFFFF', textAlign: 'left', '&:hover': { backgroundColor: '#F8FAFC' } }}
      >
        <Avatar src={currentUser?.profileImageUrl || undefined} sx={{ width: 32, height: 32, flexShrink: 0, bgcolor: resolvedTheme.primary, fontSize: '11px', fontWeight: 800 }}>{getInitials(displayName)}</Avatar>
        <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
          <Typography noWrap sx={{ color: '#0F172A', fontSize: '11px', fontWeight: 800, lineHeight: 1.25 }}>{displayName}</Typography>
          <Typography noWrap sx={{ color: '#64748B', fontSize: '9px', fontWeight: 700, lineHeight: 1.25 }}>{profileRoleLabel}</Typography>
        </Box>
      </ButtonBase>
    </Box>
  );

  const renderGlobalActions = () => (
    <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
      <IconButton
        type="button"
        aria-label="เปิดการแจ้งเตือน"
        onClick={() =>
          navigate(
            `/${currentRole}/notifications`,
          )
        }
        sx={{ width: 42, height: 42, flexShrink: 0, color: '#334155', backgroundColor: 'transparent', border: 0, boxShadow: 'none', borderRadius: '50%', '&:hover': { backgroundColor: '#F1F5F9' } }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99} invisible={!unreadCount}>
          <NotificationsNoneRounded />
        </Badge>
      </IconButton>
      <Button
        type="button"
        variant="contained"
        startIcon={<AddCircleOutlineRounded />}
        onClick={() => navigate(`/${currentRole}/leave-request`, { state: { returnTo: `/${currentRole}/dashboard` } })}
        sx={{ height: 40, minHeight: '40px !important', borderRadius: '9px', backgroundColor: '#2563EB', boxShadow: 'none', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' } }}
      >
        สร้างคำขอลา
      </Button>
    </Box>
  );


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

      const targetRoute = menuItem === 'Edit Personal Information'
        ? editPersonalInformationPath
        : menuItem === 'Change Password'
          ? changePasswordPath
          : roleRoutes[currentRole]?.[menuItem];

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
      activeMenu === menuItem;

    const isLogout =
      menuItem === 'Logout';

    const MenuIcon =
      getMenuIcon(menuItem);

    return (
      <Button
        key={menuItem}
        type="button"
        fullWidth
        onClick={() => {
          handleMenuClick(menuItem);

          if (isMobile) {
            setMobileMenuOpen(false);
          }
        }}
        startIcon={
          <MenuIcon
            sx={{
              fontSize:
                isMobile
                  ? '19px'
                  : '20px',
              color:
                isLogout
                  ? colorTokens.status.error.main
                  : isActive
                    ? resolvedTheme.primary
                    : '#64748B',
            }}
          />
        }
        sx={{
          minHeight:
            isMobile
              ? '46px'
              : '48px',

          padding:
            isMobile
              ? '8px 14px'
              : '8px 14px',

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
              ? colorTokens.status.error.main
              : isActive
                ? resolvedTheme.text
                : '#475569',

          border: 0,

          borderRadius:
            '12px',

          boxShadow:
            'none',

          fontSize:
            '13px',

          fontWeight:
            isActive
              ? 700
              : 500,

          lineHeight:
            1.4,

          textAlign:
            'left',

          textTransform:
            'none',

          whiteSpace:
            'normal',

          transition:
            'background-color 0.16s ease, color 0.16s ease',

          '& .MuiButton-startIcon': {
            marginLeft: 0,
            marginRight: '12px',
            minWidth: '22px',
          },

          '&:hover': {
            backgroundColor:
              isLogout
                ? colorTokens.status.error.soft
                : isActive
                  ? resolvedTheme.hoverBackground
                  : '#F8FAFC',

            color:
              isLogout
                ? colorTokens.status.error.main
                : isActive
                  ? resolvedTheme.text
                  : '#0F172A',
          },

          '&:focus-visible': {
            outline:
              `2px solid ${resolvedTheme.primary}33`,
            outlineOffset:
              '1px',
          },
        }}
      >
        {menuLabels[menuItem] || menuItem}
      </Button>
    );
  };


  const renderSectionTitle = (
    title,
  ) => (
    <Typography
      sx={{
        padding:
          '0 12px',

        marginTop:
          '10px',

        marginBottom:
          '6px',

        color:
          '#94A3B8',

        fontSize:
          '9px',

        fontWeight:
          700,

        letterSpacing:
          '0.9px',

        lineHeight:
          1.5,

        textTransform:
          'uppercase',
      }}
    >
      {title}
    </Typography>
  );


  const _renderProfileCard = (
    isMobile = false,
  ) => (
    <ButtonBase
      type="button"
      tabIndex={-1}
      aria-disabled="true"
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
        '--role-primary':
          resolvedTheme.primary,

        '--role-secondary':
          resolvedTheme.secondary ||
          resolvedTheme.dark,

        '--role-border':
          resolvedTheme.border,

        '--role-hover':
          resolvedTheme.hoverBackground,

        '--role-focus':
          `${resolvedTheme.primary}1A`,

        '--role-shadow':
          `${resolvedTheme.primary}2E`,

        '--role-row-hover':
          `${resolvedTheme.primary}09`,

        width:
          '100%',

        pointerEvents:
          'none',

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
          `1px solid ${colorTokens.border}`,

        borderRadius:
          '13px',

        boxShadow:
          '0 8px 22px rgba(15, 23, 42, 0.05)',

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

  const renderUserInformation = (
    isMobile = false,
  ) => (
    <ButtonBase
      type="button"
      aria-label="ดูข้อมูลส่วนตัว"
      onClick={() => {
        navigate(profileViewPath);

        if (isMobile) {
          setMobileMenuOpen(false);
        }
      }}
      sx={{
        width:
          '100%',

        minHeight:
          '66px',

        display:
          'flex',

        alignItems:
          'center',

        gap:
          '12px',

        padding:
          isMobile
            ? '10px 16px'
            : '10px 14px',

        textAlign:
          'left',

        borderRadius:
          '12px',

        backgroundColor:
          'transparent',

        border:
          0,

        boxShadow:
          'none',

        transition:
          'background-color 0.16s ease',

        '&:hover': {
          backgroundColor:
            resolvedTheme.soft,
        },

        '&:focus-visible': {
          outline:
            `2px solid ${resolvedTheme.primary}33`,
          outlineOffset:
            '1px',
        },
      }}
    >
      <Avatar
        src={
          currentUser
            ?.profileImageUrl ||
          undefined
        }
        alt={displayName}
        sx={{
          width:
            '44px',

          height:
            '44px',

          flexShrink:
            0,

          backgroundColor:
            resolvedTheme.primary,

          color:
            '#FFFFFF',

          fontSize:
            '12px',

          fontWeight:
            800,

          border:
            '2px solid #FFFFFF',

          boxShadow:
            '0 2px 8px rgba(15, 23, 42, 0.08)',
        }}
      >
        {getInitials(displayName)}
      </Avatar>

      <Box
        sx={{
          minWidth:
            0,

          flex:
            1,
        }}
      >
        <Typography
          noWrap
          title={displayName}
          sx={{
            color:
              '#0F172A',

            fontSize:
              '13px',

            fontWeight:
              700,

            lineHeight:
              1.35,
          }}
        >
          {displayName}
        </Typography>

        <Typography
          noWrap
          sx={{
            color:
              resolvedTheme.primary,

            fontSize:
              '10px',

            fontWeight:
              700,

            lineHeight:
              1.35,

            marginTop:
              '3px',
          }}
        >
          {profileRoleLabel}
        </Typography>
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
            ? '72px'
            : '78px',

        flexShrink:
          0,

        display:
          'flex',

        flexDirection:
          'column',

        justifyContent:
          'center',

        padding:
          isMobile
            ? '14px 56px 14px 20px'
            : '16px 58px 16px 20px',

        backgroundColor:
          '#FFFFFF',

        borderBottom:
          '1px solid #EEF2F6',

        boxShadow:
          'none',
      }}
    >
      <Box
        sx={{
          display:
            'flex',

          alignItems:
            'center',

          gap:
            '9px',
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            width:
              '4px',

            height:
              '24px',

            flexShrink:
              0,

            borderRadius:
              '4px',

            backgroundColor:
              resolvedTheme.primary,
          }}
        />

        <Typography
          sx={{
            color:
              '#0F172A',

            fontSize:
              isMobile
                ? '18px'
                : '19px',

            fontWeight:
              700,

            lineHeight:
              1.25,

            letterSpacing:
              '-0.2px',
          }}
        >
          Leave Approval
        </Typography>
      </Box>

      <Typography
        sx={{
          color:
            '#94A3B8',

          fontSize:
            '9px',

          fontWeight:
            600,

          letterSpacing:
            '0.9px',

          marginTop:
            '5px',

          marginLeft:
            '13px',

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
        '--role-primary': resolvedTheme.primary,
        '--role-secondary': resolvedTheme.secondary || resolvedTheme.dark,
        '--role-soft': resolvedTheme.soft,
        '--role-border': resolvedTheme.border,
        '--role-text': resolvedTheme.text,
        width:
          '100%',

        minWidth:
          0,

        minHeight:
          '100vh',

        background: appPageBackground,

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
            'transparent',

          borderBottom:
            0,

          boxShadow:
            'none',
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
            display: { xs: 'none', sm: 'block' },
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

      <IconButton
        type="button"
        aria-label="เปิดการแจ้งเตือน"
        onClick={(event) => { setNotificationAnchor(event.currentTarget); loadNotifications(); }}
        sx={{ display: 'none' }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99} invisible={!unreadCount}>
          <NotificationsNoneRounded />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(
          notificationAnchor,
        )}
        anchorEl={notificationAnchor}
        onClose={() => setNotificationAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: { xs: 'calc(100vw - 24px)', sm: 390 }, maxHeight: 'min(560px, calc(100vh - 88px))', borderRadius: '14px', overflow: 'hidden', boxShadow: shadowTokens.floating } } }}
      >
        <Box sx={{ padding: '16px 18px' }}>
          <Typography sx={{ color: '#0F172A', fontSize: '16px', fontWeight: 800 }}>การแจ้งเตือน</Typography>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: 470, overflowY: 'auto' }}>
          {notificationsLoading ? (
            <Box sx={{ minHeight: 140, display: 'grid', placeItems: 'center' }}><CircularProgress size={28} /></Box>
          ) : notificationsError ? (
            <Box sx={{ padding: '28px 20px', textAlign: 'center' }}><Typography sx={{ color: '#64748B', fontSize: '13px' }}>{notificationsError}</Typography><Button size="small" onClick={loadNotifications} sx={{ marginTop: '10px' }}>ลองใหม่</Button></Box>
          ) : notifications.length === 0 ? (
            <Typography sx={{ padding: '34px 20px', color: '#94A3B8', fontSize: '13px', textAlign: 'center' }}>ยังไม่มีการแจ้งเตือน</Typography>
          ) : notifications.map((item, index) => {
            const unread = !isNotificationRead(item);
            return (
              <Box key={item.id || item.notificationId || index}>
                <ButtonBase type="button" onClick={() => handleNotificationClick(item)} sx={{ width: '100%', padding: '13px 18px', display: 'block', textAlign: 'left', backgroundColor: unread ? '#F8FAFF' : '#FFFFFF', '&:hover': { backgroundColor: '#F8FAFC' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <Typography sx={{ color: unread ? '#0F172A' : '#475569', fontSize: '13px', fontWeight: unread ? 800 : 600, lineHeight: 1.45 }}>{item.title || 'การแจ้งเตือน'}</Typography>
                    {unread ? <Typography sx={{ color: '#DC2626', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}>ใหม่</Typography> : null}
                  </Box>
                  <Typography sx={{ color: '#64748B', fontSize: '12px', lineHeight: 1.55, marginTop: '3px' }}>{item.message || item.description || ''}</Typography>
                  <Typography sx={{ color: '#94A3B8', fontSize: '10px', marginTop: '5px' }}>{item.createdAt ? new Date(item.createdAt).toLocaleString('th-TH') : ''}</Typography>
                </ButtonBase>
                {index < notifications.length - 1 ? <Divider /> : null}
              </Box>
            );
          })}
        </Box>
      </Popover>

      <Menu
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={() => setAccountAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 230, marginTop: '8px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: shadowTokens.floating } } }}
      >
        <Box sx={{ padding: '8px 16px 12px' }}>
          <Typography noWrap sx={{ color: '#0F172A', fontSize: '13px', fontWeight: 800 }}>{displayName}</Typography>
          <Typography sx={{ color: '#64748B', fontSize: '11px', marginTop: '2px' }}>{profileRoleLabel}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAccountAnchor(null); navigate(`/${currentRole}/profile`); }} sx={{ gap: '10px', fontSize: '13px', paddingBlock: '10px' }}><PersonOutlineRounded fontSize="small" />ข้อมูลส่วนตัว</MenuItem>
        <MenuItem onClick={() => { setAccountAnchor(null); handleLogout(); }} sx={{ gap: '10px', color: '#DC2626', fontSize: '13px', paddingBlock: '10px' }}><LogoutRounded fontSize="small" />ออกจากระบบ</MenuItem>
      </Menu>


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

              backgroundColor:
                '#FFFFFF',

              borderRight:
                '1px solid #EEF2F6',
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
                '#475569',

              backgroundColor:
                '#F1F5F9',

              '&:hover': {
                backgroundColor:
                  '#E2E8F0',
              },
            }}
          >
            <CloseRounded />
          </IconButton>
        </Box>


        <Box
          sx={{
            padding:
              '10px 12px 4px',
          }}
        >
          {renderUserInformation(true)}
        </Box>


        <Box
          component="nav"
          sx={{
            padding:
              '4px 14px 18px',

            display:
              'flex',

            flexDirection:
              'column',

            gap:
              '3px',
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

          <Box sx={{ flexGrow: 1, minHeight: '24px' }} />


          <Box sx={{ position: 'sticky', bottom: 0, marginTop: 'auto', paddingTop: '8px', backgroundColor: '#FFFFFF' }}>
            {visibleAccountMenuItems.length > 0 && renderSectionTitle('บัญชี')}
            {visibleAccountMenuItems.map((menuItem) => renderNavigationItem(menuItem, true))}
          </Box>
        </Box>
      </Drawer>


      {/* =========================
          DESKTOP SIDEBAR
      ========================== */}
      {!desktopSidebarOpen && (
        <IconButton
          type="button"
          aria-label="เปิดเมนูนำทาง"
          onClick={() => setDesktopSidebarOpen(true)}
          sx={{
            position: 'fixed',
            top: '20px',
            left: '18px',
            zIndex: 19,
            display: { xs: 'none', md: 'inline-flex' },
            width: '42px',
            height: '42px',
            color: resolvedTheme.primary,
            backgroundColor: 'transparent',
            border: 0,
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': { backgroundColor: resolvedTheme.soft },
          }}
        >
          <MenuRounded />
        </IconButton>
      )}

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
            desktopSidebarOpen ? 0 : '-280px',

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
            '1px solid #EEF2F6',

          boxShadow: 'none',

          overflowY: 'hidden',

          overflowX:
            'hidden',

          transition:
            'left 220ms ease',
        }}
      >

        <IconButton
          type="button"
          aria-label="ปิดเมนูนำทาง"
          onClick={() => setDesktopSidebarOpen(false)}
          sx={{
            position: 'absolute',
            top: '18px',
            right: '14px',
            zIndex: 3,
            width: '40px',
            height: '40px',
            color: '#475569',
            backgroundColor: 'transparent',
            border: 0,
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': { color: resolvedTheme.primary, backgroundColor: resolvedTheme.soft },
          }}
        >
          <MenuRounded />
        </IconButton>

        {/* Brand */}
        {renderBrand(false)}


        {/* Profile */}
        <Box
          sx={{
            padding:
              '10px 12px 4px',

            flexShrink:
              0,
          }}
        >
          {renderUserInformation(false)}
        </Box>


        {/* Navigation */}
        <Box
          component="nav"
          sx={{
            flex:
              1,

            padding:
              '4px 14px 20px',

            display:
              'flex',

            flexDirection:
              'column',

            gap:
              '3px',
            overflowY: 'auto',
            minHeight: 0,
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

          <Box sx={{ flexGrow: 1, minHeight: '24px' }} />


          <Box sx={{ position: 'sticky', bottom: 0, marginTop: 'auto', paddingTop: '8px', paddingBottom: '4px', backgroundColor: '#FFFFFF' }}>
            {visibleAccountMenuItems.length > 0 && renderSectionTitle('บัญชี')}
            {visibleAccountMenuItems.map((menuItem) => renderNavigationItem(menuItem, false))}
          </Box>
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
              desktopSidebarOpen ? 'calc(100% - 280px)' : '100%',
          },

          minWidth:
            0,

          minHeight:
            '100vh',

          background: appPageBackground,

          marginLeft: {
            xs:
              0,

            md:
              desktopSidebarOpen ? '280px' : 0,
          },

          padding: {
            xs:
              '88px 18px 24px',

            sm:
              '92px 24px 28px',

            md:
              desktopSidebarOpen ? '32px' : '32px 32px 32px 72px',

            lg:
              desktopSidebarOpen ? '32px 40px' : '32px 40px 32px 72px',
          },

          overflowX:
            'hidden',
          position: 'relative',
          transition: 'width 220ms ease, margin-left 220ms ease',
          '& h1': {
            fontSize: {
              xs: '26px !important',
              sm: '30px !important',
            },
            fontWeight: '700 !important',
            lineHeight: '1.3 !important',
            letterSpacing: '-0.02em !important',
          },
          '& h2': {
            fontSize: '1.125rem',
            fontWeight: '600',
            lineHeight: '1.45',
          },
          '& h3, & h4, & h5, & h6': {
            fontWeight: '600',
          },
          '& .MuiPaper-root:not(.MuiPopover-paper):not(.MuiDialog-paper)': {
            borderRadius: '16px',
          },
          '& .MuiPaper-root:not(.MuiPopover-paper):not(.MuiDialog-paper) > .MuiBox-root:first-of-type': {
            borderBottom: '0 !important',
          },
          '& .MuiPaper-root:not(.MuiPopover-paper):not(.MuiDialog-paper) > .MuiBox-root:last-of-type': {
            borderTop: '0 !important',
          },
          '& .MuiButton-root': {
            minHeight: '44px',
            borderRadius: '11px',
            fontWeight: '500',
            paddingInline: '16px',
          },
          '& .MuiButton-sizeSmall': {
            minHeight: '36px',
          },
          '& .MuiOutlinedInput-root:not(.MuiInputBase-multiline)': {
            height: '44px',
            minHeight: '44px',
            borderRadius: '11px',
          },
          '& .MuiInputLabel-root, & .MuiFormLabel-root': {
            fontSize: '0.875rem',
            fontWeight: '500',
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            fontWeight: '400',
            marginTop: '4px',
          },
          '& .MuiTableCell-head': {
            height: '44px',
            fontWeight: '600',
          },
          '& .MuiTableCell-root': {
            paddingBlock: '12px',
          },
        }}
      >
        {isDashboardPage && (
          <Box
            className="role-page-global-action"
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '16px',
            }}
          >
            {renderGlobalActions()}
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
}


export default RoleLayout;
