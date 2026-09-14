import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';

import { getDepartments } from '../../api/department-service.js';
import { getPositions } from '../../api/position-service.js';
import { DataListToolbar } from '../../components/shareduiprimitives.jsx';
import { InlineListSummary } from '../../components/sharedvisualfoundation.jsx';
import AdminLayout from '../../layouts/adminlayout.jsx';
import { departmentLabelFor, divisionLabelFor, positionGroupLabelFor, positionLabelFor } from '../../constants/organizationcatalog.js';

const rowsPerPage = 5;
const normalize = (value) => String(value ?? '').trim().toLowerCase();

function StatusChip({ active }) {
  return (
    <Chip
      size="small"
      label={active ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
      sx={{
        minWidth: 88,
        fontWeight: 700,
        color: active ? '#166534' : '#991B1B',
        backgroundColor: active ? '#DCFCE7' : '#FEE2E2',
      }}
    />
  );
}

function EmptyRows({ count, columns }) {
  return Array.from({ length: count }, (_, index) => (
    <TableRow key={`empty-${index}`} sx={{ height: 72 }}>
      <TableCell colSpan={columns} />
    </TableRow>
  ));
}

function OrganizationStructurePage() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [page, setPage] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getDepartments(), getPositions()])
      .then(([departmentRows, positionRows]) => {
        if (!active) return;
        setDepartments(Array.isArray(departmentRows) ? departmentRows : []);
        setPositions(Array.isArray(positionRows) ? positionRows : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'ไม่สามารถโหลดข้อมูลโครงสร้างองค์กรได้');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => { setPage(0); }, [tab, search, departmentFilter, divisionFilter, positionFilter]);

  useEffect(() => {
    setDivisionFilter('');
    setPositionFilter('');
  }, [departmentFilter]);

  const departmentOptions = useMemo(() => [...new Set(
    departments.map((item) => item.departmentName).filter(Boolean),
  )].sort((a, b) => a.localeCompare(b)), [departments]);
  const divisionOptions = useMemo(() => [...new Set(
    departments
      .filter((item) => !departmentFilter || item.departmentName === departmentFilter)
      .map((item) => item.divisionName)
      .filter(Boolean),
  )].sort((a, b) => a.localeCompare(b)), [departments, departmentFilter]);
  const positionOptions = useMemo(() => [...new Set(
    positions
      .filter((item) => !departmentFilter || item.departmentName === departmentFilter)
      .filter((item) => !divisionFilter || item.divisionName === divisionFilter)
      .map((item) => item.positionName)
      .filter(Boolean),
  )].sort((a, b) => a.localeCompare(b)), [positions, departmentFilter, divisionFilter]);

  const keyword = normalize(search);
  const filteredDepartments = useMemo(() => departments.filter((item) => (
    (!keyword || [item.departmentName, item.divisionName].some((value) => normalize(value).includes(keyword)))
    && (!departmentFilter || item.departmentName === departmentFilter)
    && (!divisionFilter || item.divisionName === divisionFilter)
  )), [departments, keyword, departmentFilter, divisionFilter]);
  const filteredPositions = useMemo(() => positions.filter((item) => (
    (!keyword || [item.positionName, item.positionGroup, item.departmentName, item.divisionName]
      .some((value) => normalize(value).includes(keyword)))
    && (!departmentFilter || item.departmentName === departmentFilter)
    && (!divisionFilter || item.divisionName === divisionFilter)
    && (!positionFilter || item.positionName === positionFilter)
  )), [positions, keyword, departmentFilter, divisionFilter, positionFilter]);

  const rows = tab === 0 ? filteredDepartments : filteredPositions;
  const paginatedRows = rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalEmployees = departments.reduce((sum, item) => sum + Number(item.employeeCount || 0), 0);

  return (
    <AdminLayout activeMenu="Organization Structure">
      {error ? <Alert severity="error" sx={{ marginBottom: '20px', borderRadius: '10px' }}>{error}</Alert> : null}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: '16px', marginBottom: '16px' }}>
        <InlineListSummary
          items={[
            { title: 'แผนกและฝ่ายทั้งหมด', value: departments.length, color: '#2563EB' },
            { title: 'ตำแหน่งทั้งหมด', value: positions.length, color: '#7C3AED' },
            { title: 'พนักงานทั้งหมด', value: totalEmployees, color: '#059669' },
          ]}
          sx={{ gridColumn: '1 / -1', marginBottom: 0 }}
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '20px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ padding: '20px 22px' }}>
          <Typography sx={{ color: '#111827', fontSize: '17px', fontWeight: 600 }}>
            รายการโครงสร้างองค์กร
          </Typography>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            sx={{ marginTop: '10px', minHeight: 42, '& .MuiTab-root': { minHeight: 42, fontWeight: 700 } }}
          >
            <Tab label="แผนกและฝ่าย" />
            <Tab label="ตำแหน่ง" />
          </Tabs>
          <DataListToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={tab === 0 ? 'ค้นหาชื่อแผนกหรือฝ่าย' : 'ค้นหาชื่อตำแหน่ง แผนก หรือฝ่าย'}
            resultLabel=""
            filters={(
              <>
                <FormControl size="small">
                  <Select
                    value={departmentFilter}
                    displayEmpty
                    renderValue={(value) => value ? departmentLabelFor(value) : 'แผนก'}
                    onChange={(event) => setDepartmentFilter(event.target.value)}
                    inputProps={{ 'aria-label': 'แผนก' }}
                  >
                    {departmentOptions.map((value) => <MenuItem key={value} value={value}>{departmentLabelFor(value)}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <Select
                    value={divisionFilter}
                    displayEmpty
                    renderValue={(value) => value ? divisionLabelFor(value) : 'ฝ่าย'}
                    onChange={(event) => { setDivisionFilter(event.target.value); setPositionFilter(''); }}
                    inputProps={{ 'aria-label': 'ฝ่าย' }}
                  >
                    {divisionOptions.map((value) => <MenuItem key={value} value={value}>{divisionLabelFor(value)}</MenuItem>)}
                  </Select>
                </FormControl>
                {tab === 1 ? (
                  <FormControl size="small">
                    <Select
                      value={positionFilter}
                      displayEmpty
                      renderValue={(value) => value ? positionLabelFor(value) : 'ตำแหน่ง'}
                      onChange={(event) => setPositionFilter(event.target.value)}
                      inputProps={{ 'aria-label': 'ตำแหน่ง' }}
                    >
                    {positionOptions.map((value) => <MenuItem key={value} value={value}>{positionLabelFor(value)}</MenuItem>)}
                    </Select>
                  </FormControl>
                ) : null}
              </>
            )}
            activeFilters={[
              ...(departmentFilter ? [{ key: 'department', label: `แผนก: ${departmentLabelFor(departmentFilter)}`, onDelete: () => setDepartmentFilter('') }] : []),
              ...(divisionFilter ? [{ key: 'division', label: `ฝ่าย: ${divisionLabelFor(divisionFilter)}`, onDelete: () => { setDivisionFilter(''); setPositionFilter(''); } }] : []),
              ...(positionFilter ? [{ key: 'position', label: `ตำแหน่ง: ${positionLabelFor(positionFilter)}`, onDelete: () => setPositionFilter('') }] : []),
            ]}
            onClearFilters={() => {
              setDepartmentFilter('');
              setDivisionFilter('');
              setPositionFilter('');
            }}
            sx={{ marginTop: '16px' }}
          />
        </Box>
          {loading ? (
            <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer sx={{ minHeight: 410, overflowY: 'scroll' }}>
                <Table
                  stickyHeader
                  sx={{
                    width: '100%',
                    minWidth: 900,
                    tableLayout: 'fixed',
                    '& .MuiTableCell-root': {
                      boxSizing: 'border-box',
                      overflowWrap: 'anywhere',
                    },
                  }}
                >
                  <colgroup>
                    {(tab === 0
                      ? ['25%', '25%', '15%', '20%', '15%']
                      : ['20%', '18%', '32%', '15%', '15%']
                    ).map((width, index) => <col key={`${tab}-${index}`} style={{ width }} />)}
                  </colgroup>
                  <TableHead sx={{ backgroundColor: '#F1F5F9' }}>
                    {tab === 0 ? (
                      <TableRow>
                        <TableCell>แผนก</TableCell><TableCell>ฝ่าย</TableCell><TableCell align="center">พนักงาน</TableCell><TableCell align="center">พนักงานที่ใช้งาน</TableCell><TableCell align="center">สถานะ</TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell>ตำแหน่ง</TableCell><TableCell>กลุ่มตำแหน่ง</TableCell><TableCell>แผนก / ฝ่าย</TableCell><TableCell align="center">พนักงาน</TableCell><TableCell align="center">สถานะ</TableCell>
                      </TableRow>
                    )}
                  </TableHead>
                  <TableBody>
                    {paginatedRows.map((item) => tab === 0 ? (
                      <TableRow key={item.departmentId} sx={{ height: 72 }}>
                        <TableCell sx={{ fontWeight: 700 }}>{departmentLabelFor(item.departmentName)}</TableCell>
                        <TableCell>{divisionLabelFor(item.divisionName)}</TableCell>
                        <TableCell align="center">{Number(item.employeeCount || 0)}</TableCell>
                        <TableCell align="center">{Number(item.activeEmployeeCount || 0)}</TableCell>
                        <TableCell align="center"><StatusChip active={Boolean(item.isActive)} /></TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={item.positionId} sx={{ height: 72 }}>
                        <TableCell sx={{ fontWeight: 700 }}>{positionLabelFor(item.positionName)}</TableCell>
                        <TableCell>{positionGroupLabelFor(item.positionGroup)}</TableCell>
                        <TableCell>{departmentLabelFor(item.departmentName)} / {divisionLabelFor(item.divisionName)}</TableCell>
                        <TableCell align="center">{Number(item.employeeCount || 0)}</TableCell>
                        <TableCell align="center"><StatusChip active={Boolean(item.isActive)} /></TableCell>
                      </TableRow>
                    ))}
                    <EmptyRows count={Math.max(0, rowsPerPage - paginatedRows.length)} columns={5} />
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={rows.length}
                page={page}
                onPageChange={(_, value) => setPage(value)}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[rowsPerPage]}
                labelRowsPerPage="รายการต่อหน้า"
                labelDisplayedRows={() => `หน้า ${page + 1} จาก ${Math.max(1, Math.ceil(rows.length / rowsPerPage))}`}
              />
            </>
          )}
      </Paper>
    </AdminLayout>
  );
}

export default OrganizationStructurePage;
