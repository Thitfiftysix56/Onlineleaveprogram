import RoleDepartmentFormPage from '../../components/roledepartmentformpage.jsx';
import AdminLayout from '../../layouts/adminlayout.jsx';

function DepartmentFormPage({
  mode = 'add',
}) {
  const adminTheme = {
    primary: '#EA580C',
    dark: '#C2410C',
    soft: '#FFF7ED',
    border: '#FED7AA',
    text: '#9A3412',
  };

  return (
    <RoleDepartmentFormPage
      LayoutComponent={AdminLayout}
      activeMenu="Department Management"
      theme={adminTheme}
      mode={mode}
    />
  );
}

export default DepartmentFormPage;