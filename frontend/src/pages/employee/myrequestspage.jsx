import RoleMyRequestsPage from '../../components/rolemyrequestspage.jsx';
import EmployeeLayout from '../../layouts/employeelayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function CalibratedEmployeeLayout(props) {
  return <EmployeeLayout {...props} calibrated />;
}

function MyRequestsPage() {
  return (
    <RoleMyRequestsPage
      LayoutComponent={CalibratedEmployeeLayout}
      theme={roleAccentTokens.employee}
      visualCalibration
    />
  );
}

export default MyRequestsPage;
