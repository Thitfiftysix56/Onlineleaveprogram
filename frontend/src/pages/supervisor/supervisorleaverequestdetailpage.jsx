import RoleLeaveRequestDetailPage from '../../components/roleleaverequestdetailpage.jsx';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function SupervisorLeaveRequestDetailPage() {
  return (
    <RoleLeaveRequestDetailPage
      LayoutComponent={SupervisorLayout}
      activeMenu="Approval"
      theme={roleAccentTokens.supervisor}
      viewerMode="supervisor"
    />
  );
}

export default SupervisorLeaveRequestDetailPage;
