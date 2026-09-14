import RoleMyRequestsPage from '../../components/rolemyrequestspage.jsx';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function MyRequestsPage() {
  return (
    <RoleMyRequestsPage
      LayoutComponent={SupervisorLayout}
      theme={roleAccentTokens.supervisor}
    />
  );
}

export default MyRequestsPage;
