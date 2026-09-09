import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import RequestNumberText from './requestnumbertext.jsx';
import { BackButton, PageHeader } from './sharedvisualfoundation.jsx';

import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { cancelLeaveRequest, decideHrLeaveRequest, decideLeaveRequest, deleteLeaveDraft, getHrApproval, getLeaveReportRequests, getMyLeaveRequest, getSupervisorApproval } from '../api/leave-service.js';

function RoleLeaveRequestDetailPage({
  LayoutComponent,
  activeMenu = 'My Requests',
  theme,
  viewerMode = 'owner',
  requestData = null,
  allowAttachmentDownload = true,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId } = useParams();

  const pathRole =
    location.pathname.split('/')[1];

  const currentRole = [
    'employee',
    'supervisor',
    'hr',
    'admin',
  ].includes(pathRole)
    ? pathRole
    : 'employee';

  const numericRequestId =
    Number(requestId);

  const [request, setRequest] =
    useState(null);

  const [timeline, setTimeline] =
    useState([]);

  const [message, setMessage] =
    useState(null);

  const [
    selectedAction,
    setSelectedAction,
  ] = useState(null);

  const [
    rejectReason,
    setRejectReason,
  ] = useState('');

  const [
    rejectError,
    setRejectError,
  ] = useState('');

  const isOwner =
    viewerMode === 'owner';

  const isSupervisor =
    viewerMode === 'supervisor';

  const isHrApprover =
    viewerMode === 'hr-approver';

  const isApprover = isSupervisor || isHrApprover;

  const isHR =
    viewerMode === 'hr';

  const isAdminMetadata =
    viewerMode === 'admin-metadata';

  const buildTimeline = (
    selectedRequest,
    latestReason = '',
  ) => {
    if (!selectedRequest) {
      return [];
    }

    if (
      Array.isArray(
        selectedRequest.timeline,
      ) &&
      selectedRequest.timeline.length > 0
    ) {
      return selectedRequest.timeline;
    }

    const generatedTimeline = [];

    generatedTimeline.push({
      id: 'created',

      title:
        selectedRequest.status === 'draft'
          ? 'สร้างร่างคำขอลาแล้ว'
          : 'สร้างคำขอลาแล้ว',

      detail:
        selectedRequest.status === 'draft'
          ? 'คำขอลานี้ถูกบันทึกเป็นฉบับร่าง'
          : 'สร้างคำขอลาใหม่แล้ว',

      dateTime:
        selectedRequest.createdAt ||
        selectedRequest.submittedAt ||
        null,

      color: '#6B7280',
    });

    if (selectedRequest.submittedAt) {
      generatedTimeline.push({
        id: 'submitted',

        title: 'ส่งคำขอเพื่อรออนุมัติแล้ว',

        detail:
          'ส่งคำขอลาไปยังหัวหน้างานที่รับผิดชอบแล้ว',

        dateTime:
          selectedRequest.submittedAt,

        color: '#D97706',
      });
    }

    const normalizedStatus =
      String(
        selectedRequest.status || '',
      ).toLowerCase();

    if (normalizedStatus === 'approved') {
      generatedTimeline.push({
        id: 'approved',

        title: 'หัวหน้างานอนุมัติแล้ว',

        detail:
          'หัวหน้างานอนุมัติคำขอลานี้แล้ว',

        dateTime:
          selectedRequest.approvedAt ||
          selectedRequest.updatedAt ||
          null,

        color: '#059669',
      });
    }

    if (normalizedStatus === 'rejected') {
      const storedRejectReason =
        latestReason ||
        selectedRequest.rejectionReason ||
        selectedRequest.comment ||
        '';

      generatedTimeline.push({
        id: 'rejected',

        title: 'หัวหน้างานปฏิเสธแล้ว',

        detail: storedRejectReason
          ? `หัวหน้างานปฏิเสธคำขอลานี้ เหตุผล: ${storedRejectReason}`
          : 'หัวหน้างานปฏิเสธคำขอลานี้',

        dateTime:
          selectedRequest.rejectedAt ||
          selectedRequest.updatedAt ||
          null,

        color: '#DC2626',
      });
    }

    if (
      normalizedStatus === 'cancelled'
    ) {
      generatedTimeline.push({
        id: 'cancelled',

        title: 'พนักงานยกเลิกคำขอแล้ว',

        detail:
          'เจ้าของคำขอยกเลิกคำขอลานี้แล้ว',

        dateTime:
          selectedRequest.updatedAt ||
          null,

        color: '#6B7280',
      });
    }

    return generatedTimeline;
  };

  const getBackRoute = () => {
    const returnTo =
      location.state?.returnTo;

    if (
      typeof returnTo === 'string' &&
      returnTo.startsWith('/')
    ) {
      return returnTo;
    }

    if (viewerMode === 'supervisor') {
      return '/supervisor/approval';
    }

    if (viewerMode === 'hr') {
      return '/hr/reports';
    }

    if (viewerMode === 'hr-approver') {
      return '/hr/approval';
    }

    if (
      viewerMode === 'admin-metadata'
    ) {
      return '/admin/audit-log';
    }

    return `/${currentRole}/my-requests`;
  };

  const handleBack = () => {
    navigate(getBackRoute());
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
    const routedRequest =
      isHR &&
      Number(location.state?.requestData?.id) === numericRequestId
        ? location.state.requestData
        : null;

    let storedRequest = requestData || routedRequest;

    if (
      !storedRequest &&
      Number.isInteger(
        numericRequestId,
      ) &&
      numericRequestId > 0
    ) {
      if (isSupervisor) {
        storedRequest = await getSupervisorApproval(numericRequestId);
      } else if (isHrApprover) {
        storedRequest = await getHrApproval(numericRequestId);
      } else if (isHR) {
        const reportRequests = await getLeaveReportRequests();
        storedRequest = reportRequests.find(
          (item) => Number(item.id ?? item.leaveRequestId ?? item.leave_request_id) === numericRequestId,
        ) || null;
      } else {
        storedRequest = await getMyLeaveRequest(numericRequestId);
      }
    }

    if (
      !storedRequest &&
      requestData
    ) {
      storedRequest = requestData;
    }

    const belongsToCurrentOwner =
      !storedRequest?.role ||
      storedRequest.role === currentRole;

    if (
      isOwner &&
      storedRequest &&
      !belongsToCurrentOwner
    ) {
      storedRequest = null;
    }

    setRequest(storedRequest);

    setTimeline(
      buildTimeline(storedRequest),
    );

    setSelectedAction(null);
    setRejectReason('');
    setRejectError('');

    if (!storedRequest) {
      setMessage({
        severity: 'error',

        text: `Leave request #${requestId || '-'} was not found.`,
      });

      return;
    }

    setMessage(null);
    };
    load().catch((error) => { if (active) setMessage({severity:'error',text:error.response?.data?.message||`Leave request #${requestId || '-'} was not found.`}); });
    return () => { active = false; };
  }, [
    currentRole,
    isOwner,
    isSupervisor,
    isHrApprover,
    isHR,
    location.state,
    numericRequestId,
    requestData,
    requestId,
  ]);

  const currentStatus =
    String(
      request?.status || '',
    ).toLowerCase();

  const canEditDraft =
    isOwner &&
    currentStatus === 'draft';

  const canDeleteDraft =
    isOwner &&
    currentStatus === 'draft';

  const canCancelPending =
    isOwner &&
    currentStatus === 'pending';

  const canApprove =
    isApprover &&
    currentStatus === 'pending';

  const canReject =
    isApprover &&
    currentStatus === 'pending';

  const hasAvailableAction =
    canEditDraft ||
    canDeleteDraft ||
    canCancelPending ||
    canApprove ||
    canReject;

  const formatStatus = (status) => {
    if (!status) {
      return '-';
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const formatDate = (
    dateString,
  ) => {
    if (!dateString) {
      return '-';
    }

    const date = new Date(
      `${dateString}T00:00:00`,
    );

    if (
      Number.isNaN(date.getTime())
    ) {
      return '-';
    }

    return date.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  };

  const formatDateTime = (
    dateTimeString,
  ) => {
    if (!dateTimeString) {
      return '-';
    }

    const date =
      new Date(dateTimeString);

    if (
      Number.isNaN(date.getTime())
    ) {
      return '-';
    }

    return date.toLocaleString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  const formatFileSize = (
    fileSize,
  ) => {
    const numericSize =
      Number(fileSize) || 0;

    if (
      numericSize <
      1024 * 1024
    ) {
      return `${(
        numericSize / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      numericSize /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const getStatusStyle = (
    status,
  ) => {
    const styles = {
      draft: {
        backgroundColor:
          '#F3F4F6',
        color: '#4B5563',
      },

      pending: {
        backgroundColor:
          '#FEF3C7',
        color: '#B45309',
      },

      approved: {
        backgroundColor:
          '#DCFCE7',
        color: '#15803D',
      },

      rejected: {
        backgroundColor:
          '#FEE2E2',
        color: '#B91C1C',
      },

      cancelled: {
        backgroundColor:
          '#FEE2E2',
        color: '#B91C1C',
      },
    };

    return (
      styles[status] || {
        backgroundColor:
          '#F3F4F6',
        color: '#4B5563',
      }
    );
  };

  const statusStyle =
    getStatusStyle(currentStatus);

  const requestReference =
    request?.requestNo ||
    (request?.id
      ? `Draft #${request.id}`
      : '-');

  const pageTitle = isApprover
    ? `พิจารณาคำขอ ${requestReference}`
    : isHR
      ? `รายละเอียดคำขอ ${requestReference}`
      : `คำขอลา ${requestReference}`;

  const handleEditDraft = () => {
    if (
      !canEditDraft ||
      !request
    ) {
      return;
    }

    navigate(
      `/${currentRole}/leave-request?edit=${request.id}`,
    );
  };

  const handleAttachmentClick = (
    attachment,
  ) => {
    const fileName =
      attachment.name ||
      attachment.fileName ||
      'Attachment';

    if (
      !allowAttachmentDownload ||
      isAdminMetadata
    ) {
      setMessage({
        severity: 'warning',

        text: 'This page permits attachment metadata only.',
      });
    } else {
      setMessage({
        severity: 'info',

        text: `${fileName} is stored as attachment metadata in this frontend preview. File download will work after the attachment API is connected.`,
      });
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const openActionDialog = (
    action,
  ) => {
    setSelectedAction(action);
    setRejectReason('');
    setRejectError('');
    setMessage(null);
  };

  const closeActionDialog = () => {
    setSelectedAction(null);
    setRejectReason('');
    setRejectError('');
  };

  const updateDisplayedRequest = (
    updatedRequest,
    latestReason = '',
  ) => {
    if (!updatedRequest) {
      return;
    }

    setRequest(updatedRequest);

    setTimeline(
      buildTimeline(
        updatedRequest,
        latestReason,
      ),
    );
  };

  const handleConfirmAction = async () => {
    if (
      !selectedAction ||
      !request
    ) {
      return;
    }

    if (
      selectedAction === 'reject'
    ) {
      const normalizedReason =
        rejectReason.trim();

      if (!normalizedReason) {
        setRejectError(
          'กรุณาระบุเหตุผลในการปฏิเสธ',
        );

        return;
      }

      if (
        normalizedReason.length < 5
      ) {
        setRejectError(
          'เหตุผลในการปฏิเสธต้องมีอย่างน้อย 5 ตัวอักษร',
        );

        return;
      }

      let updatedRequest; try { await (isHrApprover ? decideHrLeaveRequest : decideLeaveRequest)(request.id, 'rejected', normalizedReason); updatedRequest={...request,status:'rejected',rejectionReason:normalizedReason,reviewedAt:new Date().toISOString()}; } catch(error) { setMessage({severity:'error',text:error.response?.data?.message||'ไม่สามารถปฏิเสธคำขอได้'}); }

      if (!updatedRequest) {
        setMessage({
          severity: 'error',

          text: 'ไม่สามารถปฏิเสธคำขอได้',
        });

        closeActionDialog();

        return;
      }

      updateDisplayedRequest(
        updatedRequest,
        normalizedReason,
      );

      setMessage({
        severity: 'success',

        text: `ปฏิเสธคำขอ ${requestReference} สำเร็จแล้ว`,
      });
    }

    if (
      selectedAction === 'approve'
    ) {
      let updatedRequest; try { await (isHrApprover ? decideHrLeaveRequest : decideLeaveRequest)(request.id, 'approved'); updatedRequest={...request,status:'approved',reviewedAt:new Date().toISOString()}; } catch(error) { setMessage({severity:'error',text:error.response?.data?.message||'ไม่สามารถอนุมัติคำขอได้'}); }

      if (!updatedRequest) {
        setMessage({
          severity: 'error',

          text: 'ไม่สามารถอนุมัติคำขอได้',
        });

        closeActionDialog();

        return;
      }

      updateDisplayedRequest(
        updatedRequest,
      );

      setMessage({
        severity: 'success',

        text: `อนุมัติคำขอ ${requestReference} สำเร็จแล้ว`,
      });
    }

    if (
      selectedAction === 'cancel'
    ) {
      let updatedRequest; try { await cancelLeaveRequest(request.id); updatedRequest={...request,status:'cancelled',cancelledAt:new Date().toISOString()}; } catch(error) { setMessage({severity:'error',text:error.response?.data?.message||'ไม่สามารถยกเลิกคำขอได้'}); }

      if (!updatedRequest) {
        setMessage({
          severity: 'error',

          text: 'ไม่สามารถยกเลิกคำขอได้',
        });

        closeActionDialog();

        return;
      }

      updateDisplayedRequest(
        updatedRequest,
      );

      setMessage({
        severity: 'success',

        text: `ยกเลิกคำขอ ${requestReference} สำเร็จแล้ว`,
      });
    }

    if (
      selectedAction === 'delete'
    ) {
      let wasDeleted=false; try { await deleteLeaveDraft(request.id); wasDeleted=true; } catch(error) { setMessage({severity:'error',text:error.response?.data?.message||'ไม่สามารถลบร่างได้'}); }

      if (!wasDeleted) {
        setMessage({
          severity: 'error',

          text: 'ไม่สามารถลบร่างได้',
        });

        closeActionDialog();

        return;
      }

      closeActionDialog();
      navigate(getBackRoute());

      return;
    }

    closeActionDialog();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const actionDialogContent = {
    approve: {
      title: 'อนุมัติคำขอลา',

      description:
        'ยืนยันว่าต้องการอนุมัติคำขอลานี้',

      buttonText:
        'อนุมัติคำขอ',

      buttonColor: '#059669',

      buttonHoverColor:
        '#047857',
    },

    reject: {
      title: 'ปฏิเสธคำขอลา',

      description:
        'ระบุเหตุผลในการปฏิเสธให้ชัดเจนก่อนยืนยัน',

      buttonText:
        'ปฏิเสธคำขอ',

      buttonColor: '#DC2626',

      buttonHoverColor:
        '#B91C1C',
    },

    cancel: {
      title: 'ยกเลิกคำขอลา',

      description:
        'ยืนยันว่าต้องการยกเลิกคำขอลาที่รออนุมัตินี้',

      buttonText:
        'ยกเลิกคำขอ',

      buttonColor: '#DC2626',

      buttonHoverColor:
        '#B91C1C',
    },

    delete: {
      title: 'ลบร่างคำขอลา',

      description:
        'ยืนยันว่าต้องการลบร่างนี้ การดำเนินการนี้ไม่สามารถย้อนกลับได้',

      buttonText:
        'ลบร่าง',

      buttonColor: '#DC2626',

      buttonHoverColor:
        '#B91C1C',
    },
  };

  const selectedDialogContent =
    selectedAction
      ? actionDialogContent[
          selectedAction
        ]
      : null;

  const detailItems = useMemo(
    () => {
      if (!request) {
        return [];
      }

      return [
        {
          label: 'Request Number',
          value: requestReference,
        },
        {
          label: 'Status',
          value:
            formatStatus(
              currentStatus,
            ),
        },
        {
          label: 'Leave Type',
          value:
            request.leaveType ||
            'Not selected',
        },
        {
          label: 'Leave Days',
          value: `${
            request.leaveDays || 0
          } day(s)`,
        },
        {
          label: 'วันที่เริ่มลา',
          value: formatDate(
            request.startDate,
          ),
        },
        {
          label: 'วันที่สิ้นสุด',
          value: formatDate(
            request.endDate,
          ),
        },
        {
          label: 'Submitted At',
          value: formatDateTime(
            request.submittedAt,
          ),
        },
        {
          label: 'Last Updated',
          value: formatDateTime(
            request.updatedAt,
          ),
        },
      ];
    },
    [
      currentStatus,
      request,
      requestReference,
    ],
  );

  const employeeItems = useMemo(
    () => {
      if (!request) {
        return [];
      }

      return [
        {
          label: 'รหัสพนักงาน',

          value:
            request.employeeCode ||
            'EMP001',
        },
        {
          label: 'ชื่อพนักงาน',

          value:
            request.employeeName ||
            'พนักงาน',
        },
        {
          label: 'แผนก',

          value:
            request.department ||
            'เทคโนโลยีสารสนเทศ',
        },
        {
          label: 'ตำแหน่ง',

          value:
            request.position ||
            'นักพัฒนาระบบ',
        },
      ];
    },
    [request],
  );

  const attachments =
    Array.isArray(
      request?.attachments,
    )
      ? request.attachments
      : [];

  if (!request) {
    return (
      <LayoutComponent
        activeMenu={activeMenu}
      >
        <Box
          sx={{
            marginBottom: '24px',
          }}
        >
          <Typography
            component="h1"
            sx={{
              color: '#111827',

              fontSize: {
                xs: '26px',
                sm: '30px',
              },

              fontWeight: 800,
            }}
          >
            ไม่พบคำขอลา
          </Typography>
        </Box>

        <Alert
          severity="error"
          sx={{
            borderRadius: '8px',
          }}
        >
          {message?.text ||
            'ไม่พบข้อมูลคำขอลาที่เลือก รายการอาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง'}
        </Alert>

        <BackButton
          onClick={handleBack}
          sx={{
            marginTop: '20px',
          }}
        >
          {location.state?.returnLabel
            ? `กลับไปยัง${location.state.returnLabel}`
            : 'กลับไปยังรายการคำขอ'}
        </BackButton>
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent
      activeMenu={activeMenu}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '1080px',
          marginInline: 'auto',
        }}
      >
      <PageHeader
        title={pageTitle}
        actions={
          <BackButton onClick={handleBack}>
            กลับ
          </BackButton>
        }
      />

      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '16px',
          padding: 0,
          background:
            `linear-gradient(135deg, ${theme.soft} 0%, #FFFFFF 72%)`,
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          boxShadow:
            '0 8px 24px rgba(15, 23, 42, 0.055)',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '160px',
            height: '160px',
            top: '-84px',
            right: '-38px',
            borderRadius: '50%',
            backgroundColor: theme.primary,
            opacity: 0.07,
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(0, 1.65fr) minmax(280px, 0.72fr)',
            },
            gap: {
              xs: 0,
              md: '24px',
            },
            alignItems: 'stretch',
          }}
        >
          {/* ข้อมูลคำขอ */}
          <Box
            sx={{
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: {
                xs: '18px',
                sm: '24px',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <Typography
                sx={{
                  color: theme.primary,
                  fontSize: {
                    xs: '15px',
                    sm: '16px',
                  },
                  fontWeight: 800,
                }}
              >
                <RequestNumberText>
                  {requestReference}
                </RequestNumberText>
              </Typography>

              <Chip
                label={formatStatus(currentStatus)}
                size="small"
                sx={{
                  minWidth: '82px',
                  backgroundColor:
                    statusStyle.backgroundColor,
                  color: statusStyle.color,
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              />
            </Box>

          </Box>

          {/* ข้อมูลพนักงานด้านขวา */}
          <Box
            sx={{
              minWidth: 0,
              padding: {
                xs: '18px',
                sm: '24px',
              },
              borderLeft: {
                xs: 'none',
                md: 'none',
              },
              borderTop: {
                xs: 'none',
                md: 'none',
              },
            }}
          >
            <Typography
              sx={{
                color: '#0F172A',
                fontSize: '13px',
                fontWeight: 800,
                marginBottom: '12px',
              }}
            >
              ข้อมูลพนักงาน
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                },
                gap: '12px 20px',
              }}
            >
              {employeeItems.map((item) => (
                <Box
                  key={item.label}
                  sx={{ minWidth: 0 }}
                >
                  <Typography
                    sx={{
                      color: '#94A3B8',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {item.label}
                  </Typography>

                  <Typography
                    sx={{
                      color: '#1E293B',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginTop: '3px',
                      lineHeight: 1.45,
                      wordBreak: 'break-word',
                    }}
                  >
                    <RequestNumberText>
                      {item.value}
                    </RequestNumberText>
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
      <Box
        sx={{
          display: 'none',

          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },

          justifyContent:
            'space-between',

          flexDirection: {
            xs: 'column',
            md: 'row',
          },

          gap: '18px',

          marginBottom: '28px',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              color: '#111827',

              fontSize: {
                xs: '26px',
                sm: '30px',
              },

              fontWeight: 800,
            }}
          >
            รายละเอียดคำขอลา
          </Typography>

          <Box
            sx={{
              display: 'flex',

              alignItems: 'center',

              flexWrap: 'wrap',

              gap: '10px',

              marginTop: '8px',
            }}
          >
            <Typography
              sx={{
                color: '#6B7280',

                fontSize: '14px',

                fontWeight: 700,
              }}
            >
              <RequestNumberText>{requestReference}</RequestNumberText>
            </Typography>

            <Chip
              label={formatStatus(
                currentStatus,
              )}
              size="small"
              sx={{
                minWidth: '82px',

                backgroundColor:
                  statusStyle.backgroundColor,

                color:
                  statusStyle.color,

                borderRadius:
                  '999px',

                fontSize: '11px',

                fontWeight: 700,
              }}
            />
          </Box>
        </Box>

        <BackButton
          onClick={handleBack}
        >
          กลับ
        </BackButton>
      </Box>

      {message && (
        <Alert
          severity={message.severity}
          onClose={() =>
            setMessage(null)
          }
          sx={{
            marginBottom: '24px',

            borderRadius: '8px',
          }}
        >
          <RequestNumberText>{message.text}</RequestNumberText>
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',

            md: 'minmax(0, 1.65fr) minmax(280px, 0.72fr)',
          },

          gap: '24px',

          alignItems: 'start',
        }}
      >
        <Box
          sx={{
            display: 'flex',

            flexDirection: 'column',

            gap: '24px',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              backgroundColor:
                '#FFFFFF',

              border:
                '1px solid #E5E7EB',

              borderRadius: '20px',

              boxShadow:
                '0 4px 16px rgba(15, 23, 42, 0.04)',

              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                padding: {
                  xs: '20px',
                  sm: '24px',
                },
                display: 'flex',
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: '12px',
                borderBottom:
                  '1px solid #E5E7EB',
              }}
            >
              <Typography
                sx={{
                  color: '#111827',

                  fontSize: '18px',

                  fontWeight: 600,
                }}
              >
                ข้อมูลคำขอ
              </Typography>
              {isApprover && (canApprove || canReject) ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {canApprove && (
                    <Button
                      type="button"
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => openActionDialog('approve')}
                      sx={{
                        height: '36px',
                        backgroundColor: '#059669',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#047857', boxShadow: 'none' },
                      }}
                    >
                      อนุมัติคำขอ
                    </Button>
                  )}
                  {canReject && (
                    <Button
                      type="button"
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => openActionDialog('reject')}
                      sx={{
                        height: '36px',
                        color: '#DC2626',
                        borderColor: '#DC2626',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#FEF2F2', borderColor: '#DC2626' },
                      }}
                    >
                      ปฏิเสธคำขอ
                    </Button>
                  )}
                </Box>
              ) : null}
              {!isApprover && hasAvailableAction ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {canEditDraft ? (
                    <Button type="button" size="small" variant="outlined" color="secondary" onClick={handleEditDraft}>
                      แก้ไขร่าง
                    </Button>
                  ) : null}
                  {canDeleteDraft ? (
                    <Button
                      type="button"
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => openActionDialog('delete')}
                    >
                      ลบร่าง
                    </Button>
                  ) : null}
                  {canCancelPending ? (
                    <Button
                      type="button"
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => openActionDialog('cancel')}
                      sx={{
                        color: '#DC2626',
                        borderColor: '#DC2626',
                        borderRadius: '8px',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': {
                          color: '#B91C1C',
                          borderColor: '#B91C1C',
                          backgroundColor: '#FEF2F2',
                        },
                      }}
                    >
                      ยกเลิกคำขอ
                    </Button>
                  ) : null}
                </Box>
              ) : null}
            </Box>

            <Box
              sx={{
                padding: {
                  xs: '20px',
                  sm: '28px',
                },

                display: 'grid',

                gridTemplateColumns: {
                  xs: '1fr',

                  sm: 'repeat(2, minmax(0, 1fr))',
                },

                gap: '24px',
              }}
            >
              {detailItems.map(
                (item) => (
                  <Box key={item.label}>
                    <Typography
                      sx={{
                        color:
                          '#9CA3AF',

                        fontSize:
                          '11px',

                        fontWeight:
                          700,

                        textTransform:
                          'uppercase',

                        letterSpacing:
                          '0.5px',
                      }}
                    >
                      {item.label}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#111827',

                        fontSize:
                          '14px',

                        fontWeight:
                          700,

                        lineHeight:
                          1.6,

                        marginTop:
                          '5px',

                        wordBreak:
                          'break-word',
                      }}
                    >
                      <RequestNumberText>{item.value}</RequestNumberText>
                    </Typography>
                  </Box>
                ),
              )}

              <Box
                sx={{
                  gridColumn: {
                    xs: 'auto',
                    sm: '1 / -1',
                  },

                  padding: '18px',

                  backgroundColor:
                    '#F9FAFB',

                  border:
                    '1px solid #E5E7EB',

                  borderRadius: '8px',
                }}
              >
                <Typography
                  sx={{
                    color: '#9CA3AF',

                    fontSize: '11px',

                    fontWeight: 700,

                    textTransform:
                      'uppercase',

                    letterSpacing:
                      '0.5px',
                  }}
                >
                  เหตุผลการลา
                </Typography>

                <Typography
                  sx={{
                    color: '#374151',

                    fontSize: '14px',

                    lineHeight: 1.8,

                    marginTop: '8px',

                    whiteSpace:
                      'pre-wrap',
                  }}
                >
                  {request.reason || '-'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              display: 'none',
              padding: { xs: '16px', sm: '18px' },
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '20px',
            }}
          >
            <Typography sx={{ color: '#111827', fontSize: '15px', fontWeight: 800 }}>
              เอกสารแนบ
            </Typography>
            {attachments.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {attachments.map((attachment, index) => {
                  const fileName = attachment.name || attachment.fileName || `Attachment ${index + 1}`;
                  return (
                    <Box
                      key={attachment.id || `${fileName}-${index}`}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
                        backgroundColor: '#F8FAFC', borderRadius: '9px', minWidth: 0,
                      }}
                    >
                      <Box sx={{ width: 34, height: 34, flexShrink: 0, display: 'grid', placeItems: 'center', color: theme.primary, backgroundColor: theme.soft, borderRadius: '8px' }}>
                        <InsertDriveFileOutlinedIcon sx={{ fontSize: 19 }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ color: '#1E293B', fontSize: '12px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {fileName}
                        </Typography>
                        <Typography sx={{ color: '#94A3B8', fontSize: '10px', marginTop: '2px' }}>
                          {formatFileSize(attachment.size || attachment.fileSize || 0)}
                        </Typography>
                      </Box>
                      <Button type="button" size="small" variant="text" onClick={() => handleAttachmentClick(attachment)} sx={{ minWidth: 0 }}>
                        เปิด
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography sx={{ color: '#94A3B8', fontSize: '12px', marginTop: '10px' }}>
                ไม่มีเอกสารแนบ
              </Typography>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              display: 'none',
              backgroundColor:
                '#FFFFFF',

              border:
                '1px solid #E5E7EB',

              borderRadius: '20px',

              boxShadow:
                '0 4px 16px rgba(15, 23, 42, 0.04)',

              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                padding: {
                  xs: '20px',
                  sm: '24px',
                },

                borderBottom:
                  '1px solid #E5E7EB',
              }}
            >
              <Typography
                sx={{
                  color: '#111827',

                  fontSize: '18px',

                  fontWeight: 600,
                }}
              >
                เอกสารแนบ
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',

                  fontSize: '13px',

                  marginTop: '4px',
                }}
              >
                {isAdminMetadata
                  ? 'แสดงเฉพาะข้อมูลเอกสารแนบ'
                  : 'เอกสารที่แนบมากับคำขอลานี้'}
              </Typography>
            </Box>

            <Box
              sx={{
                padding: {
                  xs: '20px',
                  sm: '24px',
                },
              }}
            >
              {attachments.length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',

                    flexDirection:
                      'column',

                    gap: '12px',
                  }}
                >
                  {attachments.map(
                    (
                      attachment,
                      index,
                    ) => {
                      const fileName =
                        attachment.name ||
                        attachment.fileName ||
                        `Attachment ${index + 1}`;

                      const fileSize =
                        attachment.size ||
                        attachment.fileSize ||
                        0;

                      return (
                        <Box
                          key={
                            attachment.id ||
                            `${fileName}-${index}`
                          }
                          sx={{
                            padding:
                              '16px',

                            display:
                              'flex',

                            alignItems: {
                              xs: 'flex-start',
                              sm: 'center',
                            },

                            justifyContent:
                              'space-between',

                            flexDirection: {
                              xs: 'column',
                              sm: 'row',
                            },

                            gap: '16px',

                            backgroundColor:
                              '#F9FAFB',

                            border:
                              '1px solid #E5E7EB',

                            borderRadius:
                              '8px',
                          }}
                        >
                          <Box
                            sx={{
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              sx={{
                                color:
                                  '#111827',

                                fontSize:
                                  '14px',

                                fontWeight:
                                  800,

                                wordBreak:
                                  'break-word',
                              }}
                            >
                              {fileName}
                            </Typography>

                            <Typography
                              sx={{
                                color:
                                  '#9CA3AF',

                                fontSize:
                                  '11px',

                                marginTop:
                                  '4px',
                              }}
                            >
                              {formatFileSize(
                                fileSize,
                              )}
                            </Typography>
                          </Box>

                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() =>
                              handleAttachmentClick(
                                attachment,
                              )
                            }
                            sx={{
                              minWidth:
                                '110px',

                              height:
                                '38px',

                              color:
                                theme.primary,

                              borderColor:
                                theme.primary,

                              borderRadius:
                                '8px',

                              fontSize:
                                '12px',

                              fontWeight:
                                700,

                              textTransform:
                                'none',

                              '&:hover':
                                {
                                  backgroundColor:
                                    theme.soft,
                                },
                            }}
                          >
                            File Information
                          </Button>
                        </Box>
                      );
                    },
                  )}
                </Box>
              ) : (
                <Typography
                  sx={{
                    color: '#9CA3AF',

                    fontSize: '14px',

                    textAlign:
                      'center',

                    padding:
                      '28px 0',
                  }}
                >
                  ไม่มีเอกสารแนบ
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        <Box
          sx={{
            display: 'flex',

            flexDirection: 'column',

            gap: '24px',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              padding: {
                xs: '20px',
                sm: '24px',
              },

              backgroundColor:
                '#FFFFFF',

              border:
                '1px solid #E5E7EB',

              borderRadius: '20px',

              boxShadow:
                '0 4px 16px rgba(15, 23, 42, 0.04)',
            }}
          >
            <Typography
              sx={{
                color: '#111827',

                fontSize: '18px',

                fontWeight: 600,
              }}
            >
              ลำดับเหตุการณ์การอนุมัติ
            </Typography>

            <Box
              sx={{
                marginTop: '16px',
              }}
            >
              {timeline.map(
                (item, index) => (
                  <Box
                    key={item.id}
                    sx={{
                      position:
                        'relative',

                      display: 'grid',

                      gridTemplateColumns:
                        '18px 1fr',

                      gap: '9px',

                      paddingBottom:
                        index ===
                        timeline.length - 1
                          ? 0
                          : '18px',
                    }}
                  >
                    {index !==
                      timeline.length - 1 && (
                      <Box
                        sx={{
                          position:
                            'absolute',

                          top: '16px',

                          left: '7px',

                          width: '2px',

                          height:
                            'calc(100% - 4px)',

                          backgroundColor:
                            '#E5E7EB',
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        position:
                          'relative',

                        zIndex: 1,

                        width: '16px',

                        height: '16px',

                        marginTop: '2px',

                        backgroundColor:
                          item.color ||
                          theme.primary,

                        border:
                          '3px solid #FFFFFF',

                        borderRadius:
                          '50%',

                        boxShadow:
                          '0 0 0 1px #D1D5DB',
                      }}
                    />

                    <Box>
                      <Typography
                        sx={{
                          color:
                            item.color ||
                            '#111827',

                          fontSize:
                            '14px',

                          fontWeight:
                            800,

                          lineHeight:
                            1.5,
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#9CA3AF',

                          fontSize:
                            '10px',

                          marginTop:
                            '6px',
                        }}
                      >
                        {formatDateTime(
                          item.dateTime,
                        )}
                      </Typography>
                    </Box>
                  </Box>
                ),
              )}
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{ padding: { xs: '20px', sm: '24px' }, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}
          >
            <Typography sx={{ color: '#111827', fontSize: '15px', fontWeight: 800 }}>เอกสารแนบ</Typography>
            {attachments.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {attachments.map((attachment, index) => {
                  const fileName = attachment.name || attachment.fileName || `Attachment ${index + 1}`;
                  return (
                    <Box key={attachment.id || `${fileName}-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '9px', minWidth: 0 }}>
                      <Box sx={{ width: 34, height: 34, flexShrink: 0, display: 'grid', placeItems: 'center', color: theme.primary, backgroundColor: theme.soft, borderRadius: '8px' }}><InsertDriveFileOutlinedIcon sx={{ fontSize: 19 }} /></Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ color: '#1E293B', fontSize: '12px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</Typography>
                        <Typography sx={{ color: '#94A3B8', fontSize: '10px', marginTop: '2px' }}>{formatFileSize(attachment.size || attachment.fileSize || 0)}</Typography>
                      </Box>
                      <Button type="button" size="small" variant="text" onClick={() => handleAttachmentClick(attachment)} sx={{ minWidth: 0 }}>เปิด</Button>
                    </Box>
                  );
                })}
              </Box>
            ) : <Typography sx={{ color: '#94A3B8', fontSize: '12px', marginTop: '10px' }}>ไม่มีเอกสารแนบ</Typography>}
          </Paper>


          <Paper
            elevation={0}
            sx={{
              display: 'none',
              padding: {
                xs: '20px',
                sm: '24px',
              },

              backgroundColor:
                theme.soft,

              border: `1px solid ${
                theme.border ||
                '#E5E7EB'
              }`,

              borderRadius: '20px',

              boxShadow:
                '0 4px 16px rgba(15, 23, 42, 0.04)',
            }}
          >
            <Typography
              sx={{
                color:
                  theme.dark ||
                  theme.primary,

                fontSize: '16px',

                fontWeight: 600,
              }}
            >
              การดำเนินการที่ทำได้
            </Typography>

            <Typography
              sx={{
                color:
                  theme.text ||
                  '#4B5563',

                fontSize: '12px',

                lineHeight: 1.7,

                marginTop: '6px',
              }}
            >
              การดำเนินการจะแสดงตามสถานะคำขอและสิทธิ์ของผู้ใช้
            </Typography>

            {hasAvailableAction ? (
              <Box
                sx={{
                  display: 'flex',

                  flexDirection:
                    'column',

                  gap: '10px',

                  marginTop: '20px',
                }}
              >
                {canEditDraft && (
                  <Button
                    type="button"
                    variant="contained"
                    color="secondary"
                    onClick={
                      handleEditDraft
                    }
                    sx={{
                      height: '42px',

                      backgroundColor:
                        '#2563EB',

                      borderRadius:
                        '8px',

                      fontSize:
                        '13px',

                      fontWeight:
                        700,

                      textTransform:
                        'none',

                      boxShadow:
                        'none',

                      '&:hover': {
                        backgroundColor:
                          '#1D4ED8',

                        boxShadow:
                          'none',
                      },
                    }}
                  >
                    แก้ไขร่าง
                  </Button>
                )}

                {canDeleteDraft && (
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      openActionDialog(
                        'delete',
                      )
                    }
                    sx={{
                      height: '42px',

                      color: '#DC2626',

                      borderColor:
                        '#DC2626',

                      borderRadius:
                        '8px',

                      fontSize:
                        '13px',

                      fontWeight:
                        700,

                      textTransform:
                        'none',

                      '&:hover': {
                        backgroundColor:
                          '#FEF2F2',
                      },
                    }}
                  >
                    ลบร่าง
                  </Button>
                )}

                {canCancelPending && (
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      openActionDialog(
                        'cancel',
                      )
                    }
                    sx={{
                      height: '42px',

                      color: '#DC2626',

                      borderColor:
                        '#DC2626',

                      borderRadius:
                        '8px',

                      fontSize:
                        '13px',

                      fontWeight:
                        700,

                      textTransform:
                        'none',

                      '&:hover': {
                        color:
                          '#B91C1C',

                        borderColor:
                          '#B91C1C',

                        backgroundColor:
                          '#FEF2F2',
                      },
                    }}
                  >
                    ยกเลิกคำขอ
                  </Button>
                )}

                {canApprove && (
                  <Button
                    type="button"
                    variant="contained"
                    color="success"
                    onClick={() =>
                      openActionDialog(
                        'approve',
                      )
                    }
                    sx={{
                      height: '42px',

                      backgroundColor:
                        '#059669',

                      borderRadius:
                        '8px',

                      fontSize:
                        '13px',

                      fontWeight:
                        700,

                      textTransform:
                        'none',

                      boxShadow:
                        'none',

                      '&:hover': {
                        backgroundColor:
                          '#047857',

                        boxShadow:
                          'none',
                      },
                    }}
                  >
                    อนุมัติคำขอ
                  </Button>
                )}

                {canReject && (
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      openActionDialog(
                        'reject',
                      )
                    }
                    sx={{
                      height: '42px',

                      color: '#DC2626',

                      borderColor:
                        '#DC2626',

                      borderRadius:
                        '8px',

                      fontSize:
                        '13px',

                      fontWeight:
                        700,

                      textTransform:
                        'none',

                      '&:hover': {
                        backgroundColor:
                          '#FEF2F2',
                      },
                    }}
                  >
                    ปฏิเสธคำขอ
                  </Button>
                )}
              </Box>
            ) : (
              <Alert
                severity="info"
                sx={{
                  marginTop: '18px',

                  borderRadius: '8px',

                  fontSize: '12px',
                }}
              >
                {isHR
                  ? 'ฝ่ายทรัพยากรบุคคลตรวจสอบคำขอนี้ได้ แต่ไม่สามารถอนุมัติ ปฏิเสธ แก้ไข หรือยกเลิกได้'
                  : 'ไม่มีการดำเนินการสำหรับสถานะคำขอปัจจุบัน'}
              </Alert>
            )}
          </Paper>
        </Box>
      </Box>
      </Box>

      <Dialog
        open={Boolean(selectedAction)}
        onClose={closeActionDialog}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#111827',

            fontSize: '20px',

            fontWeight: 800,

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          {selectedDialogContent?.title}
        </DialogTitle>

        <DialogContent
          sx={{
            padding:
              '24px !important',
          }}
        >
          <Typography
            sx={{
              color: '#4B5563',

              fontSize: '14px',

              lineHeight: 1.7,
            }}
          >
            {
              selectedDialogContent?.description
            }
          </Typography>

          <Box
            sx={{
              padding: '16px',

              marginTop: '18px',

              backgroundColor:
                '#F9FAFB',

              border:
                '1px solid #E5E7EB',

              borderRadius: '8px',
            }}
          >
            <Typography
              sx={{
                color: '#111827',

                fontSize: '14px',

                fontWeight: 800,
              }}
            >
              <RequestNumberText>{requestReference}</RequestNumberText>
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',

                fontSize: '12px',

                marginTop: '5px',
              }}
            >
              {request.leaveType ||
                'ยังไม่ได้เลือก'}
              :{' '}
              {formatDate(
                request.startDate,
              )}{' '}
              –{' '}
              {formatDate(
                request.endDate,
              )}
            </Typography>
          </Box>

          {selectedAction ===
            'reject' && (
            <TextField
              fullWidth
              required
              multiline
              minRows={4}
              maxRows={7}
              label="เหตุผลในการปฏิเสธ"
              placeholder="ระบุเหตุผลในการปฏิเสธคำขอนี้"
              value={rejectReason}
              onChange={(event) => {
                setRejectReason(
                  event.target.value,
                );

                setRejectError('');
              }}
              error={Boolean(
                rejectError,
              )}
              helperText={
                rejectError ||
                `${rejectReason.length}/500 ตัวอักษร`
              }
              slotProps={{
                htmlInput: {
                  maxLength: 500,
                },
              }}
              sx={{
                marginTop: '20px',

                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '8px',
                  },
              }}
            />
          )}
        </DialogContent>

        <DialogActions
          sx={{
            padding:
              '16px 24px 20px',

            borderTop:
              0,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={closeActionDialog}
            sx={{
              minWidth: '90px',

              height: '42px',

              color: '#374151',

              borderColor:
                '#D1D5DB',

              borderRadius: '8px',

              fontSize: '14px',

              fontWeight: 700,

              textTransform:
                'none',
            }}
          >
            กลับ
          </Button>

          <Button
            type="button"
            variant="contained"
            color={selectedAction === 'approve' ? 'success' : 'error'}
            onClick={
              handleConfirmAction
            }
            sx={{
              minWidth: '135px',

              height: '42px',

              backgroundColor:
                selectedDialogContent
                  ?.buttonColor,

              borderRadius: '8px',

              fontSize: '14px',

              fontWeight: 700,

              textTransform:
                'none',

              boxShadow: 'none',

              '&:hover': {
                backgroundColor:
                  selectedDialogContent
                    ?.buttonHoverColor,

                boxShadow: 'none',
              },
            }}
          >
            {
              selectedDialogContent?.buttonText
            }
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutComponent>
  );
}

export default RoleLeaveRequestDetailPage;
