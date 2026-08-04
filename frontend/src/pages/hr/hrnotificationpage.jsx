import RoleNotificationPage from '../../components/rolenotificationpage.jsx';
import HRLayout from '../../layouts/hrlayout.jsx';

function HRNotificationPage() {
  const hrTheme = {
    primary: '#059669',
    dark: '#047857',
    soft: '#ECFDF5',
    unreadBackground: '#F0FDF4',
  };

  const hrNotifications = [
    {
      id: 1,
      title: 'New employee account created',
      message:
        'The employee account for Thanawat Meechai (EMP006) was created successfully.',
      category: 'Employee',
      createdAt: '2026-07-21T09:30:00',
      isRead: false,
    },
    {
      id: 2,
      title: 'Leave request approved',
      message:
        'Supervisor User approved Annual Leave request LR-20260720-0012.',
      category: 'Leave Request',
      createdAt: '2026-07-21T08:45:00',
      isRead: false,
    },
    {
      id: 3,
      title: 'Leave entitlement updated',
      message:
        'Annual Leave entitlement for Employee User was updated to 10 days.',
      category: 'Entitlement',
      createdAt: '2026-07-20T15:20:00',
      isRead: false,
    },
    {
      id: 4,
      title: 'Leave request rejected',
      message:
        'Personal Leave request LR-20260719-0011 was rejected by the supervisor.',
      category: 'Leave Request',
      createdAt: '2026-07-20T10:15:00',
      isRead: true,
    },
    {
      id: 5,
      title: 'Holiday information updated',
      message:
        'Buddhist Lent Day was added to the organization holiday calendar.',
      category: 'System',
      createdAt: '2026-07-19T13:40:00',
      isRead: true,
    },
    {
      id: 6,
      title: 'Employee status changed',
      message:
        'The employment status of employee EMP005 was changed to Active.',
      category: 'Employee',
      createdAt: '2026-07-18T16:05:00',
      isRead: true,
    },
  ];

  return (
    <RoleNotificationPage
      LayoutComponent={HRLayout}
      pageTitle="HR Notification"
      pageDescription="Review employee, leave request and system notifications."
      initialNotifications={hrNotifications}
      theme={hrTheme}
    />
  );
}

export default HRNotificationPage;