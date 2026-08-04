import RoleMyRequestsPage from '../../components/rolemyrequestspage.jsx';
import EmployeeLayout from '../../layouts/employeelayout.jsx';

function MyRequestsPage() {
  const employeeTheme = {
    primary: '#2563EB',
    dark: '#1D4ED8',
    soft: '#EFF6FF',
  };

  return (
    <RoleMyRequestsPage
      LayoutComponent={EmployeeLayout}
      theme={employeeTheme}
    />
  );
}

export default MyRequestsPage;