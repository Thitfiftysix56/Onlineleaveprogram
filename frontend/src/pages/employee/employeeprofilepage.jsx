import RoleProfilePage from '../../components/roleprofilepage.jsx';

import EmployeeLayout from '../../layouts/employeelayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function EmployeeProfilePage() {
  return (
    <RoleProfilePage
      LayoutComponent={
        EmployeeLayout
      }
      theme={
        roleAccentTokens.employee
      }
    />
  );
}

export default EmployeeProfilePage;
