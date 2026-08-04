import RoleChangePasswordPage from '../../components/rolechangepasswordpage.jsx';

import AdminLayout from '../../layouts/adminlayout.jsx';

const adminTheme = {
  primary: '#EA580C',
  dark: '#C2410C',
  soft: '#FFF7ED',
  border: '#FED7AA',
  text: '#9A3412',
};

function AdminChangePasswordPage() {
  return (
    <RoleChangePasswordPage
      LayoutComponent={
        AdminLayout
      }
      theme={
        adminTheme
      }
    />
  );
}

export default AdminChangePasswordPage;