import RoleLeaveBalancePage from '../../components/roleleavebalancepage.jsx';
import EmployeeLayout from '../../layouts/employeelayout.jsx';

function LeaveBalancePage() {
  const employeeTheme = {
    primary: '#2563EB',
    dark: '#1D4ED8',
    soft: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1E40AF',
  };

  return (
    <RoleLeaveBalancePage
      LayoutComponent={EmployeeLayout}
      theme={employeeTheme}
    />
  );
}

export default LeaveBalancePage;