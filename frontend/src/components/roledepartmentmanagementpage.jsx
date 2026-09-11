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
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import FixedTableBody from './fixedtablebody.jsx';

import { ConfirmationDialog, DataListToolbar } from './shareduiprimitives.jsx';
import { InlineListSummary } from './sharedvisualfoundation.jsx';
import RoleDepartmentFormPage from './roledepartmentformpage.jsx';
import { divisionLabelFor } from '../constants/organizationcatalog.js';

import {
  deleteDepartment,
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
  initialFormMode,
  initialDepartmentId,
}) {
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
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const [disableTarget, setDisableTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formDialog, setFormDialog] = useState({
    open: Boolean(initialFormMode),
    mode: initialFormMode || 'add',
    departmentId: initialDepartmentId ? String(initialDepartmentId) : '',
  });

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
            normalizeValue(department.divisionName).includes(keyword) ||
            normalizeValue(divisionLabelFor(department.divisionName)).includes(keyword) ||
            normalizeValue(department.description).includes(keyword) ||
            normalizeValue(
              translateStatus(
                department.status,
              ),
            ).includes(keyword);

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
  const paginatedDepartments = useMemo(() => filteredDepartments.slice(page * rowsPerPage, (page + 1) * rowsPerPage), [filteredDepartments, page]);
  useEffect(() => { setPage(0); }, [searchText, statusFilter]);

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

      color:
        '#2563EB',
    },

    {
      title:
        'ใช้งานอยู่',

      value:
        departmentSummary.active,

      color:
        '#059669',
    },

    {
      title:
        'ไม่ใช้งาน',

      value:
        departmentSummary.inactive,

      color:
        '#64748B',
    },

    {
      title:
        'พนักงานทั้งหมด',

      value:
        departmentSummary.employees,

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
      setFormDialog({ open: true, mode: 'add', departmentId: '' });
    };

  const handleEditDepartment = (
    department,
  ) => {
    setFormDialog({ open: true, mode: 'edit', departmentId: String(department.id) });
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

  const handleDeleteDepartment = async () => {
    if (!deleteTarget) return;
    setUpdatingId(deleteTarget.id);
    setLoadError('');
    setActionMessage('');
    try {
      await deleteDepartment(deleteTarget.id);
      setDeleteTarget(null);
      await loadDepartments();
      setActionMessage(`ลบแผนก ${deleteTarget.departmentName} เรียบร้อยแล้ว`);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'ไม่สามารถลบแผนกได้');
    } finally {
      setUpdatingId(null);
    }
  };

  /* =========================
     Action Menu
  ========================= */

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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button type="button" variant="contained" onClick={handleAddDepartment}>+ เพิ่มแผนก</Button>
      </Box>
      {/* Header */}

      <Box
        sx={{
          display:
            'none',

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

            md:
              'repeat(4, minmax(0, 1fr))',
          },

          gap:
            '16px',

          marginBottom:
            '16px',
        }}
      >
        <InlineListSummary items={summaryCards} sx={{ gridColumn: '1 / -1', marginBottom: 0 }} />
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
              '20px 22px',
          }}
        >
          <Typography
            sx={{
              color:
                '#111827',

              fontSize:
                '17px',

              fontWeight:
                600,
            }}
          >
            รายการแผนก
          </Typography>

          <DataListToolbar
            searchValue={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="ค้นหาชื่อหรือรหัสแผนก"
            resultLabel=""
            activeFilters={statusFilter !== 'All' ? [{ key: 'status', label: `สถานะ: ${statusFilter === 'Active' ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}`, onDelete: () => setStatusFilter('All') }] : []}
            onClearFilters={handleClearFilters}
            showClearFilters={false}
            filters={(
              <FormControl size="small">
                <Select value={statusFilter === 'All' ? '' : statusFilter} displayEmpty renderValue={(value) => value === 'Active' ? 'ใช้งานอยู่' : value === 'Inactive' ? 'ไม่ใช้งาน' : 'สถานะ'} inputProps={{ 'aria-label': 'สถานะ' }} onChange={(event) => setStatusFilter(event.target.value || 'All')}>
                  <MenuItem value="Active">ใช้งานอยู่</MenuItem><MenuItem value="Inactive">ไม่ใช้งาน</MenuItem>
                </Select>
              </FormControl>
            )}
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
              placeholder="ชื่อแผนกหรือฝ่าย"
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

              overflowX:
                'auto',
            }}
          >
            <Table
              size="small"
              sx={{
                width:
                  '100%',

                minWidth: '900px',

                tableLayout:
                  'auto',

                '& .MuiTableCell-head': { fontSize: '12px !important', padding: '13px 14px !important', whiteSpace: 'nowrap' },
                '& .MuiTableCell-body': { fontSize: '12px !important', padding: '14px !important' },

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
                    ฝ่าย
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

              <FixedTableBody>
                {paginatedDepartments.map(
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
                        onClick={() => handleEditDepartment(department)}
                        sx={{
                          cursor: 'pointer',
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
                          {department.departmentName}
                        </TableCell>

                        {/* Division */}

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
                          {divisionLabelFor(department.divisionName)}
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
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <Button
                            type="button"
                            size="small"
                            variant="outlined"
                            disabled={
                              Number(
                                updatingId,
                              ) ===
                              Number(
                                department.id,
                              )
                            }
                            onClick={(event) => { event.stopPropagation(); if (isActive) setDisableTarget(department); else handleStatusChange(department); }}
                            sx={{
                              minWidth: '96px',
                              height: '34px',
                              color: isActive ? '#B42318' : '#15803D',
                              borderColor: isActive ? '#FCA5A5' : '#86EFAC',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              textTransform: 'none',
                              '&:hover': { backgroundColor: isActive ? '#FEE2E2' : '#DCFCE7', borderColor: isActive ? '#EF4444' : '#22C55E' },
                            }}
                          >
                            {isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          </Button>
                          {!isActive ? (
                            <Button
                              type="button"
                              size="small"
                              variant="contained"
                              color="error"
                              disabled={Number(updatingId) === Number(department.id)}
                              onClick={(event) => { event.stopPropagation(); setDeleteTarget(department); }}
                              sx={{ minWidth: '64px', height: '34px', boxShadow: 'none' }}
                            >
                              ลบ
                            </Button>
                          ) : null}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </FixedTableBody>
            </Table>
            {filteredDepartments.length > rowsPerPage ? <TablePagination component="div" count={filteredDepartments.length} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[rowsPerPage]} labelRowsPerPage="" labelDisplayedRows={() => `หน้า ${page + 1} จาก ${Math.ceil(filteredDepartments.length / rowsPerPage)}`} /> : null}
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
                : 'ลองปรับตัวกรองหรือกดกากบาทเพื่อล้างค่า'}
            </Typography>

          </Box>
        )}
      </Paper>

      <RoleDepartmentFormPage
        LayoutComponent={LayoutComponent}
        activeMenu={activeMenu}
        mode={formDialog.mode}
        dialogOnly
        open={formDialog.open}
        departmentId={formDialog.departmentId}
        onClose={() => setFormDialog((current) => ({ ...current, open: false }))}
        onSaved={() => {
          setFormDialog((current) => ({ ...current, open: false }));
          loadDepartments();
        }}
      />

      {/* Action Menu */}

      <ConfirmationDialog
        open={Boolean(disableTarget)}
        title="ยืนยันการปิดใช้งานแผนก"
        description={`ต้องการปิดใช้งานแผนก ${disableTarget?.departmentName || ''} ใช่หรือไม่`}
        loading={Number(updatingId) === Number(disableTarget?.id)}
        onCancel={() => setDisableTarget(null)}
        onConfirm={async () => { const target = disableTarget; if (!target) return; await handleStatusChange(target); setDisableTarget(null); }}
      />

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        title="ยืนยันการลบแผนก"
        description={`ต้องการลบแผนก ${deleteTarget?.departmentName || ''} ใช่หรือไม่ ระบบจะลบได้เฉพาะแผนกที่ไม่มีพนักงานสังกัดอยู่`}
        loading={Number(updatingId) === Number(deleteTarget?.id)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteDepartment}
      />

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
                '#1E293B',

              backgroundColor:
                '#F1F5F9',
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
    '13px 14px',

  color:
    '#64748B',

  fontSize:
    '12px',

  fontWeight:
    800,

  lineHeight:
    1.4,

  whiteSpace:
    'nowrap',

  wordBreak:
    'break-word',

  borderBottom:
    '1px solid #E5E7EB',
};

export default RoleDepartmentManagementPage;
