import RoleCreateLeaveRequestPage from '../../components/rolecreateleaverequestpage.jsx';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function CreateLeaveRequestPage() {
  return (
    <RoleCreateLeaveRequestPage
      LayoutComponent={SupervisorLayout}
      theme={roleAccentTokens.supervisor}
    />
  );
}

export default CreateLeaveRequestPage;
