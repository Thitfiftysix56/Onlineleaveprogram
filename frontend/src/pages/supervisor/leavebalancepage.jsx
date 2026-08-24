import RoleLeaveBalancePage from '../../components/roleleavebalancepage.jsx';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function LeaveBalancePage() {
  return (
    <RoleLeaveBalancePage
      LayoutComponent={SupervisorLayout}
      theme={roleAccentTokens.supervisor}
    />
  );
}

export default LeaveBalancePage;
