import RoleNotificationPage from '../../components/rolenotificationpage.jsx';
import EmployeeLayout from '../../layouts/employeelayout.jsx';

function EmployeeNotificationPage() {
  const employeeTheme = {
    primary: '#2563EB',
    dark: '#1D4ED8',
    soft: '#EFF6FF',
    unreadBackground: '#F8FAFF',
  };

  const employeeNotifications = [
    {
      id: 1,
      title: 'Leave request approved',
      message:
        'Your Annual Leave request LR-20260718-0010 was approved by your supervisor.',
      category: 'Leave Request',
      createdAt: '2026-07-21T09:30:00',
      isRead: false,
    },
    {
      id: 2,
      title: 'Leave request submitted',
      message:
        'Your Sick Leave request was submitted successfully and is waiting for approval.',
      category: 'Leave Request',
      createdAt: '2026-07-21T08:20:00',
      isRead: false,
    },
    {
      id: 3,
      title: 'Leave entitlement updated',
      message:
        'Your Annual Leave entitlement was updated to 10 days.',
      category: 'Entitlement',
      createdAt: '2026-07-20T14:45:00',
      isRead: true,
    },
    {
      id: 4,
      title: 'Leave request rejected',
      message:
        'Your Personal Leave request was rejected. Open the request detail to review the reason.',
      category: 'Leave Request',
      createdAt: '2026-07-19T11:15:00',
      isRead: true,
    },
    {
      id: 5,
      title: 'Account information updated',
      message:
        'Your profile contact information was updated successfully.',
      category: 'Account',
      createdAt: '2026-07-18T16:30:00',
      isRead: true,
    },
  ];

  return (
    <RoleNotificationPage
      LayoutComponent={EmployeeLayout}
      pageTitle="Employee Notification"
      pageDescription="Review updates about your leave requests, entitlement and account."
      initialNotifications={employeeNotifications}
      theme={employeeTheme}
    />
  );
}

export default EmployeeNotificationPage;