import RoleLeaveBalancePage from '../../components/roleleavebalancepage.jsx';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';

function LeaveBalancePage() {
  const supervisorTheme = {
    primary: '#7C3AED',
    dark: '#6D28D9',
    soft: '#F5F3FF',
    border: '#DDD6FE',
    text: '#5B21B6',
  };

  return (
    <RoleLeaveBalancePage
      LayoutComponent={SupervisorLayout}
      theme={supervisorTheme}
    />
  );
}

export default LeaveBalancePage;