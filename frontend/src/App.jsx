import {
  lazy,
  Suspense,
} from 'react';

import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import ProtectedRoute from './components/protectedroute.jsx';

const LoginPage = lazy(() =>
  import('./pages/loginpage.jsx')
);

import {
  getCurrentUser,
  getDashboardPathByRole,
} from './utils/authstorage.js';

/* =========================
   Employee
========================= */

const EmployeeDashboardPage = lazy(() => import('./pages/employee/employeedashboardpage.jsx'));
const EmployeeCreateLeaveRequestPage = lazy(() => import('./pages/employee/createleaverequestpage.jsx'));
const EmployeeMyRequestsPage = lazy(() => import('./pages/employee/myrequestspage.jsx'));
const EmployeeLeaveRequestDetailPage = lazy(() => import('./pages/employee/leaverequestdetailpage.jsx'));
const EmployeeLeaveBalancePage = lazy(() => import('./pages/employee/leavebalancepage.jsx'));
const EmployeeNotificationPage = lazy(() => import('./pages/employee/employeenotificationpage.jsx'));
const EmployeeProfilePage = lazy(() => import('./pages/employee/employeeprofilepage.jsx'));
const EmployeeChangePasswordPage = lazy(() => import('./pages/employee/employeechangepasswordpage.jsx'));

/* =========================
   Supervisor
========================= */

const SupervisorDashboardPage = lazy(() => import('./pages/supervisor/supervisordashboardpage.jsx'));
const SupervisorCreateLeaveRequestPage = lazy(() => import('./pages/supervisor/createleaverequestpage.jsx'));
const SupervisorMyRequestsPage = lazy(() => import('./pages/supervisor/myrequestspage.jsx'));
const SupervisorOwnLeaveRequestDetailPage = lazy(() => import('./pages/supervisor/leaverequestdetailpage.jsx'));
const SupervisorLeaveBalancePage = lazy(() => import('./pages/supervisor/leavebalancepage.jsx'));
const ApprovalPendingListPage = lazy(() => import('./pages/supervisor/approvalpendinglistpage.jsx'));
const SupervisorLeaveRequestDetailPage = lazy(() => import('./pages/supervisor/supervisorleaverequestdetailpage.jsx'));
const SupervisorReportsPage = lazy(() => import('./pages/supervisor/supervisorreportspage.jsx'));
const SupervisorNotificationPage = lazy(() => import('./pages/supervisor/supervisornotificationpage.jsx'));
const SupervisorProfilePage = lazy(() => import('./pages/supervisor/supervisorprofilepage.jsx'));
const SupervisorChangePasswordPage = lazy(() => import('./pages/supervisor/supervisorchangepasswordpage.jsx'));

/* =========================
   HR
========================= */

const HRDashboardPage = lazy(() => import('./pages/hr/hrdashboardpage.jsx'));
const HRCreateLeaveRequestPage = lazy(() => import('./pages/hr/createleaverequestpage.jsx'));
const HRMyRequestsPage = lazy(() => import('./pages/hr/myrequestspage.jsx'));
const HROwnLeaveRequestDetailPage = lazy(() => import('./pages/hr/leaverequestdetailpage.jsx'));
const HRLeaveBalancePage = lazy(() => import('./pages/hr/leavebalancepage.jsx'));
const EmployeeManagementPage = lazy(() => import('./pages/hr/employeemanagementpage.jsx'));
const EmployeeFormPage = lazy(() => import('./pages/hr/employeeformpage.jsx'));
const LeaveEntitlementManagementPage = lazy(() => import('./pages/hr/leaveentitlementmanagementpage.jsx'));
const LeaveTypeManagementPage = lazy(() => import('./pages/hr/leavetypemanagementpage.jsx'));
const LeaveTypeFormPage = lazy(() => import('./pages/hr/leavetypeformpage.jsx'));
const HolidayManagementPage = lazy(() => import('./pages/hr/holidaymanagementpage.jsx'));
const HRReportsPage = lazy(() => import('./pages/hr/hrreportspage.jsx'));
const HRLeaveRequestDetailPage = lazy(() => import('./pages/hr/hrleaverequestdetailpage.jsx'));
const HRNotificationPage = lazy(() => import('./pages/hr/hrnotificationpage.jsx'));
const HRProfilePage = lazy(() => import('./pages/hr/hrprofilepage.jsx'));
const HRChangePasswordPage = lazy(() => import('./pages/hr/hrchangepasswordpage.jsx'));

/* =========================
   Admin
========================= */

