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
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import {
  useNavigate,
} from 'react-router-dom';

import HRLayout from '../../layouts/hrlayout.jsx';
import api from '../../api/axios.js';

const theme = {
  primary: '#059669',
  dark: '#047857',
  soft: '#ECFDF5',
  border: '#A7F3D0',
};

/* =========================
   Helpers
========================= */

const normalizeLeaveType = (
  leaveType,
) => {
  const rawActive =
    leaveType.isActive ??
    leaveType.is_active;

  let status =
    leaveType.status;

  if (!status) {
    status =
      rawActive === false ||
      rawActive === 0
        ? 'Inactive'
        : 'Active';
  }

  status =
    String(status)
      .trim()
      .toLowerCase() ===
    'inactive'
      ? 'Inactive'
      : 'Active';

  const requiresAttachment =
    Boolean(
      leaveType.requiresAttachment ??
        leaveType
          .requires_attachment ??
        leaveType
          .attachmentRequired,
    );

  return {
    id:
      leaveType.id ??
      leaveType.leaveTypeId ??
      leaveType.leave_type_id,

    code:
      leaveType.code ||
      leaveType.leaveTypeCode ||
      leaveType.leave_type_code ||
      '-',

    name:
      leaveType.name ||
      leaveType.leaveType ||
      leaveType.leaveTypeName ||
      leaveType.leave_type_name ||
      '-',

    description:
      leaveType.description ||
      '',

    defaultDays:
      Number(
        leaveType.defaultDays ??
          leaveType.annualQuotaDays ??
          leaveType.annual_quota_days ??
          0,
      ) || 0,

    minimumDays:
      Number(
        leaveType.minimumDays ??
          leaveType.minimum_days ??
          0,
      ) || 0,

    maximumDaysPerRequest:
      Number(
        leaveType.maximumDaysPerRequest ??
          leaveType
            .maximum_days_per_request ??
          0,
      ) || 0,

    requiresAttachment,

    attachmentRequiredAfterDays:
      Number(
        leaveType
          .attachmentRequiredAfterDays ??
          leaveType
            .attachment_required_after_days ??
          0,
      ) || 0,

    status,
  };
};

const translateLeaveType = (
  value,
) => {
  const labels = {
    'Annual Leave':
      'ลาพักร้อน',

    'Sick Leave':
      'ลาป่วย',

    'Personal Leave':
      'ลากิจ',

    'Maternity Leave':
      'ลาคลอด',

    'Paternity Leave':
      'ลาเพื่อดูแลบุตร',

    'Ordination Leave':
      'ลาอุปสมบท',

    'Military Leave':
      'ลาเพื่อรับราชการทหาร',

    'Other Leave':
      'ลาอื่น ๆ',
  };

  return (
    labels[value] ||
    value ||
    '-'
  );
};

const formatDays = (
  value,
) => {
  const number =
    Number(value) || 0;

  if (
    Number.isInteger(
      number,
    )
  ) {
    return String(number);
  }

  return number
    .toFixed(2)
    .replace(/\.?0+$/, '');
};

/* =========================
   Component
========================= */

