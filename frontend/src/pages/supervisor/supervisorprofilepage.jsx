import RoleProfilePage from '../../components/roleprofilepage.jsx';

import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function SupervisorProfilePage() {
  return (
    <RoleProfilePage
      LayoutComponent={SupervisorLayout}
      theme={roleAccentTokens.supervisor}
    />
  );
}

export default SupervisorProfilePage;
