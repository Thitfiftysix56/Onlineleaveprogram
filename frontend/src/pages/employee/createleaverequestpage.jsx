import RoleCreateLeaveRequestPage from '../../components/rolecreateleaverequestpage.jsx';
import EmployeeLayout from '../../layouts/employeelayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function CreateLeaveRequestPage() {
  return (
    <RoleCreateLeaveRequestPage
      LayoutComponent={EmployeeLayout}
      theme={roleAccentTokens.employee}
    />
  );
}

export default CreateLeaveRequestPage;
