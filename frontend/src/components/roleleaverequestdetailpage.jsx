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

import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { cancelLeaveRequest, decideLeaveRequest, deleteLeaveDraft, getMyLeaveRequest, getSupervisorApproval } from '../api/leave-service.js';

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
          ? 'Leave request draft created'
          : 'Leave request created',

      detail:
        selectedRequest.status === 'draft'
          ? 'The leave request is currently saved as a draft.'
          : 'A new leave request was created.',

      dateTime:
        selectedRequest.createdAt ||
        selectedRequest.submittedAt ||
        null,

      color: '#6B7280',
    });

    if (selectedRequest.submittedAt) {
      generatedTimeline.push({
        id: 'submitted',

        title: 'Submitted for approval',

        detail:
          'The leave request was submitted to the assigned supervisor.',

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

        title: 'Approved by supervisor',

        detail:
          'The supervisor approved this leave request.',

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

        title: 'Rejected by supervisor',

        detail: storedRejectReason
          ? `The supervisor rejected this leave request. Reason: ${storedRejectReason}`
          : 'The supervisor rejected this leave request.',

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

        title: 'Cancelled by employee',

        detail:
          'The request owner cancelled this leave request.',

        dateTime:
          selectedRequest.updatedAt ||
          null,

        color: '#6B7280',
      });
    }

    return generatedTimeline;
  };

  const getBackRoute = () => {
    if (viewerMode === 'supervisor') {
      return '/supervisor/approval';
    }

    if (viewerMode === 'hr') {
      return '/hr/reports';
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
    let storedRequest = null;

    if (
      Number.isInteger(
        numericRequestId,
      ) &&
      numericRequestId > 0
    ) {
      storedRequest = isSupervisor ? await getSupervisorApproval(numericRequestId) : await getMyLeaveRequest(numericRequestId);
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
    isSupervisor &&
    currentStatus === 'pending';

  const canReject =
    isSupervisor &&
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
          '#E5E7EB',
        color: '#6B7280',
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
          'Please enter the rejection reason',
        );

        return;
      }

      if (
        normalizedReason.length < 5
      ) {
        setRejectError(
          'The rejection reason must contain at least 5 characters',
        );

        return;
      }

      let updatedRequest; try { await decideLeaveRequest(request.id, 'rejected', normalizedReason); updatedRequest={...request,status:'rejected',rejectionReason:normalizedReason,reviewedAt:new Date().toISOString()}; } catch(error) { setMessage({severity:'error',text:error.response?.data?.message||'The request could not be rejected.'}); }

      if (!updatedRequest) {
        setMessage({
          severity: 'error',

          text: 'The request could not be rejected.',
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

        text: `${requestReference} was rejected successfully.`,
      });
    }

    if (
      selectedAction === 'approve'
    ) {
      let updatedRequest; try { await decideLeaveRequest(request.id, 'approved'); updatedRequest={...request,status:'approved',reviewedAt:new Date().toISOString()}; } catch(error) { setMessage({severity:'error',text:error.response?.data?.message||'The request could not be approved.'}); }

      if (!updatedRequest) {
        setMessage({
          severity: 'error',

          text: 'The request could not be approved.',
        });

        closeActionDialog();

        return;
      }

      updateDisplayedRequest(
        updatedRequest,
      );

      setMessage({
        severity: 'success',

        text: `${requestReference} was approved successfully.`,
      });
    }

    if (
      selectedAction === 'cancel'
    ) {
      let updatedRequest; try { await cancelLeaveRequest(request.id); updatedRequest={...request,status:'cancelled',cancelledAt:new Date().toISOString()}; } catch(error) { setMessage({severity:'error',text:error.response?.data?.message||'The request could not be cancelled.'}); }

      if (!updatedRequest) {
        setMessage({
          severity: 'error',

          text: 'The request could not be cancelled.',
        });

        closeActionDialog();

        return;
      }

      updateDisplayedRequest(
        updatedRequest,
      );

      setMessage({
        severity: 'success',

        text: `${requestReference} was cancelled successfully.`,
      });
    }

    if (
      selectedAction === 'delete'
    ) {
      let wasDeleted=false; try { await deleteLeaveDraft(request.id); wasDeleted=true; } catch(error) { setMessage({severity:'error',text:error.response?.data?.message||'The draft could not be deleted.'}); }

      if (!wasDeleted) {
        setMessage({
          severity: 'error',

          text: 'The draft could not be deleted.',
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
      title:
        'Approve Leave Request',

      description:
        'Confirm that you want to approve this leave request.',

      buttonText:
        'Approve Request',

      buttonColor: '#059669',

      buttonHoverColor:
        '#047857',
    },

    reject: {
      title:
        'Reject Leave Request',

      description:
        'Enter a clear rejection reason before confirming.',

      buttonText:
        'Reject Request',

      buttonColor: '#DC2626',

      buttonHoverColor:
        '#B91C1C',
    },

    cancel: {
      title:
        'Cancel Leave Request',

      description:
        'Confirm that you want to cancel this pending leave request.',

      buttonText:
        'Cancel Request',

      buttonColor: '#D97706',

      buttonHoverColor:
        '#B45309',
    },

    delete: {
      title: 'Delete Draft',

      description:
        'Confirm that you want to delete this draft. This action cannot be undone.',

      buttonText:
        'Delete Draft',

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
          label: 'Start Date',
          value: formatDate(
            request.startDate,
          ),
        },
        {
          label: 'End Date',
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
          label: 'Employee Code',

          value:
            request.employeeCode ||
            'EMP001',
        },
        {
          label: 'Employee Name',

          value:
            request.employeeName ||
            'Employee User',
        },
        {
          label: 'Department',

          value:
            request.department ||
            'Information Technology',
        },
        {
          label: 'Position',

          value:
            request.position ||
            'Developer',
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
            Leave Request Detail
          </Typography>
        </Box>

        <Alert
          severity="error"
          sx={{
            borderRadius: '8px',
          }}
        >
          {message?.text ||
            'The selected leave request was not found.'}
        </Alert>

        <Button
          type="button"
          variant="outlined"
          onClick={handleBack}
          sx={{
            height: '42px',

            marginTop: '20px',

            padding: '0 18px',

            color:
              theme.primary,

            borderColor:
              theme.primary,

            borderRadius: '8px',

            fontSize: '14px',

            fontWeight: 700,

            textTransform: 'none',

            '&:hover': {
              backgroundColor:
                theme.soft,
            },
          }}
        >
          ← Back
        </Button>
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent
      activeMenu={activeMenu}
    >
      <Box
        sx={{
          display: 'flex',

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
            Leave Request Detail
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
              {requestReference}
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

        <Button
          type="button"
          variant="outlined"
          onClick={handleBack}
          sx={{
            minWidth: '100px',

            height: '42px',

            padding: '0 18px',

            backgroundColor:
              '#FFFFFF',

            color:
              theme.primary,

            borderColor:
              theme.primary,

            borderRadius: '8px',

            fontSize: '14px',

            fontWeight: 700,

            textTransform: 'none',

            '&:hover': {
              backgroundColor:
                theme.soft,

              borderColor:
                theme.dark ||
                theme.primary,
            },
          }}
        >
          ← Back
        </Button>
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
          {message.text}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',

            xl: 'minmax(0, 1.65fr) minmax(330px, 0.85fr)',
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

              borderRadius: '12px',

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

                  fontWeight: 800,
                }}
              >
                Request Information
              </Typography>
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
                      {item.value}
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
                  Reason for Leave
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
              backgroundColor:
                '#FFFFFF',

              border:
                '1px solid #E5E7EB',

              borderRadius: '12px',

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

                  fontWeight: 800,
                }}
              >
                Employee Information
              </Typography>
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
              {employeeItems.map(
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

                        marginTop:
                          '5px',
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              backgroundColor:
                '#FFFFFF',

              border:
                '1px solid #E5E7EB',

              borderRadius: '12px',

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

                  fontWeight: 800,
                }}
              >
                Attachments
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',

                  fontSize: '13px',

                  marginTop: '4px',
                }}
              >
                {isAdminMetadata
                  ? 'Attachment metadata only.'
                  : 'Files attached to this leave request.'}
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
                  No attachment was submitted.
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

              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                color: '#111827',

                fontSize: '18px',

                fontWeight: 800,
              }}
            >
              Approval Timeline
            </Typography>

            <Box
              sx={{
                marginTop: '24px',
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
                        '22px 1fr',

                      gap: '12px',

                      paddingBottom:
                        index ===
                        timeline.length - 1
                          ? 0
                          : '28px',
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
                            '#6B7280',

                          fontSize:
                            '12px',

                          lineHeight:
                            1.7,

                          marginTop:
                            '4px',
                        }}
                      >
                        {item.detail}
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
            sx={{
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

              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                color:
                  theme.dark ||
                  theme.primary,

                fontSize: '16px',

                fontWeight: 800,
              }}
            >
              Available Actions
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
              Actions are shown according
              to the request status and
              user permission.
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
                    onClick={
                      handleEditDraft
                    }
                    sx={{
                      height: '42px',

                      backgroundColor:
                        theme.primary,

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
                          theme.dark ||
                          theme.primary,

                        boxShadow:
                          'none',
                      },
                    }}
                  >
                    Edit Draft
                  </Button>
                )}

                {canDeleteDraft && (
                  <Button
                    type="button"
                    variant="outlined"
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
                    Delete Draft
                  </Button>
                )}

                {canCancelPending && (
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() =>
                      openActionDialog(
                        'cancel',
                      )
                    }
                    sx={{
                      height: '42px',

                      color: '#B45309',

                      borderColor:
                        '#F59E0B',

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
                          '#FFFBEB',
                      },
                    }}
                  >
                    Cancel Request
                  </Button>
                )}

                {canApprove && (
                  <Button
                    type="button"
                    variant="contained"
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
                    Approve Request
                  </Button>
                )}

                {canReject && (
                  <Button
                    type="button"
                    variant="outlined"
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
                    Reject Request
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
                  ? 'HR can review this request but cannot approve, reject, edit or cancel it.'
                  : 'No action is available for the current request status.'}
              </Alert>
            )}
          </Paper>
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
              {requestReference}
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',

                fontSize: '12px',

                marginTop: '5px',
              }}
            >
              {request.leaveType ||
                'Not selected'}
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
              label="Rejection Reason"
              placeholder="Enter the reason for rejecting this request"
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
                `${rejectReason.length}/500 characters`
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
              '1px solid #E5E7EB',
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
            Back
          </Button>

          <Button
            type="button"
            variant="contained"
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
