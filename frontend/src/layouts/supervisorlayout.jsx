import RoleLayout from '../components/rolelayout.jsx';
import { PageContainer } from '../components/sharedvisualfoundation.jsx';

function SupervisorLayout({
  children,
  activeMenu = '',
}) {
  const supervisorMenuItems = [
    'Dashboard',
    'My Requests',
    'Approval',
    'Team Reports',
    'Edit Personal Information',
    'Change Password',
    'Logout',
  ];

  return (
    <RoleLayout
      activeMenu={activeMenu}
      menuItems={supervisorMenuItems}
    >
      <PageContainer>{children}</PageContainer>
    </RoleLayout>
  );
}

export default SupervisorLayout;
