import RoleLayout from '../components/rolelayout.jsx';
import { PageContainer } from '../components/sharedvisualfoundation.jsx';

function AdminLayout({
  children,
  activeMenu = '',
}) {
  const adminMenuItems = [
    'Dashboard',
    'My Requests',
    'User Management',
    'Department Management',
    'Position Management',
    'Audit Log',
    'Edit Personal Information',
    'Change Password',
    'Logout',
  ];

  return (
    <RoleLayout
      activeMenu={activeMenu}
      menuItems={adminMenuItems}
    >
      <PageContainer>{children}</PageContainer>
    </RoleLayout>
  );
}

export default AdminLayout;
