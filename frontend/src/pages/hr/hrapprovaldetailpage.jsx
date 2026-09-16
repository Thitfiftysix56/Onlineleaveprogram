import RoleLeaveRequestDetailPage from '../../components/roleleaverequestdetailpage.jsx';
import HRLayout from '../../layouts/hrlayout.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

export default function HRApprovalDetailPage() {
  return <RoleLeaveRequestDetailPage LayoutComponent={HRLayout} activeMenu="Approval" theme={roleAccentTokens.hr} viewerMode="hr-approver" />;
}
