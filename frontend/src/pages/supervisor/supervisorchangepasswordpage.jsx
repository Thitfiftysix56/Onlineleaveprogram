import RoleChangePasswordPage from '../../components/rolechangepasswordpage.jsx';

import SupervisorLayout from '../../layouts/supervisorlayout.jsx';

const supervisorTheme = {
  primary: '#7C3AED',
  dark: '#6D28D9',
  soft: '#F3E8FF',
  border: '#DDD6FE',
  text: '#5B21B6',
};

function SupervisorChangePasswordPage() {
  return (
    <RoleChangePasswordPage
      LayoutComponent={
        SupervisorLayout
      }
      theme={
        supervisorTheme
      }
    />
  );
}

export default SupervisorChangePasswordPage;