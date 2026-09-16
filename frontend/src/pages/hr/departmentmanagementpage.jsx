import RoleDepartmentManagementPage from '../../components/roledepartmentmanagementpage.jsx';
import HRLayout from '../../layouts/hrlayout.jsx';

function DepartmentManagementPage() {
  return (
    <RoleDepartmentManagementPage
      LayoutComponent={HRLayout}
      activeMenu="Department Management"
      theme={{ primary: '#059669', dark: '#047857', soft: '#ECFDF5' }}
    />
  );
}

export default DepartmentManagementPage;
