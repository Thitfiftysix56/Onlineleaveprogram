import RoleLayout from '../components/rolelayout.jsx';

function SupervisorLayout({
  children,
  activeMenu = '',
}) {
  const supervisorMenuItems = [
    'Dashboard',
    'Leave Request',
    'My Requests',
    'Leave Balance',
    'Approval',
    'Team Reports',
    'Notification',
    'Profile',
    'Change Password',
    'Logout',
  ];

  const supervisorTheme = {
    primary: '#7C3AED',
    dark: '#6D28D9',
    soft: '#F5F3FF',
  };

  return (
    <RoleLayout
      activeMenu={activeMenu}
      menuItems={supervisorMenuItems}
      theme={supervisorTheme}
    >
      {children}
    </RoleLayout>
  );
}

export default SupervisorLayout;