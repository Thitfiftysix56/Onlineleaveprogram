import RoleMyRequestsPage from '../../components/rolemyrequestspage.jsx';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';

function MyRequestsPage() {
  const supervisorTheme = {
    primary: '#7C3AED',
    dark: '#6D28D9',
    soft: '#F5F3FF',
  };

  return (
    <RoleMyRequestsPage
      LayoutComponent={SupervisorLayout}
      theme={supervisorTheme}
    />
  );
}

export default MyRequestsPage;