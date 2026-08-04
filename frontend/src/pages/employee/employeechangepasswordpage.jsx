import RoleChangePasswordPage from '../../components/rolechangepasswordpage.jsx';

import EmployeeLayout from '../../layouts/employeelayout.jsx';

const employeeTheme = {
  primary: '#2563EB',
  dark: '#1D4ED8',
  soft: '#EFF6FF',
  border: '#BFDBFE',
  text: '#1E3A8A',
};

function EmployeeChangePasswordPage() {
  return (
    <RoleChangePasswordPage
      LayoutComponent={
        EmployeeLayout
      }
      theme={
        employeeTheme
      }
    />
  );
}

export default EmployeeChangePasswordPage;