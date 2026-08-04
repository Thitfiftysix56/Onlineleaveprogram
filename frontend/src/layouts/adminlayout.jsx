import RoleLayout from '../components/rolelayout.jsx';

function AdminLayout({
  children,
  activeMenu = '',
}) {
  const adminMenuItems = [
    'Dashboard',
    'Leave Request',
    'My Requests',
    'Leave Balance',
    'User Management',
    'Department Management',
    'Position Management',
    'Audit Log',
    'Notification',
    'Profile',
    'Change Password',
    'Logout',
  ];

  const adminTheme = {
    primary: '#EA580C',
    dark: '#C2410C',
    soft: '#FFF7ED',
  };

  return (
    <RoleLayout
      activeMenu={activeMenu}
      menuItems={adminMenuItems}
      theme={adminTheme}
    >
      {children}
    </RoleLayout>
  );
}

export default AdminLayout;