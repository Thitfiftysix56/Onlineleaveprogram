import RoleChangePasswordPage from '../../components/rolechangepasswordpage.jsx';

import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function SupervisorChangePasswordPage() {
  return (
    <RoleChangePasswordPage
      LayoutComponent={
        SupervisorLayout
      }
      theme={
        roleAccentTokens.supervisor
      }
    />
  );
}

export default SupervisorChangePasswordPage;