const AdminDashboardPage = lazy(() => import('./pages/admin/admindashboardpage.jsx'));
const AdminCreateLeaveRequestPage = lazy(() => import('./pages/admin/createleaverequestpage.jsx'));
const AdminMyRequestsPage = lazy(() => import('./pages/admin/myrequestspage.jsx'));
const AdminLeaveRequestDetailPage = lazy(() => import('./pages/admin/leaverequestdetailpage.jsx'));
const AdminLeaveBalancePage = lazy(() => import('./pages/admin/leavebalancepage.jsx'));
const UserManagementPage = lazy(() => import('./pages/admin/usermanagementpage.jsx'));
const UserFormPage = lazy(() => import('./pages/admin/userformpage.jsx'));
const DepartmentManagementPage = lazy(() => import('./pages/admin/departmentmanagementpage.jsx'));
const DepartmentFormPage = lazy(() => import('./pages/admin/departmentformpage.jsx'));
const PositionManagementPage = lazy(() => import('./pages/admin/positionmanagementpage.jsx'));
const PositionFormPage = lazy(() => import('./pages/admin/positionformpage.jsx'));
const AuditLogPage = lazy(() => import('./pages/admin/auditlogpage.jsx'));
const AdminNotificationPage = lazy(() => import('./pages/admin/adminnotificationpage.jsx'));
const AdminProfilePage = lazy(() => import('./pages/admin/adminprofilepage.jsx'));
const AdminChangePasswordPage = lazy(() => import('./pages/admin/adminchangepasswordpage.jsx'));

function RootRedirect() {
  const currentUser =
    getCurrentUser();

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <Navigate
      to={getDashboardPathByRole(
        currentUser.role,
      )}
      replace
    />
  );
}

