# Playwright E2E Test Report

- Test date: 2026-09-11 (Asia/Bangkok)
- Application: Online Leave Approval System
- Target: `http://localhost:18080`
- Browser: Microsoft Edge via Playwright
- Video: recorded for every test at 1280x720 (`.webm`)
- Command: `cd frontend && npm run test:e2e`
- Final result: **PASS — 16/16 tests**
- Duration: 3.2 minutes
- Execution: 1 worker, deterministic order, no retries

## Executive result

The tested release supports the core four-role leave workflow and the tested
authorization rules. All containers were healthy, every tested UI route rendered,
all tested API role boundaries were enforced, and the tested business records,
notifications, reports, balances, and audit entries were consistent.

## Coverage

### Authentication and UI routing

- Anonymous access to a protected route redirects to Login.
- Invalid credentials remain on Login and return a user-facing authentication error.
- Successful UI login and role dashboard routing were verified for:
  `employee001`, `supervisor001`, `hr001`, and `admin001`.
- 45 static role routes were opened and checked for a visible page, application
  crash text, request failures, browser runtime errors, and HTTP 5xx responses.
- Cross-role protected UI access redirects each signed-in user to their own dashboard.

### API authorization matrix

- All roles: profile, leave options, own requests, leave balance, notifications.
- Supervisor only: team approval inbox and team report.
- HR: Supervisor-request approval, employee, leave type, entitlement, holiday,
  and leave-report endpoints.
- Admin: user and audit-log endpoints plus the intended HR/Admin shared management
  endpoints.
- Negative access checks returned 401/403 as expected.

### Leave lifecycle and approval rules

- Employee draft create, update, and delete.
- Employee submit and cancel.
- Employee request appears in the assigned Supervisor inbox.
- Employee cannot approve a request.
- Supervisor approve and reject paths.
- Reject without a reason returns 400; a valid reason is persisted.
- A completed request cannot be decided twice (409).
- Supervisor's own request is routed to HR.
- Supervisor cannot self-approve; HR can approve the Supervisor request.
- Employee/Supervisor notifications match approved and rejected records.
- Supervisor team report and HR leave report contain the workflow records.
- Admin audit log contains submit, cancel, approve, and reject actions.
- Test leave records and used-day changes are cleaned up/restored after execution.

### Admin and HR management

- Department: create, update, status, list, delete.
- Position: create, update, status, list, delete.
- Leave type: create, update, automatic entitlements for active employees,
  status, delete.
- Holiday: create, update, list, delete.
- Admin user directory and HR employee directory reads.
- Audit evidence for every tested management mutation.
- Generated management test data is deleted after execution.

### Build and database synchronization

- `docker compose up -d --build` completed successfully.
- The 2026 Thailand holiday synchronization migration was added to the automatic
  migration list.
- Backend migration runs before Express starts.

## Findings

### Non-blocking React/MUI console warning

Some pages emit React 19 warnings when MUI layout props such as `alignItems`,
`justifyContent`, or `flexWrap` are forwarded to a DOM element. The pages render
and function, and this does not cause an API or workflow failure. The E2E monitor
records this as a known non-fatal framework warning and continues to fail on all
other console errors, page errors, failed requests, and HTTP 5xx responses.

Severity: Low. Recommended follow-up: move affected MUI system props into `sx`
or update the MUI/React combination after compatibility verification.

## Explicit limitations

The suite does not claim exhaustive testing of every possible input permutation.
The following require separate controlled tests:

- Successful password change for the four shared accounts, because it would alter
  the credentials supplied for ongoing use.
- Full forgot-password email/OTP delivery through the external Gmail account.
- Real attachment malware/content scanning and large-file behavior.
- Cross-browser coverage outside Microsoft Edge.
- Load, stress, accessibility, and penetration testing.

Existing backend automated tests provide additional validation-level coverage;
the Playwright suite focuses on deployed UI routing, real authentication/RBAC,
database-backed workflows, management lifecycles, notifications, reports, and audit logs.

## Artifacts

- HTML report: `frontend/playwright-report/index.html`
- JSON result: `frontend/test-results/results.json`
- Test videos: `frontend/test-results/**/video.webm` (also linked from the HTML report)
- Playwright configuration: `frontend/playwright.config.js`
- Test specifications: `frontend/e2e/`
