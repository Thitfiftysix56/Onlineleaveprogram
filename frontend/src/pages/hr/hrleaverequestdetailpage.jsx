import RoleLeaveRequestDetailPage from '../../components/roleleaverequestdetailpage.jsx';
import HRLayout from '../../layouts/hrlayout.jsx';

function HRLeaveRequestDetailPage() {
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
      activeMenu="Reports"
      theme={hrTheme}
      viewerMode="hr"
    />
  );
}

export default HRLeaveRequestDetailPage;