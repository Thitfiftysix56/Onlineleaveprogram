import RoleProfilePage from '../../components/roleprofilepage.jsx';

import AdminLayout from '../../layouts/adminlayout.jsx';

const adminTheme = {
  primary: '#EA580C',
  dark: '#C2410C',
  soft: '#FFF7ED',
  border: '#FED7AA',
  text: '#9A3412',
};

function AdminProfilePage({ editMode = false }) {
  return (
    <RoleProfilePage
      LayoutComponent={AdminLayout}
      theme={adminTheme}
      editMode={editMode}
    />
  );
}

export default AdminProfilePage;