function LeaveTypeManagementPage() {
  const navigate =
    useNavigate();

  const [
    leaveTypes,
    setLeaveTypes,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState('');

  const [
    actionMessage,
    setActionMessage,
  ] = useState('');

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all');

  /* =========================
     Load Data
  ========================= */

  const loadLeaveTypes =
    async () => {
      setLoading(true);
      setError('');

      try {
        const response =
          await api.get(
            '/hr/leave-types',
          );

        const data =
          response.data?.data;

        const list =
          Array.isArray(
            data?.leaveTypes,
          )
            ? data.leaveTypes
            : Array.isArray(data)
              ? data
              : [];

        setLeaveTypes(
          list.map(
            normalizeLeaveType,
          ),
        );
      } catch (loadError) {
        setError(
          loadError.response?.data
            ?.message ||
            'ไม่สามารถโหลดข้อมูลประเภทการลาได้',
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  /* =========================
     Filter
  ========================= */

  const filteredLeaveTypes =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return leaveTypes.filter(
        (leaveType) => {
          const translatedName =
            translateLeaveType(
              leaveType.name,
            ).toLowerCase();

          const matchesSearch =
            !keyword ||
            leaveType.code
              .toLowerCase()
              .includes(
                keyword,
              ) ||
            leaveType.name
              .toLowerCase()
              .includes(
                keyword,
              ) ||
            translatedName.includes(
              keyword,
            ) ||
            leaveType.description
              .toLowerCase()
              .includes(
                keyword,
              );

          const matchesStatus =
            statusFilter ===
              'all' ||
            leaveType.status
              .toLowerCase() ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      leaveTypes,
      searchText,
      statusFilter,
    ]);

  /* =========================
     Summary
  ========================= */

  const activeCount =
    leaveTypes.filter(
      (leaveType) =>
        leaveType.status ===
        'Active',
    ).length;

  const inactiveCount =
    leaveTypes.filter(
      (leaveType) =>
        leaveType.status ===
        'Inactive',
    ).length;

  const attachmentCount =
    leaveTypes.filter(
      (leaveType) =>
        leaveType
          .requiresAttachment,
    ).length;

  const summaryCards = [
    {
      title:
        'ประเภทการลาทั้งหมด',

      value:
        leaveTypes.length,

      backgroundColor:
        theme.soft,

      color:
        theme.primary,
    },

    {
      title:
        'ใช้งานอยู่',

      value:
        activeCount,

      backgroundColor:
        '#DCFCE7',

      color:
        '#15803D',
    },

    {
      title:
        'ไม่ใช้งาน',

      value:
        inactiveCount,

      backgroundColor:
        '#FEE2E2',

      color:
        '#DC2626',
    },

    {
      title:
        'ต้องแนบเอกสาร',

      value:
        attachmentCount,

      backgroundColor:
        '#F3E8FF',

      color:
        '#7C3AED',
    },
  ];

  /* =========================
     Actions
  ========================= */

  const handleClearFilters =
    () => {
      setSearchText('');
      setStatusFilter('all');
    };

  const handleAddLeaveType =
    () => {
      navigate(
        '/hr/leave-types/add',
      );
    };

  const handleEditLeaveType =
    (leaveType) => {
      navigate(
        `/hr/leave-types/${leaveType.id}/edit`,
      );
    };

  const handleToggleStatus =
    async (leaveType) => {
      if (!leaveType.id) {
        return;
      }

      const nextStatus =
        leaveType.status ===
        'Active'
          ? 'Inactive'
          : 'Active';

      setUpdatingId(
        leaveType.id,
      );

      setError('');
      setActionMessage('');

      try {
        await api.patch(
          `/hr/leave-types/${leaveType.id}/status`,
          {
            status:
              nextStatus.toLowerCase(),

            isActive:
              nextStatus ===
              'Active',
          },
        );

        setLeaveTypes(
          (
            previousLeaveTypes,
          ) =>
            previousLeaveTypes.map(
              (item) =>
                item.id ===
                leaveType.id
                  ? {
                      ...item,

                      status:
                        nextStatus,
                    }
                  : item,
            ),
        );

        setActionMessage(
          nextStatus ===
            'Active'
            ? `เปิดใช้งาน ${translateLeaveType(
                leaveType.name,
              )} แล้ว`
            : `ปิดใช้งาน ${translateLeaveType(
                leaveType.name,
              )} แล้ว`,
        );
      } catch (
        updateError
      ) {
        setError(
          updateError.response
            ?.data?.message ||
            'ไม่สามารถเปลี่ยนสถานะประเภทการลาได้',
        );
      } finally {
        setUpdatingId(null);
      }
    };

  /* =========================
     UI
  ========================= */

  return (
    <HRLayout activeMenu="Leave Type">
      {/* Header */}

      <Box
        sx={{
          display: 'flex',

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

          marginBottom:
            '22px',
        }}
      >
        <Typography
          component="h1"
          sx={{
            color:
              '#111827',

            fontSize: {
              xs:
                '26px',

              sm:
                '30px',
            },

            fontWeight:
              800,
          }}
        >
          จัดการประเภทการลา
        </Typography>

        <Button
          type="button"
          variant="contained"
          onClick={
            handleAddLeaveType
          }
          sx={{
            minWidth:
              '150px',

            height:
              '42px',

            padding:
              '0 18px',

            backgroundColor:
              theme.primary,

            color:
              '#FFFFFF',

            borderRadius:
              '8px',

            fontSize:
              '12px',

            fontWeight:
              700,

            textTransform:
              'none',

            boxShadow:
              'none',

            '&:hover': {
              backgroundColor:
                theme.dark,

              boxShadow:
                'none',
            },
          }}
        >
          + เพิ่มประเภทการลา
        </Button>
      </Box>

      {/* Messages */}

      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError('')
          }
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
          }}
        >
          {error}
        </Alert>
      )}

      {actionMessage && (
        <Alert
          severity="success"
          onClose={() =>
            setActionMessage(
              '',
            )
          }
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
          }}
        >
          {actionMessage}
        </Alert>
      )}

      {/* Summary Cards */}

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            sm:
              'repeat(2, 1fr)',

            xl:
              'repeat(4, 1fr)',
          },

          gap:
            '18px',

          marginBottom:
            '24px',
        }}
      >
        {summaryCards.map(
          (card) => (
            <Paper
              key={
                card.title
              }
              elevation={0}
              sx={{
                minHeight:
                  '140px',

                padding:
                  '20px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderRadius:
                  '14px',
              }}
            >
              <Box
                sx={{
                  width:
                    '50px',

                  height:
                    '50px',

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  backgroundColor:
                    card.backgroundColor,

                  color:
                    card.color,

                  borderRadius:
                    '11px',

                  fontSize:
                    '20px',

                  fontWeight:
                    800,
                }}
              >
                {card.value}
              </Box>

              <Typography
                sx={{
                  color:
                    '#111827',

                  fontSize:
                    '14px',

                  fontWeight:
                    800,

                  marginTop:
                    '13px',
                }}
              >
                {card.title}
              </Typography>
            </Paper>
          ),
        )}
      </Box>

      {/* Main Card */}

      <Paper
        elevation={0}
        sx={{
          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid #E5E7EB',

          borderRadius:
            '14px',

          overflow:
            'hidden',
        }}
      >
        {/* Filters */}

        <Box
          sx={{
            padding:
              '20px 24px',

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          <Typography
            sx={{
              color:
                '#111827',

              fontSize:
                '18px',

              fontWeight:
                800,
            }}
          >
            รายการประเภทการลา
          </Typography>

          <Typography
            sx={{
              color:
                '#64748B',

              fontSize:
                '12px',

              marginTop:
                '4px',
            }}
          >
            แสดง{' '}
            {
              filteredLeaveTypes.length
            }{' '}
            จาก{' '}
            {
              leaveTypes.length
            }{' '}
            รายการ
          </Typography>

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'minmax(280px, 1.5fr) minmax(180px, 0.7fr) auto',
              },

              gap:
                '14px',

              marginTop:
                '20px',
            }}
          >
            {/* Search */}

            <TextField
              fullWidth
              label="ค้นหาประเภทการลา"
              placeholder="รหัสหรือชื่อประเภทการลา"
              value={
                searchText
              }
              onChange={(
                event,
              ) =>
                setSearchText(
                  event.target
                    .value,
                )
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    height:
                      '48px',

                    borderRadius:
                      '9px',

                    '&.Mui-focused fieldset':
                      {
                        borderColor:
                          theme.primary,
                      },
                  },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color:
                      theme.primary,
                  },
              }}
            />

            {/* Status */}

            <FormControl
              fullWidth
            >
              <InputLabel>
                สถานะ
              </InputLabel>

              <Select
                value={
                  statusFilter
                }
                label="สถานะ"
                onChange={(
                  event,
                ) =>
                  setStatusFilter(
                    event.target
                      .value,
                  )
                }
                sx={{
                  height:
                    '48px',

                  borderRadius:
                    '9px',
                }}
              >
                <MenuItem value="all">
                  ทุกสถานะ
                </MenuItem>

                <MenuItem value="active">
                  ใช้งานอยู่
                </MenuItem>

                <MenuItem value="inactive">
                  ไม่ใช้งาน
                </MenuItem>
              </Select>
            </FormControl>

            {/* Clear */}

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                minWidth:
                  '120px',

                height:
                  '48px',

                padding:
                  '0 18px',

                color:
                  '#475569',

                borderColor:
                  '#CBD5E1',

                borderRadius:
                  '9px',

                fontSize:
                  '12px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    '#F8FAFC',

                  borderColor:
                    '#94A3B8',
                },
              }}
            >
              ล้างตัวกรอง
            </Button>
          </Box>
        </Box>

        {/* Loading */}

        {loading ? (
          <Box
            sx={{
              minHeight:
                '300px',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',
            }}
          >
            <CircularProgress
              sx={{
                color:
                  theme.primary,
              }}
            />
          </Box>
        ) : filteredLeaveTypes.length >
          0 ? (
          /* Table */

          <Box
            sx={{
              overflowX:
                'auto',
            }}
          >
            <Table
              sx={{
                minWidth:
                  '1050px',
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor:
                      '#F8FAFC',
                  }}
                >
                  {[
                    'รหัส',
                    'ประเภทการลา',
                    'สิทธิ์ต่อปี',
                    'ขั้นต่ำ',
                    'สูงสุดต่อครั้ง',
                    'เอกสารแนบ',
                    'สถานะ',
                    'การดำเนินการ',
                  ].map(
                    (
                      heading,
                    ) => (
                      <TableCell
                        key={
                          heading
                        }
                        sx={{
                          color:
                            '#64748B',

                          fontSize:
                            '11px',

                          fontWeight:
                            700,

                          whiteSpace:
                            'nowrap',

                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        {
                          heading
                        }
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredLeaveTypes.map(
                  (
                    leaveType,
                  ) => (
                    <TableRow
                      key={
                        leaveType.id
                      }
                      hover
                    >
                      {/* Code */}

                      <TableCell>
                        <Typography
                          sx={{
                            color:
                              theme.primary,

                            fontSize:
                              '12px',

                            fontWeight:
                              800,

                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {
                            leaveType.code
                          }
                        </Typography>
                      </TableCell>

                      {/* Name */}

                      <TableCell>
                        <Typography
                          sx={{
                            color:
                              '#111827',

                            fontSize:
                              '12px',

                            fontWeight:
                              700,

                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {translateLeaveType(
                            leaveType.name,
                          )}
                        </Typography>

                        {leaveType.description && (
                          <Typography
                            sx={{
                              maxWidth:
                                '260px',

                              color:
                                '#94A3B8',

                              fontSize:
                                '10px',

                              marginTop:
                                '3px',

                              overflow:
                                'hidden',

                              textOverflow:
                                'ellipsis',

                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {
                              leaveType.description
                            }
                          </Typography>
                        )}
                      </TableCell>

                      {/* Default Days */}

                      <TableCell
                        sx={{
                          color:
                            '#475569',

                          fontSize:
                            '12px',

                          fontWeight:
                            700,

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {formatDays(
                          leaveType.defaultDays,
                        )}{' '}
                        วัน
                      </TableCell>

                      {/* Minimum */}

                      <TableCell
                        sx={{
                          color:
                            '#475569',

                          fontSize:
                            '12px',

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {formatDays(
                          leaveType.minimumDays,
                        )}{' '}
                        วัน
                      </TableCell>

                      {/* Maximum */}

                      <TableCell
                        sx={{
                          color:
                            '#475569',

                          fontSize:
                            '12px',

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {formatDays(
                          leaveType.maximumDaysPerRequest,
                        )}{' '}
                        วัน
                      </TableCell>

                      {/* Attachment */}

                      <TableCell>
                        <Chip
                          label={
                            leaveType.requiresAttachment
                              ? leaveType.attachmentRequiredAfterDays >
                                0
                                ? `ต้องแนบเมื่อ ${formatDays(
                                    leaveType.attachmentRequiredAfterDays,
                                  )} วันขึ้นไป`
                                : 'ต้องแนบ'
                              : 'ไม่ต้องแนบ'
                          }
                          size="small"
                          sx={{
                            backgroundColor:
                              leaveType.requiresAttachment
                                ? '#F3E8FF'
                                : '#F1F5F9',

                            color:
                              leaveType.requiresAttachment
                                ? '#7C3AED'
                                : '#64748B',

                            borderRadius:
                              '999px',

                            fontSize:
                              '10px',

                            fontWeight:
                              700,

                            whiteSpace:
                              'nowrap',
                          }}
                        />
                      </TableCell>

                      {/* Status */}

                      <TableCell>
                        <Chip
                          label={
                            leaveType.status ===
                            'Active'
                              ? 'ใช้งานอยู่'
                              : 'ไม่ใช้งาน'
                          }
                          size="small"
                          sx={{
                            minWidth:
                              '78px',

                            backgroundColor:
                              leaveType.status ===
                              'Active'
                                ? '#DCFCE7'
                                : '#FEE2E2',

                            color:
                              leaveType.status ===
                              'Active'
                                ? '#15803D'
                                : '#B91C1C',

                            borderRadius:
                              '999px',

                            fontSize:
                              '10px',

                            fontWeight:
                              700,
                          }}
                        />
                      </TableCell>

                      {/* Actions */}

                      <TableCell>
                        <Box
                          sx={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap:
                              '14px',

                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          <Button
                            type="button"
                            onClick={() =>
                              handleEditLeaveType(
                                leaveType,
                              )
                            }
                            sx={{
                              minWidth:
                                0,

                              padding:
                                0,

                              color:
                                theme.primary,

                              fontSize:
                                '11px',

                              fontWeight:
                                700,

                              textTransform:
                                'none',

                              '&:hover':
                                {
                                  backgroundColor:
                                    'transparent',

                                  textDecoration:
                                    'underline',
                                },
                            }}
                          >
                            แก้ไข
                          </Button>

                          <Button
                            type="button"
                            disabled={
                              updatingId ===
                              leaveType.id
                            }
                            onClick={() =>
                              handleToggleStatus(
                                leaveType,
                              )
                            }
                            sx={{
                              minWidth:
                                0,

                              padding:
                                0,

                              color:
                                leaveType.status ===
                                'Active'
                                  ? '#DC2626'
                                  : '#2563EB',

                              fontSize:
                                '11px',

                              fontWeight:
                                700,

                              textTransform:
                                'none',

                              '&:hover':
                                {
                                  backgroundColor:
                                    'transparent',

                                  textDecoration:
                                    'underline',
                                },
                            }}
                          >
                            {updatingId ===
                            leaveType.id
                              ? 'กำลังบันทึก...'
                              : leaveType.status ===
                                  'Active'
                                ? 'ปิดใช้งาน'
                                : 'เปิดใช้งาน'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </Box>
        ) : (
          /* Empty */

          <Box
            sx={{
              minHeight:
                '280px',

              padding:
                '40px 24px',

              display:
                'flex',

              flexDirection:
                'column',

              alignItems:
                'center',

              justifyContent:
                'center',

              textAlign:
                'center',
            }}
          >
            <Box
              sx={{
                width:
                  '58px',

                height:
                  '58px',

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                backgroundColor:
                  theme.soft,

                color:
                  theme.primary,

                borderRadius:
                  '50%',

                fontSize:
                  '20px',

                fontWeight:
                  800,
              }}
            >
              0
            </Box>

            <Typography
              sx={{
                color:
                  '#111827',

                fontSize:
                  '16px',

                fontWeight:
                  800,

                marginTop:
                  '14px',
              }}
            >
              ไม่พบประเภทการลา
            </Typography>

            <Typography
              sx={{
                color:
                  '#64748B',

                fontSize:
                  '12px',

                marginTop:
                  '5px',
              }}
            >
              ลองเปลี่ยนหรือล้างตัวกรอง
            </Typography>
          </Box>
        )}
      </Paper>
    </HRLayout>
  );
}

export default LeaveTypeManagementPage;