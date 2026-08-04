import RoleLeaveRequestDetailPage from '../../components/roleleaverequestdetailpage.jsx';
import HRLayout from '../../layouts/hrlayout.jsx';

function LeaveRequestDetailPage() {
  const hrTheme = {
    primary: '#059669',
    dark: '#047857',
    soft: '#ECFDF5',
    border: '#A7F3D0',
    text: '#065F46',
  };

  return (
    <RoleLeaveRequestDetailPage
      LayoutComponent={HRLayout}
      activeMenu="My Requests"
      theme={hrTheme}
      viewerMode="owner"
    />
  );
}

export default LeaveRequestDetailPage;