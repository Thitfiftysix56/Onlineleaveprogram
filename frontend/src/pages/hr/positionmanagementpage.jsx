import RolePositionManagementPage from '../../components/rolepositionmanagementpage.jsx';
import HRLayout from '../../layouts/hrlayout.jsx';

function PositionManagementPage() {
  return (
    <RolePositionManagementPage
      LayoutComponent={HRLayout}
      activeMenu="Position Management"
      theme={{ primary: '#059669', dark: '#047857', soft: '#ECFDF5' }}
    />
  );
}

export default PositionManagementPage;
