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
  getDepartments,
  updateDepartmentStatus,
} from '../api/department-service.js';

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

  return labels[status] || status || '-';
};

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value);
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

function RoleDepartmentManagementPage({
  LayoutComponent,
  activeMenu,
  theme,
}) {
  const navigate =
    useNavigate();

  const [
    departments,
    setDepartments,
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
    actionMenuDepartment,
    setActionMenuDepartment,
  ] = useState(null);

  /* =========================
     Load Data
  ========================= */

  const loadDepartments =
    useCallback(async () => {
      setLoading(true);
      setLoadError('');

      try {
        const rows =
          await getDepartments();

        setDepartments(
          rows.map(
            (item) => ({
              ...item,

              id:
                item.departmentId,
            }),
          ),
        );
      } catch (error) {
        setLoadError(
          error.response?.data
            ?.message ||
            'ไม่สามารถโหลดข้อมูลแผนกได้',
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  /* =========================
     Filter
  ========================= */

  const filteredDepartments =
    useMemo(() => {
      const keyword =
        normalizeValue(
          searchText,
        );

      return departments.filter(
        (department) => {
          const matchesSearch =
            !keyword ||
            normalizeValue(
              department.departmentName,
            ).includes(
              keyword,
            ) ||
            normalizeValue(
              department.description,
            ).includes(
              keyword,
            );

          const matchesStatus =
            statusFilter ===
              'All' ||
            department.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      departments,
      searchText,
      statusFilter,
    ]);

  /* =========================
     Summary
  ========================= */

  const departmentSummary =
    useMemo(
      () => ({
        total:
          departments.length,

        active:
          departments.filter(
            (department) =>
              department.status ===
              'Active',
          ).length,

        inactive:
          departments.filter(
            (department) =>
              department.status ===
              'Inactive',
          ).length,

        employees:
          departments.reduce(
            (
              total,
              department,
            ) =>
              total +
              Number(
                department.employeeCount ||
                  0,
              ),
            0,
          ),
      }),
      [departments],
    );

  const summaryCards = [
    {
      title:
        'แผนกทั้งหมด',

      value:
        departmentSummary.total,

      helper:
        'แผนกในระบบทั้งหมด',

      color:
        theme.primary,
    },

    {
      title:
        'ใช้งานอยู่',

      value:
        departmentSummary.active,

      helper:
        'แผนกที่เปิดใช้งาน',

      color:
        '#059669',
    },

    {
      title:
        'ไม่ใช้งาน',

      value:
        departmentSummary.inactive,

      helper:
        'แผนกที่ปิดใช้งาน',

      color:
        '#D97706',
    },

    {
      title:
        'พนักงานทั้งหมด',

      value:
        departmentSummary.employees,

      helper:
        'พนักงานในทุกแผนก',

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

  const handleAddDepartment =
    () => {
      navigate(
        '/admin/department-management/add',
      );
    };

  const handleEditDepartment = (
    department,
  ) => {
    navigate(
      `/admin/department-management/${department.id}/edit`,
    );
  };

  /* =========================
     Status
  ========================= */

  const handleStatusChange =
    async (
      selectedDepartment,
    ) => {
      const nextStatus =
        selectedDepartment.status ===
        'Active'
          ? 'Inactive'
          : 'Active';

      setUpdatingId(
        selectedDepartment.id,
      );

      setLoadError('');
      setActionMessage('');

      try {
        await updateDepartmentStatus(
          selectedDepartment.id,
          nextStatus,
        );

        await loadDepartments();

        setActionMessage(
          `เปลี่ยนสถานะของแผนก ${selectedDepartment.departmentName} เป็น ${translateStatus(
            nextStatus,
          )} แล้ว`,
        );
      } catch (error) {
        setLoadError(
          error.response?.data
            ?.message ||
            'ไม่สามารถเปลี่ยนสถานะแผนกได้',
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
    department,
  ) => {
    setActionMenuAnchor(
      event.currentTarget,
    );

    setActionMenuDepartment(
      department,
    );
  };

  const handleCloseActionMenu =
    () => {
      setActionMenuAnchor(
        null,
      );

      setActionMenuDepartment(
        null,
      );
    };

  const handleEditFromMenu =
    () => {
      if (
        !actionMenuDepartment
      ) {
        return;
      }

      const selectedDepartment =
        actionMenuDepartment;

      handleCloseActionMenu();

      handleEditDepartment(
        selectedDepartment,
      );
    };

  const handleStatusFromMenu =
    () => {
      if (
        !actionMenuDepartment
      ) {
        return;
      }

      const selectedDepartment =
        actionMenuDepartment;

      handleCloseActionMenu();

      handleStatusChange(
        selectedDepartment,
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
          จัดการแผนก
        </Typography>

        <Button
          type="button"
          variant="contained"
          onClick={
            handleAddDepartment
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
          + เพิ่มแผนก
        </Button>
      </Box>

      {/* Success */}

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
                loadDepartments
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

      {/* List */}

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
            รายการแผนก
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
              filteredDepartments.length
            }{' '}
            จาก{' '}
            {
              departments.length
            }{' '}
            แผนก
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
              label="ค้นหาแผนก"
              placeholder="ชื่อแผนกหรือรายละเอียด"
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
                id="department-status-filter-label"
              >
                สถานะ
              </InputLabel>

              <Select
                labelId="department-status-filter-label"
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

              alignItems:
                'center',

              justifyContent:
                'center',

              color:
                '#64748B',
            }}
          >
            <Typography
              sx={{
                fontSize:
                  '13px',

                fontWeight:
                  700,
              }}
            >
              กำลังโหลดข้อมูลแผนก...
            </Typography>
          </Box>
        ) : filteredDepartments.length >
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
                      '18%',
                  }}
                />

                <col
                  style={{
                    width:
                      '27%',
                  }}
                />

                <col
                  style={{
                    width:
                      '10%',
                  }}
                />

                <col
                  style={{
                    width:
                      '13%',
                  }}
                />

                <col
                  style={{
                    width:
                      '13%',
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
                      '5%',
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
                    sx={headerCellStyle}
                  >
                    แผนก
                  </TableCell>

                  <TableCell
                    sx={headerCellStyle}
                  >
                    รายละเอียด
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={headerCellStyle}
                  >
                    พนักงาน
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={headerCellStyle}
                  >
                    ใช้งานอยู่
                  </TableCell>

                  <TableCell
                    sx={headerCellStyle}
                  >
                    สถานะ
                  </TableCell>

                  <TableCell
                    sx={headerCellStyle}
                  >
                    อัปเดตล่าสุด
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={headerCellStyle}
                  >
                    จัดการ
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredDepartments.map(
                  (department) => {
                    const isActive =
                      department.status ===
                      'Active';

                    return (
                      <TableRow
                        key={
                          department.id
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
                        {/* Department */}

                        <TableCell
                          sx={{
                            padding:
                              '14px 10px',

                            color:
                              '#111827',

                            fontSize:
                              '11.5px',

                            fontWeight:
                              800,

                            lineHeight:
                              1.45,

                            wordBreak:
                              'break-word',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {
                            department.departmentName
                          }
                        </TableCell>

                        {/* Description */}

                        <TableCell
                          sx={{
                            padding:
                              '14px 10px',

                            color:
                              '#475569',

                            fontSize:
                              '10.5px',

                            lineHeight:
                              1.55,

                            wordBreak:
                              'break-word',

                            overflowWrap:
                              'anywhere',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {department.description ||
                            '-'}
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
                              '11.5px',

                            fontWeight:
                              700,

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {Number(
                            department.employeeCount ||
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
                              '11.5px',

                            fontWeight:
                              800,

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {Number(
                            department.activeEmployeeCount ||
                              0,
                          )}
                        </TableCell>

                        {/* Status */}

                        <TableCell
                          sx={{
                            padding:
                              '14px 8px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Chip
                            label={translateStatus(
                              department.status,
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
                              '10.5px',

                            lineHeight:
                              1.45,

                            whiteSpace:
                              'normal',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {formatDateTime(
                            department.updatedAt,
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
                            aria-label="เปิดเมนูจัดการแผนก"
                            disabled={
                              Number(
                                updatingId,
                              ) ===
                              Number(
                                department.id,
                              )
                            }
                            onClick={(
                              event,
                            ) =>
                              handleOpenActionMenu(
                                event,
                                department,
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
              ไม่พบข้อมูลแผนก
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
              {departments.length ===
              0
                ? 'ยังไม่มีข้อมูลแผนกในระบบ'
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
              actionMenuDepartment
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
                actionMenuDepartment
                  ?.status ===
                'Active'
                  ? '#FFFBEB'
                  : '#F0FDF4',
            },
          }}
        >
          {actionMenuDepartment
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
   Shared Style
========================= */

const headerCellStyle = {
  padding:
    '12px 10px',

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

export default RoleDepartmentManagementPage;
