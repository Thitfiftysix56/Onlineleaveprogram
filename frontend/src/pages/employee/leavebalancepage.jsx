import RoleLeaveBalancePage from '../../components/roleleavebalancepage.jsx';
import EmployeeLayout from '../../layouts/employeelayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

function CalibratedEmployeeLayout(props) {
  return <EmployeeLayout {...props} calibrated />;
}

function LeaveBalancePage() {
  return (
    <RoleLeaveBalancePage
      LayoutComponent={CalibratedEmployeeLayout}
      theme={roleAccentTokens.employee}
      visualCalibration
    />
  );
}

export default LeaveBalancePage;
