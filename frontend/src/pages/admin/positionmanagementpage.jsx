import RolePositionManagementPage from '../../components/rolepositionmanagementpage.jsx';
import AdminLayout from '../../layouts/adminlayout.jsx';

function PositionManagementPage() {
  const adminTheme = {
    primary: '#EA580C',
    dark: '#C2410C',
    soft: '#FFF7ED',
  };

  return (
    <RolePositionManagementPage
      LayoutComponent={AdminLayout}
      activeMenu="Position Management"
      theme={adminTheme}
    />
  );
}

export default PositionManagementPage;