function App() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            color: '#475569',
            fontFamily: 'sans-serif',
          }}
        >
          Loading...
        </div>
      }
    >
      <Routes>
      <Route
        path="/"
        element={
          <RootRedirect />
        }
      />

      <Route
        path="/login"
        element={
          <LoginPage />
        }
      />

      {/* =====================
          Employee Routes
      ====================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              'employee',
            ]}
          />
        }
      >
        <Route
          path="/employee/dashboard"
          element={
            <EmployeeDashboardPage />
          }
        />

        <Route
          path="/employee/leave-request"
          element={
            <EmployeeCreateLeaveRequestPage />
          }
        />

        <Route
          path="/employee/my-requests"
          element={
            <EmployeeMyRequestsPage />
          }
        />

        <Route
          path="/employee/my-requests/:requestId"
          element={
            <EmployeeLeaveRequestDetailPage />
          }
        />

        <Route
          path="/employee/leave-balance"
          element={
            <EmployeeLeaveBalancePage />
          }
        />

        <Route
          path="/employee/notifications"
          element={
            <EmployeeNotificationPage />
          }
        />

        <Route
          path="/employee/profile"
          element={
            <EmployeeProfilePage />
          }
        />

        <Route
          path="/employee/change-password"
          element={
            <EmployeeChangePasswordPage />
          }
        />
      </Route>

      {/* =====================
          Supervisor Routes
      ====================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              'supervisor',
            ]}
          />
        }
      >
        <Route
          path="/supervisor/dashboard"
          element={
            <SupervisorDashboardPage />
          }
        />

        <Route
          path="/supervisor/leave-request"
          element={
            <SupervisorCreateLeaveRequestPage />
          }
        />

        <Route
          path="/supervisor/my-requests"
          element={
            <SupervisorMyRequestsPage />
          }
        />

        <Route
          path="/supervisor/my-requests/:requestId"
          element={
            <SupervisorOwnLeaveRequestDetailPage />
          }
        />

        <Route
          path="/supervisor/leave-balance"
          element={
            <SupervisorLeaveBalancePage />
          }
        />

        <Route
          path="/supervisor/approval"
          element={
            <ApprovalPendingListPage />
          }
        />

        <Route
          path="/supervisor/approval/:requestId"
          element={
            <SupervisorLeaveRequestDetailPage />
          }
        />

        <Route
          path="/supervisor/team-reports"
          element={
            <SupervisorReportsPage />
          }
        />

        <Route
          path="/supervisor/notifications"
          element={
            <SupervisorNotificationPage />
          }
        />

        <Route
          path="/supervisor/profile"
          element={
            <SupervisorProfilePage />
          }
        />

        <Route
          path="/supervisor/change-password"
          element={
            <SupervisorChangePasswordPage />
          }
        />
      </Route>

      {/* =====================
          HR Routes
      ====================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              'hr',
            ]}
          />
        }
      >
        <Route
          path="/hr/dashboard"
          element={
            <HRDashboardPage />
          }
        />

        <Route
          path="/hr/leave-request"
          element={
            <HRCreateLeaveRequestPage />
          }
        />

        <Route
          path="/hr/my-requests"
          element={
            <HRMyRequestsPage />
          }
        />

        <Route
          path="/hr/my-requests/:requestId"
          element={
            <HROwnLeaveRequestDetailPage />
          }
        />

        <Route
          path="/hr/leave-balance"
          element={
            <HRLeaveBalancePage />
          }
        />

        <Route
          path="/hr/employee-management"
          element={
            <EmployeeManagementPage />
          }
        />

        <Route
          path="/hr/employee-management/add"
          element={
            <EmployeeFormPage
              mode="add"
            />
          }
        />

        <Route
          path="/hr/employee-management/:employeeId/edit"
          element={
            <EmployeeFormPage
              mode="edit"
            />
          }
        />

        <Route
          path="/hr/leave-entitlement"
          element={
            <LeaveEntitlementManagementPage />
          }
        />

        <Route
          path="/hr/leave-types"
          element={
            <LeaveTypeManagementPage />
          }
        />

        <Route
          path="/hr/leave-types/add"
          element={
            <LeaveTypeFormPage
              mode="add"
            />
          }
        />

        <Route
          path="/hr/leave-types/:leaveTypeId/edit"
          element={
            <LeaveTypeFormPage
              mode="edit"
            />
          }
        />

        <Route
          path="/hr/holiday-management"
          element={
            <HolidayManagementPage />
          }
        />

        <Route
          path="/hr/reports"
          element={
            <HRReportsPage />
          }
        />

        <Route
          path="/hr/reports/leave-requests/:requestId"
          element={
            <HRLeaveRequestDetailPage />
          }
        />

        <Route
          path="/hr/notifications"
          element={
            <HRNotificationPage />
          }
        />

        <Route
          path="/hr/profile"
          element={
            <HRProfilePage />
          }
        />

        <Route
          path="/hr/change-password"
          element={
            <HRChangePasswordPage />
          }
        />
      </Route>

      {/* =====================
          Admin Routes
      ====================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              'admin',
            ]}
          />
        }
      >
        <Route
          path="/admin/dashboard"
          element={
            <AdminDashboardPage />
          }
        />

        <Route
          path="/admin/leave-request"
          element={
            <AdminCreateLeaveRequestPage />
          }
        />

        <Route
          path="/admin/my-requests"
          element={
            <AdminMyRequestsPage />
          }
        />

        <Route
          path="/admin/my-requests/:requestId"
          element={
            <AdminLeaveRequestDetailPage />
          }
        />

        <Route
          path="/admin/leave-balance"
          element={
            <AdminLeaveBalancePage />
          }
        />

        <Route
          path="/admin/user-management"
          element={
            <UserManagementPage />
          }
        />

        <Route
          path="/admin/user-management/add"
          element={
            <UserFormPage
              mode="add"
            />
          }
        />

        <Route
          path="/admin/user-management/:userId/edit"
          element={
            <UserFormPage
              mode="edit"
            />
          }
        />

        <Route
          path="/admin/department-management"
          element={
            <DepartmentManagementPage />
          }
        />

        <Route
          path="/admin/department-management/add"
          element={
            <DepartmentFormPage
              mode="add"
            />
          }
        />

        <Route
          path="/admin/department-management/:departmentId/edit"
          element={
            <DepartmentFormPage
              mode="edit"
            />
          }
        />

        <Route
          path="/admin/position-management"
          element={
            <PositionManagementPage />
          }
        />

        <Route
          path="/admin/position-management/add"
          element={
            <PositionFormPage
              mode="add"
            />
          }
        />

        <Route
          path="/admin/position-management/:positionId/edit"
          element={
            <PositionFormPage
              mode="edit"
            />
          }
        />

        <Route
          path="/admin/audit-log"
          element={
            <AuditLogPage />
          }
        />

        <Route
          path="/admin/notifications"
          element={
            <AdminNotificationPage />
          }
        />

        <Route
          path="/admin/profile"
          element={
            <AdminProfilePage />
          }
        />

        <Route
          path="/admin/change-password"
          element={
            <AdminChangePasswordPage />
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <RootRedirect />
        }
      />
      </Routes>
    </Suspense>
  );
}

export default App;
