import RoleLeaveRequestDetailPage from '../../components/roleleaverequestdetailpage.jsx';
import EmployeeLayout from '../../layouts/employeelayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function LeaveRequestDetailPage() {
  return (
    <RoleLeaveRequestDetailPage
      LayoutComponent={EmployeeLayout}
      activeMenu="My Requests"
      theme={roleAccentTokens.employee}
      viewerMode="owner"
    />
  );
}

export default LeaveRequestDetailPage;
