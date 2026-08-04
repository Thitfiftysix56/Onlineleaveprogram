import RoleCreateLeaveRequestPage from '../../components/rolecreateleaverequestpage.jsx';
import EmployeeLayout from '../../layouts/employeelayout.jsx';

function CreateLeaveRequestPage() {
  const employeeTheme = {
    primary: '#2563EB',
    dark: '#1D4ED8',
    soft: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1E40AF',
  };

  return (
    <RoleCreateLeaveRequestPage
      LayoutComponent={EmployeeLayout}
      theme={employeeTheme}
    />
  );
}

export default CreateLeaveRequestPage;