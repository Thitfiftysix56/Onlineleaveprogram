import RoleLayout from '../components/rolelayout.jsx';

function EmployeeLayout({
  children,
  activeMenu = '',
}) {
  const employeeMenuItems = [
    'Dashboard',
    'Leave Request',
    'My Requests',
    'Leave Balance',
    'Notification',
    'Profile',
    'Change Password',
    'Logout',
  ];

  const employeeTheme = {
    primary: '#2563EB',
    dark: '#1D4ED8',
    soft: '#EFF6FF',
  };

  return (
    <RoleLayout
      activeMenu={activeMenu}
      menuItems={employeeMenuItems}
      theme={employeeTheme}
    >
      {children}
    </RoleLayout>
  );
}

export default EmployeeLayout;