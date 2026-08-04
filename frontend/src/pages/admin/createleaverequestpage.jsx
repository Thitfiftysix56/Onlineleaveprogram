import RoleCreateLeaveRequestPage from '../../components/rolecreateleaverequestpage.jsx';
import AdminLayout from '../../layouts/adminlayout.jsx';

function CreateLeaveRequestPage() {
  const adminTheme = {
    primary: '#EA580C',
    dark: '#C2410C',
    soft: '#FFF7ED',
    border: '#FED7AA',
    text: '#9A3412',
  };

  return (
    <RoleCreateLeaveRequestPage
      LayoutComponent={AdminLayout}
      theme={adminTheme}
    />
  );
}

export default CreateLeaveRequestPage;