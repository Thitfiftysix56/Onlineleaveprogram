import RoleLayout from '../components/rolelayout.jsx';

function HRLayout({
  children,
  activeMenu = '',
}) {
  const hrMenuItems = [
    'Dashboard',
    'Leave Request',
    'My Requests',
    'Leave Balance',
    'Employee Management',
    'Leave Entitlement',
    'Leave Type',
    'Holiday Management',
    'Reports',
    'Notification',
    'Profile',
    'Change Password',
    'Logout',
  ];

  const hrTheme = {
    primary: '#059669',
    dark: '#047857',
    soft: '#ECFDF5',
  };

  return (
    <RoleLayout
      activeMenu={activeMenu}
      menuItems={hrMenuItems}
      theme={hrTheme}
    >
      {children}
    </RoleLayout>
  );
}

export default HRLayout;