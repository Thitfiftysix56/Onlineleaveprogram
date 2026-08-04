import RoleNotificationPage from '../../components/rolenotificationpage.jsx';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';

function SupervisorNotificationPage() {
  const supervisorTheme = {
    primary: '#7C3AED',
    dark: '#6D28D9',
    soft: '#F5F3FF',
    unreadBackground: '#FAF8FF',
  };

  const supervisorNotifications = [
    {
      id: 1,
      title: 'New leave request awaiting approval',
      message:
        'Employee User submitted Annual Leave request LR-20260721-0014.',
      category: 'Approval',
      createdAt: '2026-07-21T09:40:00',
      isRead: false,
    },
    {
      id: 2,
      title: 'New sick leave request',
      message:
        'Narin Chaiyasit submitted a Sick Leave request for 2 days.',
      category: 'Approval',
      createdAt: '2026-07-21T08:55:00',
      isRead: false,
    },
    {
      id: 3,
      title: 'Leave request approved',
      message:
        'You approved the Annual Leave request submitted by Employee User.',
      category: 'Leave Request',
      createdAt: '2026-07-20T15:20:00',
      isRead: true,
    },
    {
      id: 4,
      title: 'Leave request cancelled',
      message:
        'Employee EMP005 cancelled a pending leave request.',
      category: 'Leave Request',
      createdAt: '2026-07-19T13:10:00',
      isRead: true,
    },
    {
      id: 5,
      title: 'Account security notice',
      message:
        'Your account password was changed successfully.',
      category: 'Account',
      createdAt: '2026-07-18T10:05:00',
      isRead: true,
    },
  ];

  return (
    <RoleNotificationPage
      LayoutComponent={SupervisorLayout}
      pageTitle="Supervisor Notification"
      pageDescription="Review leave approval requests and account notifications."
      initialNotifications={supervisorNotifications}
      theme={supervisorTheme}
    />
  );
}

export default SupervisorNotificationPage;