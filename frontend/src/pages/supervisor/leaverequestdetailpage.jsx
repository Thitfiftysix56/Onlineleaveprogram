import RoleLeaveRequestDetailPage from '../../components/roleleaverequestdetailpage.jsx';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';

function LeaveRequestDetailPage() {
  const supervisorTheme = {
    primary: '#7C3AED',
    dark: '#6D28D9',
    soft: '#F5F3FF',
    border: '#DDD6FE',
    text: '#5B21B6',
  };

  return (
    <RoleLeaveRequestDetailPage
      LayoutComponent={SupervisorLayout}
      activeMenu="My Requests"
      theme={supervisorTheme}
      viewerMode="owner"
    />
  );
}

export default LeaveRequestDetailPage;