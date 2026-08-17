import {
  useCallback,
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
  IconButton,
  InputLabel,
  Menu,
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

import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

import {
  useNavigate,
} from 'react-router-dom';

import {
  getPositions,
  updatePositionStatus,
} from '../api/position-service.js';

/* =========================
   Helpers
========================= */

const normalizeValue = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const translateStatus = (status) => {
  const labels = {
    Active: 'ใช้งานอยู่',
    Inactive: 'ไม่ใช้งาน',
  };

  return (
    labels[status] ||
    status ||
    '-'
  );
};

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  let date;

  const text =
    String(value).trim();

  if (
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(
      text,
    )
  ) {
    date =
      new Date(
        text.replace(
          ' ',
          'T',
        ),
      );
  } else {
    date =
      new Date(text);
  }

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '-';
  }

  const pad = (number) =>
    String(number).padStart(
      2,
      '0',
    );

  return `${pad(
    date.getDate(),
  )}/${pad(
    date.getMonth() + 1,
  )}/${date.getFullYear()} ${pad(
    date.getHours(),
  )}:${pad(
    date.getMinutes(),
  )}`;
};

/* =========================
   Component
========================= */

function RolePositionManagementPage({
  LayoutComponent,
  activeMenu,
  theme,
}) {
  const navigate =
    useNavigate();

  const [
    positions,
    setPositions,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState('');

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('All');

  const [
    actionMessage,
    setActionMessage,
  ] = useState('');

  const [
    actionMenuAnchor,
    setActionMenuAnchor,
  ] = useState(null);

  const [
    actionMenuPosition,
    setActionMenuPosition,
  ] = useState(null);

  /* =========================
     Load Positions
  ========================= */

  const loadPositions =
    useCallback(
      async () => {
        setLoading(true);
        setLoadError('');

        try {
          const rows =
            await getPositions();

          const normalizedRows =
            Array.isArray(rows)
              ? rows.map(
                  (item) => ({
                    ...item,

                    id:
                      item.positionId ??
                      item.id,

                    employeeCount:
                      Number(
                        item.employeeCount ??
                          item.employee_count ??
                          0,
                      ) || 0,

                    activeEmployeeCount:
                      Number(
                        item.activeEmployeeCount ??
                          item.active_employee_count ??
                          item.employeeCount ??
                          item.employee_count ??
                          0,
                      ) || 0,
                  }),
                )
              : [];

          setPositions(
            normalizedRows,
          );
        } catch (error) {
          setPositions([]);

          setLoadError(
            error.response?.data
              ?.message ||
              'ไม่สามารถโหลดข้อมูลตำแหน่งได้',
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  /* =========================
     Filter
  ========================= */

  const filteredPositions =
    useMemo(() => {
      const keyword =
        normalizeValue(
          searchText,
        );

      return positions.filter(
        (position) => {
          const matchesSearch =
            !keyword ||
            normalizeValue(
              position.positionName,
            ).includes(
              keyword,
            );

          const matchesStatus =
            statusFilter ===
              'All' ||
            position.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      positions,
      searchText,
      statusFilter,
    ]);

  /* =========================
     Summary
  ========================= */

  const positionSummary =
    useMemo(
      () => ({
        total:
          positions.length,

        active:
          positions.filter(
            (position) =>
              position.status ===
              'Active',
          ).length,

        inactive:
          positions.filter(
            (position) =>
              position.status ===
              'Inactive',
          ).length,

        employees:
          positions.reduce(
            (
              total,
              position,
            ) =>
              total +
              Number(
                position.employeeCount ||
                  0,
              ),
            0,
          ),
      }),
      [positions],
    );

  const summaryCards = [
    {
      title:
        'ตำแหน่งทั้งหมด',

      value:
        positionSummary.total,

      helper:
        'ตำแหน่งในระบบทั้งหมด',

      color:
        theme.primary,
    },

    {
      title:
        'ใช้งานอยู่',

      value:
        positionSummary.active,

      helper:
        'ตำแหน่งที่เปิดใช้งาน',

      color:
        '#059669',
    },

    {
      title:
        'ไม่ใช้งาน',

      value:
        positionSummary.inactive,

      helper:
        'ตำแหน่งที่ปิดใช้งาน',

      color:
        '#D97706',
    },

    {
      title:
        'พนักงานที่มีตำแหน่ง',

      value:
        positionSummary.employees,

      helper:
        'จำนวนพนักงานที่ถูกกำหนดตำแหน่ง',

      color:
        '#2563EB',
    },
  ];

  /* =========================
     Filters
  ========================= */

  const handleClearFilters =
    () => {
      setSearchText('');
      setStatusFilter('All');
      setActionMessage('');
    };

  /* =========================
     Navigation
  ========================= */

  const handleAddPosition =
    () => {
      navigate(
        '/admin/position-management/add',
      );
    };

  const handleEditPosition = (
    position,
  ) => {
    navigate(
      `/admin/position-management/${position.id}/edit`,
    );
  };

  /* =========================
     Status
  ========================= */

  const handleStatusChange =
    async (
      selectedPosition,
    ) => {
      const nextStatus =
        selectedPosition.status ===
        'Active'
          ? 'Inactive'
          : 'Active';

      setUpdatingId(
        selectedPosition.id,
      );

      setLoadError('');
      setActionMessage('');

      try {
        await updatePositionStatus(
          selectedPosition.id,
          nextStatus,
        );

        await loadPositions();

        setActionMessage(
          `เปลี่ยนสถานะตำแหน่ง ${selectedPosition.positionName} เป็น ${translateStatus(
            nextStatus,
          )} แล้ว`,
        );
      } catch (error) {
        setLoadError(
          error.response?.data
            ?.message ||
            'ไม่สามารถเปลี่ยนสถานะตำแหน่งได้',
        );
      } finally {
        setUpdatingId(null);
      }
    };

  /* =========================
     Action Menu
  ========================= */

  const handleOpenActionMenu = (
    event,
    position,
  ) => {
    setActionMenuAnchor(
      event.currentTarget,
    );

    setActionMenuPosition(
      position,
    );
  };

  const handleCloseActionMenu =
    () => {
      setActionMenuAnchor(
        null,
      );

      setActionMenuPosition(
        null,
      );
    };

  const handleEditFromMenu =
    () => {
      if (!actionMenuPosition) {
        return;
      }

      const selectedPosition =
        actionMenuPosition;

      handleCloseActionMenu();

      handleEditPosition(
        selectedPosition,
      );
    };

  const handleStatusFromMenu =
    () => {
      if (!actionMenuPosition) {
        return;
      }

      const selectedPosition =
        actionMenuPosition;

      handleCloseActionMenu();

      handleStatusChange(
        selectedPosition,
      );
    };

  /* =========================
     UI
  ========================= */

  return (
    <LayoutComponent
      activeMenu={activeMenu}
    >
      {/* Header */}

      <Box
        sx={{
          display:
            'flex',

          alignItems: {
            xs:
              'flex-start',

            sm:
              'center',
          },

          justifyContent:
            'space-between',

          flexDirection: {
            xs:
              'column',

            sm:
              'row',
          },

          gap:
            '16px',

          marginBottom:
            '24px',
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
          จัดการตำแหน่ง
        </Typography>

        <Button
          type="button"
          variant="contained"
          onClick={
            handleAddPosition
          }
          sx={{
            minWidth:
              '145px',

            height:
              '42px',

            padding:
              '0 18px',

            backgroundColor:
              theme.primary,

            color:
              '#FFFFFF',

            borderRadius:
              '9px',

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
          + เพิ่มตำแหน่ง
        </Button>
      </Box>

      {/* Message */}

      {actionMessage && (
        <Alert
          severity="success"
          onClose={() =>
            setActionMessage('')
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

      {/* Error */}

      {loadError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={
                loadPositions
              }
            >
              ลองอีกครั้ง
            </Button>
          }
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
          }}
        >
          {loadError}
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

            xl:
              'repeat(4, minmax(0, 1fr))',
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
                  '142px',

                padding:
                  '20px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderRadius:
                  '14px',

                boxSizing:
                  'border-box',
              }}
            >
              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'space-between',

                  gap:
                    '12px',
                }}
              >
                <Typography
                  sx={{
                    color:
                      '#64748B',

                    fontSize:
                      '12px',

                    fontWeight:
                      700,
                  }}
                >
                  {card.title}
                </Typography>

                <Box
                  sx={{
                    width:
                      '9px',

                    height:
                      '9px',

                    flexShrink:
                      0,

                    backgroundColor:
                      card.color,

                    borderRadius:
                      '50%',

                    boxShadow:
                      `0 0 0 4px ${card.color}14`,
                  }}
                />
              </Box>

              <Typography
                sx={{
                  color:
                    '#111827',

                  fontSize:
                    '32px',

                  fontWeight:
                    800,

                  lineHeight:
                    1.2,

                  marginTop:
                    '14px',
                }}
              >
                {card.value}
              </Typography>

              <Typography
                sx={{
                  color:
                    '#94A3B8',

                  fontSize:
                    '11px',

                  marginTop:
                    '13px',
                }}
              >
                {card.helper}
              </Typography>
            </Paper>
          ),
        )}
      </Box>

      {/* Main Card */}

      <Paper
        elevation={0}
        sx={{
          width:
            '100%',

          maxWidth:
            '100%',

          boxSizing:
            'border-box',

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
              '20px 22px',

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          <Typography
            sx={{
              color:
                '#111827',

              fontSize:
                '17px',

              fontWeight:
                800,
            }}
          >
            รายการตำแหน่ง
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
              filteredPositions.length
            }{' '}
            จาก{' '}
            {
              positions.length
            }{' '}
            ตำแหน่ง
          </Typography>

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'minmax(260px, 1.6fr) minmax(160px, 0.7fr) auto',
              },

              gap:
                '12px',

              marginTop:
                '18px',
            }}
          >
            <TextField
              fullWidth
              label="ค้นหาตำแหน่ง"
              placeholder="ชื่อตำแหน่ง"
              value={
                searchText
              }
              onChange={(
                event,
              ) =>
                setSearchText(
                  event.target.value,
                )
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    height:
                      '46px',

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

            <FormControl fullWidth>
              <InputLabel
                id="position-status-filter-label"
              >
                สถานะ
              </InputLabel>

              <Select
                labelId="position-status-filter-label"
                value={
                  statusFilter
                }
                label="สถานะ"
                onChange={(
                  event,
                ) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                sx={{
                  height:
                    '46px',

                  borderRadius:
                    '9px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        theme.primary,
                    },
                }}
              >
                <MenuItem value="All">
                  ทุกสถานะ
                </MenuItem>

                <MenuItem value="Active">
                  ใช้งานอยู่
                </MenuItem>

                <MenuItem value="Inactive">
                  ไม่ใช้งาน
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                minWidth:
                  '105px',

                height:
                  '46px',

                padding:
                  '0 14px',

                color:
                  '#475569',

                borderColor:
                  '#CBD5E1',

                borderRadius:
                  '9px',

                fontSize:
                  '11px',

                fontWeight:
                  700,

                whiteSpace:
                  'nowrap',

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
                '280px',

              display:
                'flex',

              flexDirection:
                'column',

              alignItems:
                'center',

              justifyContent:
                'center',

              gap:
                '12px',
            }}
          >
            <CircularProgress
              size={32}
              sx={{
                color:
                  theme.primary,
              }}
            />

            <Typography
              sx={{
                color:
                  '#64748B',

                fontSize:
                  '12px',

                fontWeight:
                  700,
              }}
            >
              กำลังโหลดข้อมูลตำแหน่ง...
            </Typography>
          </Box>
        ) : filteredPositions.length >
          0 ? (
          /* Table */

          <Box
            sx={{
              width:
                '100%',

              maxWidth:
                '100%',

              overflow:
                'hidden',
            }}
          >
            <Table
              size="small"
              sx={{
                width:
                  '100%',

                tableLayout:
                  'fixed',

                '& th, & td':
                  {
                    boxSizing:
                      'border-box',
                  },
              }}
            >
              <colgroup>
                <col
                  style={{
                    width:
                      '30%',
                  }}
                />

                <col
                  style={{
                    width:
                      '14%',
                  }}
                />

                <col
                  style={{
                    width:
                      '15%',
                  }}
                />

                <col
                  style={{
                    width:
                      '15%',
                  }}
                />

                <col
                  style={{
                    width:
                      '20%',
                  }}
                />

                <col
                  style={{
                    width:
                      '6%',
                  }}
                />
              </colgroup>

              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor:
                      '#F8FAFC',
                  }}
                >
                  <TableCell
                    sx={
                      headerCellStyle
                    }
                  >
                    ตำแหน่ง
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={
                      headerCellStyle
                    }
                  >
                    พนักงาน
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={
                      headerCellStyle
                    }
                  >
                    พนักงานที่ใช้งาน
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={
                      headerCellStyle
                    }
                  >
                    สถานะ
                  </TableCell>

                  <TableCell
                    sx={
                      headerCellStyle
                    }
                  >
                    อัปเดตล่าสุด
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={
                      headerCellStyle
                    }
                  >
                    จัดการ
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredPositions.map(
                  (position) => {
                    const isActive =
                      position.status ===
                      'Active';

                    return (
                      <TableRow
                        key={
                          position.id
                        }
                        hover
                        sx={{
                          '&:last-child td':
                            {
                              borderBottom:
                                'none',
                            },
                        }}
                      >
                        {/* Position */}

                        <TableCell
                          sx={{
                            padding:
                              '14px 12px',

                            color:
                              '#111827',

                            fontSize:
                              '12px',

                            fontWeight:
                              800,

                            lineHeight:
                              1.45,

                            wordBreak:
                              'break-word',

                            overflowWrap:
                              'anywhere',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {
                            position.positionName
                          }
                        </TableCell>

                        {/* Employees */}

                        <TableCell
                          align="center"
                          sx={{
                            padding:
                              '14px 8px',

                            color:
                              '#111827',

                            fontSize:
                              '12px',

                            fontWeight:
                              700,

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {Number(
                            position.employeeCount ||
                              0,
                          )}
                        </TableCell>

                        {/* Active Employees */}

                        <TableCell
                          align="center"
                          sx={{
                            padding:
                              '14px 8px',

                            color:
                              '#059669',

                            fontSize:
                              '12px',

                            fontWeight:
                              800,

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {Number(
                            position.activeEmployeeCount ||
                              0,
                          )}
                        </TableCell>

                        {/* Status */}

                        <TableCell
                          align="center"
                          sx={{
                            padding:
                              '14px 8px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Chip
                            label={translateStatus(
                              position.status,
                            )}
                            size="small"
                            sx={{
                              minWidth:
                                '76px',

                              height:
                                '27px',

                              backgroundColor:
                                isActive
                                  ? '#DCFCE7'
                                  : '#FEF3C7',

                              color:
                                isActive
                                  ? '#15803D'
                                  : '#B45309',

                              borderRadius:
                                '999px',

                              fontSize:
                                '10px',

                              fontWeight:
                                700,
                            }}
                          />
                        </TableCell>

                        {/* Updated */}

                        <TableCell
                          sx={{
                            padding:
                              '14px 8px',

                            color:
                              '#64748B',

                            fontSize:
                              '11px',

                            lineHeight:
                              1.45,

                            whiteSpace:
                              'normal',

                            wordBreak:
                              'break-word',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {formatDateTime(
                            position.updatedAt,
                          )}
                        </TableCell>

                        {/* Action */}

                        <TableCell
                          align="center"
                          sx={{
                            padding:
                              '10px 4px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <IconButton
                            type="button"
                            aria-label="เปิดเมนูจัดการตำแหน่ง"
                            disabled={
                              Number(
                                updatingId,
                              ) ===
                              Number(
                                position.id,
                              )
                            }
                            onClick={(
                              event,
                            ) =>
                              handleOpenActionMenu(
                                event,
                                position,
                              )
                            }
                            sx={{
                              width:
                                '34px',

                              height:
                                '34px',

                              color:
                                '#64748B',

                              borderRadius:
                                '8px',

                              '&:hover':
                                {
                                  color:
                                    theme.primary,

                                  backgroundColor:
                                    theme.soft,
                                },
                            }}
                          >
                            <MoreVertRoundedIcon
                              sx={{
                                fontSize:
                                  '20px',
                              }}
                            />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </Box>
        ) : (
          /* Empty */

          <Box
            sx={{
              minHeight:
                '300px',

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
                  '56px',

                height:
                  '56px',

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
                  '15px',

                fontWeight:
                  800,

                marginTop:
                  '14px',
              }}
            >
              ไม่พบข้อมูลตำแหน่ง
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
              {positions.length ===
              0
                ? 'ยังไม่มีข้อมูลตำแหน่งในระบบ'
                : 'ลองเปลี่ยนหรือล้างตัวกรอง'}
            </Typography>

            {(searchText ||
              statusFilter !==
                'All') && (
              <Button
                type="button"
                variant="outlined"
                onClick={
                  handleClearFilters
                }
                sx={{
                  height:
                    '40px',

                  marginTop:
                    '18px',

                  padding:
                    '0 16px',

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

                      borderColor:
                        theme.dark,
                    },
                }}
              >
                ล้างตัวกรอง
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* Action Menu */}

      <Menu
        anchorEl={
          actionMenuAnchor
        }
        open={Boolean(
          actionMenuAnchor,
        )}
        onClose={
          handleCloseActionMenu
        }
        anchorOrigin={{
          vertical:
            'bottom',

          horizontal:
            'right',
        }}
        transformOrigin={{
          vertical:
            'top',

          horizontal:
            'right',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth:
                '170px',

              marginTop:
                '4px',

              padding:
                '5px',

              border:
                '1px solid #E5E7EB',

              borderRadius:
                '10px',

              boxShadow:
                '0 12px 30px rgba(15, 23, 42, 0.12)',
            },
          },
        }}
      >
        <MenuItem
          onClick={
            handleEditFromMenu
          }
          sx={{
            minHeight:
              '40px',

            borderRadius:
              '7px',

            color:
              '#374151',

            fontSize:
              '12px',

            fontWeight:
              700,

            '&:hover': {
              color:
                theme.primary,

              backgroundColor:
                theme.soft,
            },
          }}
        >
          แก้ไข
        </MenuItem>

        <MenuItem
          disabled={
            updatingId !== null
          }
          onClick={
            handleStatusFromMenu
          }
          sx={{
            minHeight:
              '40px',

            borderRadius:
              '7px',

            color:
              actionMenuPosition
                ?.status ===
              'Active'
                ? '#B45309'
                : '#15803D',

            fontSize:
              '12px',

            fontWeight:
              700,

            '&:hover': {
              backgroundColor:
                actionMenuPosition
                  ?.status ===
                'Active'
                  ? '#FFFBEB'
                  : '#F0FDF4',
            },
          }}
        >
          {actionMenuPosition
            ?.status ===
          'Active'
            ? 'ปิดใช้งาน'
            : 'เปิดใช้งาน'}
        </MenuItem>
      </Menu>
    </LayoutComponent>
  );
}

/* =========================
   Shared Table Style
========================= */

const headerCellStyle = {
  padding:
    '12px 8px',

  color:
    '#64748B',

  fontSize:
    '10.5px',

  fontWeight:
    800,

  lineHeight:
    1.4,

  whiteSpace:
    'normal',

  wordBreak:
    'break-word',

  borderBottom:
    '1px solid #E5E7EB',
};

export default RolePositionManagementPage;
