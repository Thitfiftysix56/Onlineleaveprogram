import RoleLayout from '../components/rolelayout.jsx';
import { PageContainer } from '../components/sharedvisualfoundation.jsx';

function HRLayout({
  children,
  activeMenu = '',
}) {
  const hrMenuItems = [
    'Dashboard',
    'My Requests',
    'Approval',
    'Employee Management',
    'Leave Entitlement',
    'Leave Type',
    'Holiday Management',
    'Reports',
    'Edit Personal Information',
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
