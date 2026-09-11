import RoleProfilePage from '../../components/roleprofilepage.jsx';

import EmployeeLayout from '../../layouts/employeelayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function EmployeeProfilePage({ editMode = false }) {
  return (
    <RoleProfilePage
      LayoutComponent={
        EmployeeLayout
      }
      theme={
        roleAccentTokens.employee
      }
      editMode={editMode}
    />
  );
}

export default EmployeeProfilePage;
