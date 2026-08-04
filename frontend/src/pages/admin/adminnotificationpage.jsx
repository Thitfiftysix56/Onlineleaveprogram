import RoleNotificationPage from '../../components/rolenotificationpage.jsx';
import AdminLayout from '../../layouts/adminlayout.jsx';

function AdminNotificationPage() {
  const adminTheme = {
    primary: '#EA580C',
    dark: '#C2410C',
    soft: '#FFF7ED',
    unreadBackground: '#FFFBF5',
  };

  const adminNotifications = [
    {
      id: 1,
      title: 'User account locked',
      message:
        'The account employee005 was locked after multiple failed login attempts.',
      category: 'Account',
      createdAt: '2026-07-21T09:45:00',
      isRead: false,
    },
    {
      id: 2,
      title: 'New user account created',
      message:
        'The account employee006 was created and assigned the Employee role.',
      category: 'Account',
      createdAt: '2026-07-21T08:30:00',
      isRead: false,
    },
    {
      id: 3,
      title: 'Department information updated',
      message:
        'The Information Technology department information was updated.',
      category: 'System',
      createdAt: '2026-07-20T15:30:00',
      isRead: true,
    },
    {
      id: 4,
      title: 'Position created',
      message:
        'The Marketing Officer position was added to the system.',
      category: 'System',
      createdAt: '2026-07-20T13:05:00',
      isRead: true,
    },
    {
      id: 5,
      title: 'Account status updated',
      message:
        'The account supervisor001 was changed to Active.',
      category: 'Account',
      createdAt: '2026-07-19T10:20:00',
      isRead: true,
    },
  ];

  return (
    <RoleNotificationPage
      LayoutComponent={AdminLayout}
      pageTitle="Admin Notification"
      pageDescription="Review account, organization structure and system notifications."
      initialNotifications={adminNotifications}
      theme={adminTheme}
    />
  );
}

export default AdminNotificationPage;