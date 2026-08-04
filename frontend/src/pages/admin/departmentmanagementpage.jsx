import RoleDepartmentManagementPage from '../../components/roledepartmentmanagementpage.jsx';
import AdminLayout from '../../layouts/adminlayout.jsx';

function DepartmentManagementPage() {
  const adminTheme = {
    primary: '#EA580C',
    dark: '#C2410C',
    soft: '#FFF7ED',
  };

  return (
    <RoleDepartmentManagementPage
      LayoutComponent={AdminLayout}
      activeMenu="Department Management"
      theme={adminTheme}
    />
  );
}

export default DepartmentManagementPage;