import RoleProfilePage from '../../components/roleprofilepage.jsx';

import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function SupervisorProfilePage({ editMode = false }) {
  return (
    <RoleProfilePage
      LayoutComponent={SupervisorLayout}
      theme={roleAccentTokens.supervisor}
      editMode={editMode}
    />
  );
}

export default SupervisorProfilePage;
