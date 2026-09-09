import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';

import api from '../../api/axios.js';
import { DataListToolbar } from '../../components/shareduiprimitives.jsx';
import HRLayout from '../../layouts/hrlayout.jsx';

const currentYear = new Date().getFullYear();

const translateLeaveType = (value) => ({
  'Annual Leave': 'ลาพักร้อน',
  'Sick Leave': 'ลาป่วย',
  'Personal Leave': 'ลากิจ',
  'Paternity Leave': 'ลาเพื่อดูแลบุตร',
  'Ordination Leave': 'ลาอุปสมบท',
  'Military Leave': 'ลาเพื่อรับราชการทหาร',
  'Other Leave': 'ลาอื่น ๆ',
}[value] || value || '-');

const getResponseArray = (response, key) => {
  const data = response?.data?.data;
  if (Array.isArray(data?.[key])) return data[key];
  return Array.isArray(data) ? data : [];
};

const normalizeEntitlement = (item) => {
  const totalDays = Number(item.totalDays ?? item.total_days ?? 0);
  const usedDays = Number(item.usedDays ?? item.used_days ?? item.used ?? 0);
  return {
    id: item.id ?? item.entitlementId ?? item.entitlement_id,
    employeeCode: item.employeeCode || item.employee_code || '-',
    employeeName: item.employeeName || item.employee_name || '-',
    department: item.department || item.departmentName || item.department_name || '-',
    leaveTypeId: item.leaveTypeId ?? item.leave_type_id,
    leaveType: item.leaveType || item.leaveTypeName || item.leave_type_name || '-',
    year: Number(item.year || currentYear),
    totalDays: Number.isFinite(totalDays) ? totalDays : 0,
    usedDays: Number.isFinite(usedDays) ? usedDays : 0,
    remainingDays: Math.max(totalDays - usedDays, 0),
  };
};

const normalizeLeaveType = (item) => ({
  id: item.leaveTypeId ?? item.leave_type_id ?? item.id,
  name: item.name || item.leaveTypeName || item.leave_type_name || '-',
  isActive: item.isActive ?? item.is_active ?? String(item.status).toLowerCase() === 'active',
});

