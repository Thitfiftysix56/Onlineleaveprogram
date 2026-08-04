import RoleLeaveBalancePage from '../../components/roleleavebalancepage.jsx';
import AdminLayout from '../../layouts/adminlayout.jsx';

function LeaveBalancePage() {
  const adminTheme = {
    primary: '#EA580C',
    dark: '#C2410C',
    soft: '#FFF7ED',
    border: '#FED7AA',
    text: '#9A3412',
  };

  return (
    <RoleLeaveBalancePage
      LayoutComponent={AdminLayout}
      theme={adminTheme}
    />
  );
}

export default LeaveBalancePage;