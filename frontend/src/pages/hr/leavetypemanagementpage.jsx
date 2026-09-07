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
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import {
  useNavigate,
} from 'react-router-dom';

import HRLayout from '../../layouts/hrlayout.jsx';
import { ConfirmationDialog, DataListToolbar } from '../../components/shareduiprimitives.jsx';
import { CompactSummaryCard } from '../../components/sharedvisualfoundation.jsx';
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

const translateStatus = (status) =>
  String(status || '').toLowerCase() === 'active'
    ? 'ใช้งานอยู่'
    : 'ไม่ใช้งาน';

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
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const [disableTarget, setDisableTarget] = useState(null);

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
            translateStatus(
              leaveType.status,
            )
              .toLowerCase()
              .includes(keyword) ||
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
  const paginatedLeaveTypes = useMemo(() => filteredLeaveTypes.slice(page * rowsPerPage, (page + 1) * rowsPerPage), [filteredLeaveTypes, page]);
  useEffect(() => { setPage(0); }, [searchText, statusFilter]);

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
        '#2563EB',
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
        '#BE123C',
    },

    {
      title:
        'ต้องแนบเอกสาร',

      value:
        attachmentCount,

      backgroundColor:
        '#F3E8FF',

      color:
        '#D97706',
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
        { state: { returnTo: `${window.location.pathname}${window.location.search}` } },
      );
    };

  const handleEditLeaveType =
    (leaveType) => {
      navigate(
        `/hr/leave-types/${leaveType.id}/edit`,
        { state: { returnTo: `${window.location.pathname}${window.location.search}` } },
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button type="button" variant="contained" onClick={handleAddLeaveType}>+ เพิ่มประเภทการลา</Button>
      </Box>
      {/* Header */}

      <Box
        sx={{
          display: 'none',

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
            '16px',
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
              '40px',

            padding:
              '0 18px',

            backgroundColor:
              '#2563EB',

            color:
              '#FFFFFF',

            borderRadius:
              '9px',

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
              'repeat(2, minmax(0, 1fr))',

            md:
              'repeat(4, minmax(0, 1fr))',
          },

          gap:
            '16px',

          marginBottom:
            '16px',
        }}
      >
        {summaryCards.map((card) => (
          <CompactSummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
            color={card.color}
          />
        ))}
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
            '20px',

          boxShadow:
            '0 4px 16px rgba(15, 23, 42, 0.04)',

          overflow:
            'hidden',
        }}
      >
        {/* Filters */}

        <Box
          sx={{
            padding:
              '20px 24px',
          }}
        >
          <Typography
            sx={{
              color:
                '#111827',

              fontSize:
                '18px',

              fontWeight:
                600,
            }}
          >
            รายการประเภทการลา
          </Typography>

          <DataListToolbar
            searchValue={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="ค้นหาชื่อหรือรหัสประเภทลา"
            resultLabel=""
            activeFilters={statusFilter !== 'all' ? [{ key: 'status', label: `สถานะ: ${statusFilter === 'active' ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}`, onDelete: () => setStatusFilter('all') }] : []}
            onClearFilters={handleClearFilters}
            showClearFilters={false}
            filters={<FormControl size="small"><Select value={statusFilter === 'all' ? '' : statusFilter} displayEmpty renderValue={(value) => value === 'active' ? 'ใช้งานอยู่' : value === 'inactive' ? 'ไม่ใช้งาน' : 'สถานะ'} inputProps={{ 'aria-label': 'สถานะ' }} onChange={(event) => setStatusFilter(event.target.value || 'all')}><MenuItem value="active">ใช้งานอยู่</MenuItem><MenuItem value="inactive">ไม่ใช้งาน</MenuItem></Select></FormControl>}
            sx={{ marginTop: '16px' }}
          />

          <Box
            sx={{
              display:
                'none',

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
            'none',

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
                {paginatedLeaveTypes.map(
                  (
                    leaveType,
                  ) => (
                    <TableRow
                      key={
                        leaveType.id
                      }
                      hover
                      tabIndex={0}
                      onClick={() => handleEditLeaveType(leaveType)}
                      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleEditLeaveType(leaveType); } }}
                      sx={{ cursor: 'pointer', '&:focus-visible': { outline: '2px solid #2563EB', outlineOffset: -2 } }}
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
                          <Button type="button" size="small" variant="outlined" disabled={updatingId === leaveType.id} onClick={(event) => { event.stopPropagation(); if (leaveType.status === 'Active') setDisableTarget(leaveType); else handleToggleStatus(leaveType); }} sx={{ color: leaveType.status === 'Active' ? '#DC2626' : '#15803D', borderColor: leaveType.status === 'Active' ? '#FECACA' : '#BBF7D0' }}>{updatingId === leaveType.id ? 'กำลังบันทึก...' : leaveType.status === 'Active' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}</Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredLeaveTypes.length}
              page={page}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[rowsPerPage]}
              labelRowsPerPage=""
              labelDisplayedRows={() => `หน้า ${page + 1} จาก ${Math.max(1, Math.ceil(filteredLeaveTypes.length / rowsPerPage))}`}
            />
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
              ลองปรับตัวกรองหรือกดกากบาทเพื่อล้างค่า
            </Typography>
          </Box>
        )}
      </Paper>
      <ConfirmationDialog open={Boolean(disableTarget)} title="ยืนยันการปิดใช้งานประเภทการลา" description={`ต้องการปิดใช้งาน ${disableTarget?.name || ''} ใช่หรือไม่`} loading={updatingId === disableTarget?.id} onCancel={() => setDisableTarget(null)} onConfirm={async () => { const target = disableTarget; if (!target) return; await handleToggleStatus(target); setDisableTarget(null); }} />
    </HRLayout>
  );
}

export default LeaveTypeManagementPage;
