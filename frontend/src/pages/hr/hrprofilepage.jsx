import RoleProfilePage from '../../components/roleprofilepage.jsx';

import HRLayout from '../../layouts/hrlayout.jsx';

const hrTheme = {
  primary: '#059669',
  dark: '#047857',
  soft: '#ECFDF5',
  border: '#A7F3D0',
  text: '#065F46',
};

function HRProfilePage() {
  return (
    <RoleProfilePage
      LayoutComponent={HRLayout}
      theme={hrTheme}
    />
  );
}

export default HRProfilePage;