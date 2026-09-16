import RoleLayout from '../components/rolelayout.jsx';
import { PageContainer } from '../components/sharedvisualfoundation.jsx';

function EmployeeLayout({
  children,
  activeMenu = '',
}) {
  const employeeMenuItems = [
    'Dashboard',
    'My Requests',
    'Edit Personal Information',
    'Change Password',
    'Logout',
  ];

  return (
    <RoleLayout
      activeMenu={activeMenu}
      menuItems={employeeMenuItems}
    >
      <PageContainer>{children}</PageContainer>
    </RoleLayout>
  );
}

export default EmployeeLayout;
