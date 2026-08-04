import RoleCreateLeaveRequestPage from '../../components/rolecreateleaverequestpage.jsx';
import HRLayout from '../../layouts/hrlayout.jsx';

function CreateLeaveRequestPage() {
  const hrTheme = {
    primary: '#059669',
    dark: '#047857',
    soft: '#ECFDF5',
    border: '#A7F3D0',
    text: '#065F46',
  };

  return (
    <RoleCreateLeaveRequestPage
      LayoutComponent={HRLayout}
      theme={hrTheme}
    />
  );
}

export default CreateLeaveRequestPage;