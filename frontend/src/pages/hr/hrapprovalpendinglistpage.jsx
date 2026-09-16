import ApprovalPendingListPage from '../supervisor/approvalpendinglistpage.jsx';
import HRLayout from '../../layouts/hrlayout.jsx';

export default function HRApprovalPendingListPage() {
  return <ApprovalPendingListPage LayoutComponent={HRLayout} approvalsApiPath="/hr/approvals" approvalPagePath="/hr/approval" />;
}