function LeaveEntitlementManagementPage() {
  const [entitlements, setEntitlements] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [page, setPage] = useState(0);
  const [selectedEntitlement, setSelectedEntitlement] = useState(null);
  const rowsPerPage = 5;

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      api.get('/hr/leave-entitlements'),
      api.get('/hr/leave-types'),
    ])
      .then(([entitlementResponse, leaveTypeResponse]) => {
        if (!active) return;
        setEntitlements(
          getResponseArray(entitlementResponse, 'leaveEntitlements').map(normalizeEntitlement),
        );
        const nextLeaveTypes = getResponseArray(leaveTypeResponse, 'leaveTypes')
          .map(normalizeLeaveType)
          .filter((item) => item.isActive);
        setLeaveTypes(nextLeaveTypes);
        setLeaveTypeFilter((current) => current !== 'all'
          ? current
          : String(nextLeaveTypes[0]?.id || 'all'));
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError.response?.data?.message || 'ไม่สามารถโหลดข้อมูลสิทธิ์การลาได้');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const departments = useMemo(
    () => [...new Set(entitlements.map((item) => item.department).filter((item) => item !== '-'))].sort(),
    [entitlements],
  );
  const years = useMemo(
    () => [...new Set([currentYear, ...entitlements.map((item) => item.year)])].sort((a, b) => b - a),
    [entitlements],
  );

  const filteredEntitlements = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return entitlements.filter((item) => {
      const searchable = [
        item.employeeCode,
        item.employeeName,
        item.department,
        item.leaveType,
        translateLeaveType(item.leaveType),
      ].join(' ').toLowerCase();
      return (!keyword || searchable.includes(keyword))
        && (departmentFilter === 'all' || item.department === departmentFilter)
        && (leaveTypeFilter === 'all' || String(item.leaveTypeId) === leaveTypeFilter)
        && (yearFilter === 'all' || String(item.year) === yearFilter);
    });
  }, [departmentFilter, entitlements, leaveTypeFilter, searchText, yearFilter]);

  useEffect(() => { setPage(0); }, [departmentFilter, leaveTypeFilter, searchText, yearFilter]);

  const paginatedEntitlements = useMemo(
    () => filteredEntitlements.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [filteredEntitlements, page],
  );

  const selectedEmployeeEntitlements = useMemo(
    () => selectedEntitlement
      ? entitlements.filter((item) =>
        item.employeeCode === selectedEntitlement.employeeCode &&
        item.year === selectedEntitlement.year)
      : [],
    [entitlements, selectedEntitlement],
  );

  const activeFilters = [
    ...(departmentFilter !== 'all' ? [{
      key: 'department',
      label: `แผนก: ${departmentFilter}`,
      onDelete: () => setDepartmentFilter('all'),
    }] : []),
    ...(yearFilter !== String(currentYear) ? [{
      key: 'year',
      label: `ปี: ${yearFilter}`,
      onDelete: () => setYearFilter(String(currentYear)),
    }] : []),
  ];

  return (
    <HRLayout activeMenu="Leave Entitlement">
      {error ? (
        <Alert severity="error" onClose={() => setError('')} sx={{ marginBottom: '20px' }}>
          {error}
        </Alert>
      ) : null}

      <Paper
        elevation={0}
        sx={{
          marginTop: { xs: '24px', md: '40px' },
          border: '1px solid #E5E7EB',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box sx={{ padding: { xs: '18px', md: '22px 24px' } }}>
          <Typography sx={{ color: '#111827', fontSize: '18px', fontWeight: 600 }}>
            รายการสิทธิ์การลา
          </Typography>
          <DataListToolbar
            searchValue={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="ค้นหารหัส ชื่อพนักงาน หรือแผนก"
            activeFilters={activeFilters}
            filters={(
              <>
                <FormControl size="small">
                  <Select
                    value={departmentFilter === 'all' ? '' : departmentFilter}
                    displayEmpty
                    renderValue={(value) => value || 'ทุกแผนก'}
                    inputProps={{ 'aria-label': 'แผนก' }}
                    onChange={(event) => setDepartmentFilter(event.target.value || 'all')}
                  >
                    <MenuItem value="">ทุกแผนก</MenuItem>
                    {departments.map((department) => (
                      <MenuItem key={department} value={department}>{department}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <Select
                    value={leaveTypeFilter === 'all' ? '' : leaveTypeFilter}
                    displayEmpty
                    renderValue={(value) => value
                      ? translateLeaveType(leaveTypes.find((item) => String(item.id) === value)?.name || value)
                      : 'ประเภทการลา'}
                    inputProps={{ 'aria-label': 'ประเภทการลา' }}
                    onChange={(event) => setLeaveTypeFilter(event.target.value || 'all')}
                  >
                    {leaveTypes.map((leaveType) => (
                      <MenuItem key={leaveType.id} value={String(leaveType.id)}>
                        {translateLeaveType(leaveType.name)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <Select
                    value={yearFilter === 'all' ? '' : yearFilter}
                    displayEmpty
                    renderValue={(value) => value || 'ปี'}
                    inputProps={{ 'aria-label': 'ปี' }}
                    onChange={(event) => setYearFilter(event.target.value || 'all')}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={String(year)}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            sx={{ marginTop: '18px' }}
          />
        </Box>

        {loading ? (
          <Box sx={{ minHeight: 280, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: '#059669' }} />
          </Box>
        ) : paginatedEntitlements.length ? (
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 920 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  {['รหัสพนักงาน', 'ชื่อพนักงาน', 'แผนก', 'ประเภทการลา', 'ปี', 'สิทธิ์ที่กำหนด', 'อนุมัติแล้ว', 'คงเหลือ'].map((heading) => (
                    <TableCell key={heading} sx={{ color: '#64748B', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEntitlements.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    tabIndex={0}
                    role="button"
                    aria-label={`ดูรายละเอียดสิทธิ์การลาของ ${item.employeeName}`}
                    onClick={() => setSelectedEntitlement(item)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedEntitlement(item);
                      }
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ color: '#059669', fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap' }}>{item.employeeCode}</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>{item.employeeName}</TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>{item.department}</TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>{translateLeaveType(item.leaveType)}</TableCell>
                    <TableCell sx={{ fontSize: '12px' }}>{item.year}</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 700 }}>{item.totalDays} วัน</TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '12px', fontWeight: 700 }}>{item.usedDays} วัน</TableCell>
                    <TableCell>
                      <Box component="span" sx={{ display: 'inline-flex', minWidth: 64, justifyContent: 'center', padding: '5px 10px', backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: '999px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {item.remainingDays} วัน
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredEntitlements.length}
              page={page}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[rowsPerPage]}
              labelRowsPerPage=""
              labelDisplayedRows={() => `หน้า ${page + 1} จาก ${Math.max(1, Math.ceil(filteredEntitlements.length / rowsPerPage))}`}
            />
          </Box>
        ) : (
          <Box sx={{ minHeight: 260, display: 'grid', placeItems: 'center', textAlign: 'center', padding: '24px' }}>
            <Box>
              <Typography sx={{ fontSize: '18px', fontWeight: 700 }}>ไม่พบรายการสิทธิ์การลา</Typography>
              <Typography sx={{ color: '#64748B', fontSize: '12px', marginTop: '6px' }}>
                ลองเปลี่ยนคำค้นหาหรือตัวกรองแล้วตรวจสอบอีกครั้ง
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
      <Dialog
        open={Boolean(selectedEntitlement)}
        onClose={() => setSelectedEntitlement(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ padding: '24px 24px 8px', fontSize: '22px', fontWeight: 700 }}>
          รายละเอียดสิทธิ์การลา
        </DialogTitle>
        <DialogContent sx={{ padding: '16px 24px 8px' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: '12px',
            }}
          >
            {[
              ['รหัสพนักงาน', selectedEntitlement?.employeeCode],
              ['ชื่อพนักงาน', selectedEntitlement?.employeeName],
              ['แผนก', selectedEntitlement?.department],
              ['ปีสิทธิ์', selectedEntitlement?.year],
            ].map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <Typography sx={{ color: '#64748B', fontSize: '11px', fontWeight: 600 }}>
                  {label}
                </Typography>
                <Typography sx={{ color: '#111827', fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>
                  {value || '-'}
                </Typography>
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontSize: '16px', fontWeight: 600, marginTop: '20px', marginBottom: '10px' }}>
            สิทธิ์แต่ละประเภท
          </Typography>
          <Box sx={{ display: 'grid', gap: '10px' }}>
            {selectedEmployeeEntitlements.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'minmax(130px, 1.4fr) repeat(3, minmax(76px, 1fr))' },
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <Typography sx={{ fontSize: '13px', fontWeight: 700 }}>
                  {translateLeaveType(item.leaveType)}
                </Typography>
                {[
                  ['สิทธิ์', item.totalDays],
                  ['ใช้แล้ว', item.usedDays],
                  ['คงเหลือ', item.remainingDays],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <Typography sx={{ color: '#64748B', fontSize: '10px', fontWeight: 600 }}>{label}</Typography>
                    <Typography sx={{ color: label === 'คงเหลือ' ? '#047857' : '#111827', fontSize: '13px', fontWeight: 700 }}>{value} วัน</Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px 24px' }}>
          <Button type="button" variant="contained" onClick={() => setSelectedEntitlement(null)}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </HRLayout>
  );
}

export default LeaveEntitlementManagementPage;
