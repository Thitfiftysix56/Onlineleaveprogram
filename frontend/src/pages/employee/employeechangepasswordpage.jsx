import RoleChangePasswordPage from '../../components/rolechangepasswordpage.jsx';

import EmployeeLayout from '../../layouts/employeelayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function EmployeeChangePasswordPage() {
  return (
    <RoleChangePasswordPage
      LayoutComponent={
        EmployeeLayout
      }
      theme={
        roleAccentTokens.employee
      }
    />
  );
}

export default EmployeeChangePasswordPage;
