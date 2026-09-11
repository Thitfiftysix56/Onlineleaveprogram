import { useParams } from 'react-router-dom';
import RolePositionManagementPage from '../../components/rolepositionmanagementpage.jsx';
import AdminLayout from '../../layouts/adminlayout.jsx';

function PositionFormPage({
  mode = 'add',
}) {
  const { positionId } = useParams();
  const adminTheme = {
    primary: '#EA580C',
    dark: '#C2410C',
    soft: '#FFF7ED',
    border: '#FED7AA',
    text: '#9A3412',
  };

  return (
    <RolePositionManagementPage
      LayoutComponent={AdminLayout}
      activeMenu="Position Management"
      theme={adminTheme}
      initialFormMode={mode}
      initialPositionId={positionId}
    />
  );
}

export default PositionFormPage;
