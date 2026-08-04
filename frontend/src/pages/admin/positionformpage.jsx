import RolePositionFormPage from '../../components/rolepositionformpage.jsx';
import AdminLayout from '../../layouts/adminlayout.jsx';

function PositionFormPage({
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
    <RolePositionFormPage
      LayoutComponent={AdminLayout}
      activeMenu="Position Management"
      theme={adminTheme}
      mode={mode}
    />
  );
}

export default PositionFormPage;