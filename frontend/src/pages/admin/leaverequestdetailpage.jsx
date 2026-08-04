import RoleLeaveRequestDetailPage from '../../components/roleleaverequestdetailpage.jsx';
import AdminLayout from '../../layouts/adminlayout.jsx';

function LeaveRequestDetailPage() {
  const adminTheme = {
    primary: '#EA580C',
    dark: '#C2410C',
    soft: '#FFF7ED',
    border: '#FED7AA',
    text: '#9A3412',
  };

  return (
    <RoleLeaveRequestDetailPage
      LayoutComponent={AdminLayout}
      activeMenu="My Requests"
      theme={adminTheme}
      viewerMode="owner"
    />
  );
}

export default LeaveRequestDetailPage;