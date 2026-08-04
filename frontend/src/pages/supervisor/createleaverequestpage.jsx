import RoleCreateLeaveRequestPage from '../../components/rolecreateleaverequestpage.jsx';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';

function CreateLeaveRequestPage() {
  const supervisorTheme = {
    primary: '#7C3AED',
    dark: '#6D28D9',
    soft: '#F5F3FF',
    border: '#DDD6FE',
    text: '#5B21B6',
  };

  return (
    <RoleCreateLeaveRequestPage
      LayoutComponent={SupervisorLayout}
      theme={supervisorTheme}
    />
  );
}

export default CreateLeaveRequestPage;