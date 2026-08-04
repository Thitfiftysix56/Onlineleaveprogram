import RoleMyRequestsPage from '../../components/rolemyrequestspage.jsx';
import AdminLayout from '../../layouts/adminlayout.jsx';

function MyRequestsPage() {
  const adminTheme = {
    primary: '#EA580C',
    dark: '#C2410C',
    soft: '#FFF7ED',
  };

  return (
    <RoleMyRequestsPage
      LayoutComponent={AdminLayout}
      theme={adminTheme}
    />
  );
}

export default MyRequestsPage;