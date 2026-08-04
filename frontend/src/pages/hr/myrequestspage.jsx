import RoleMyRequestsPage from '../../components/rolemyrequestspage.jsx';
import HRLayout from '../../layouts/hrlayout.jsx';

function MyRequestsPage() {
  const hrTheme = {
    primary: '#059669',
    dark: '#047857',
    soft: '#ECFDF5',
  };

  return (
    <RoleMyRequestsPage
      LayoutComponent={HRLayout}
      theme={hrTheme}
    />
  );
}

export default MyRequestsPage;