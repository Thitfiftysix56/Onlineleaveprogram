import HRLayout from '../../layouts/hrlayout.jsx';
import RoleNotificationPage from '../../components/rolenotificationpage.jsx';

const hrTheme = {
  primary: '#059669',
  dark: '#047857',
  soft: '#ECFDF5',
  border: '#A7F3D0',
  text: '#065F46',
  unreadBackground: '#F0FDF4',
};

function HRNotificationPage() {
  return (
    <RoleNotificationPage
      LayoutComponent={
        HRLayout
      }
      pageTitle="การแจ้งเตือน"
      pageDescription=""
      theme={
        hrTheme
      }
    />
  );
}

export default HRNotificationPage;
