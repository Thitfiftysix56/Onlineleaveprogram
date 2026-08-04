import RoleLeaveRequestDetailPage from '../../components/roleleaverequestdetailpage.jsx';
import EmployeeLayout from '../../layouts/employeelayout.jsx';

function LeaveRequestDetailPage() {
  const employeeTheme = {
    primary: '#2563EB',
    dark: '#1D4ED8',
    soft: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1E40AF',
  };

  return (
    <RoleLeaveRequestDetailPage
      LayoutComponent={EmployeeLayout}
      activeMenu="My Requests"
      theme={employeeTheme}
      viewerMode="owner"
    />
  );
}

export default LeaveRequestDetailPage;