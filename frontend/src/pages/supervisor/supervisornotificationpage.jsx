import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import RoleNotificationPage from '../../components/rolenotificationpage.jsx';

const supervisorTheme = {
  primary: '#7C3AED',
  dark: '#6D28D9',
  soft: '#F3E8FF',
  border: '#DDD6FE',
  text: '#5B21B6',
  unreadBackground: '#FAF5FF',
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
