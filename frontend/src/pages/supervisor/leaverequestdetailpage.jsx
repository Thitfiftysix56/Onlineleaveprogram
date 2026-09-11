import RoleLeaveRequestDetailPage from '../../components/roleleaverequestdetailpage.jsx';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function LeaveRequestDetailPage() {
  return (
    <RoleLeaveRequestDetailPage
      LayoutComponent={SupervisorLayout}
      activeMenu="My Requests"
      theme={roleAccentTokens.supervisor}
      viewerMode="owner"
    />
  );
}

export default LeaveRequestDetailPage;
