import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import RoleNotificationPage from '../../components/rolenotificationpage.jsx';
import {
  colorTokens,
  roleAccentTokens,
} from '../../theme/tokens.js';

const supervisorTheme = {
  ...roleAccentTokens.supervisor,
  unreadBackground: colorTokens.surfaceSubtle,
};

function SupervisorNotificationPage() {
  return (
    <RoleNotificationPage
      LayoutComponent={
        SupervisorLayout
      }
      pageTitle="การแจ้งเตือน"
      pageDescription=""
      theme={
        supervisorTheme
      }
    />
  );
}

export default SupervisorNotificationPage;
