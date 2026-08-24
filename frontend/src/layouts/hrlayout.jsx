import RoleLayout from '../components/rolelayout.jsx';
import { PageContainer } from '../components/sharedvisualfoundation.jsx';

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

  return (
    <RoleLayout
      activeMenu={activeMenu}
      menuItems={hrMenuItems}
    >
      <PageContainer>{children}</PageContainer>
    </RoleLayout>
  );
}

export default HRLayout;
