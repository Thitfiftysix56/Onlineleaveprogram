import AdminLayout from '../../layouts/adminlayout.jsx';
import RoleNotificationPage from '../../components/rolenotificationpage.jsx';

/* =========================
   Admin Theme
========================= */

const adminTheme = {
  primary: '#EA580C',
  dark: '#C2410C',
  soft: '#FFF7ED',
  border: '#FED7AA',
  unreadBackground: '#FFF7ED',
};

/* =========================
   Component
========================= */

function AdminNotificationPage() {
  return (
    <RoleNotificationPage
      LayoutComponent={AdminLayout}
      pageTitle="การแจ้งเตือน"
      pageDescription=""
      theme={adminTheme}
    />
  );
}

export default AdminNotificationPage;