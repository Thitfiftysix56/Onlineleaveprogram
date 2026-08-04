import RoleLeaveBalancePage from '../../components/roleleavebalancepage.jsx';
import HRLayout from '../../layouts/hrlayout.jsx';

function LeaveBalancePage() {
  const hrTheme = {
    primary: '#059669',
    dark: '#047857',
    soft: '#ECFDF5',
    border: '#A7F3D0',
    text: '#065F46',
  };

  return (
    <RoleLeaveBalancePage
      LayoutComponent={HRLayout}
      theme={hrTheme}
    />
  );
}

export default LeaveBalancePage;