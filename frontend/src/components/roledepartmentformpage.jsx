import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createDepartment, getDepartment, updateDepartment } from '../api/department-service.js';
import { BackButton, PageHeader, Surface } from './sharedvisualfoundation.jsx';

const emptyData = { departmentName: '', description: '', status: 'Active' };

function RoleDepartmentFormPage({ LayoutComponent, activeMenu, mode = 'add' }) {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const [formData, setFormData] = useState(emptyData);
  const [initialData, setInitialData] = useState(emptyData);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!isEditMode) {
        setFormData(emptyData);
        setInitialData(emptyData);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const department = await getDepartment(departmentId);
        const nextData = {
          departmentName: department.departmentName || '',
          description: department.description || '',
          status: department.status || 'Active',
        };
        if (active) {
          setFormData(nextData);
          setInitialData(nextData);
        }
      } catch (error) {
        if (active) setMessage({ type: 'error', text: error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลแผนกได้' });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [departmentId, isEditMode]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setMessage({ type: '', text: '' });
  };

  const validate = () => {
    const nextErrors = {};
    const name = formData.departmentName.trim();
    if (!name) nextErrors.departmentName = 'กรุณากรอกชื่อแผนก';
    else if (name.length < 2) nextErrors.departmentName = 'ชื่อแผนกต้องมีอย่างน้อย 2 ตัวอักษร';
    else if (name.length > 100) nextErrors.departmentName = 'ชื่อแผนกต้องไม่เกิน 100 ตัวอักษร';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const requestConfirmation = (event) => {
    event.preventDefault();
    if (validate()) setConfirmationOpen(true);
  };

  const confirmSave = async () => {
    const payload = {
      departmentName: formData.departmentName.trim(),
      description: formData.description.trim() || null,
      status: formData.status,
    };
    setSaving(true);
    try {
      const result = isEditMode
        ? await updateDepartment(departmentId, payload)
        : await createDepartment(payload);
      setConfirmationOpen(false);
      setMessage({ type: 'success', text: result.message || 'บันทึกข้อมูลแผนกเรียบร้อยแล้ว' });
      window.setTimeout(() => navigate('/admin/department-management'), 500);
    } catch (error) {
      setConfirmationOpen(false);
      setMessage({ type: 'error', text: error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลแผนกได้' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutComponent activeMenu={activeMenu}>
      <PageHeader
        title={isEditMode ? 'แก้ไขแผนก' : 'เพิ่มแผนก'}
        subtitle={isEditMode ? 'ปรับปรุงข้อมูลแผนกที่เลือก' : 'เพิ่มแผนกใหม่สำหรับองค์กร'}
        actions={<BackButton onClick={() => navigate('/admin/department-management')}>กลับ</BackButton>}
        sx={{ marginBottom: '22px' }}
      />

      {message.text ? <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ marginBottom: '20px' }}>{message.text}</Alert> : null}
      {loading ? <Alert severity="info" sx={{ marginBottom: '20px' }}>กำลังโหลดข้อมูลแผนก...</Alert> : null}

      <Surface component="form" onSubmit={requestConfirmation} noValidate padding={0} sx={{ maxWidth: 860, overflow: 'hidden' }}>
        <Box sx={{ padding: { xs: '20px', sm: '24px' }, borderBottom: '1px solid #D8E0EA', backgroundColor: '#F8FAFC' }}>
          <Typography component="h2" variant="h6">ข้อมูลแผนก</Typography>
          <Typography variant="body2" sx={{ color: '#475569', marginTop: '4px' }}>ระบุชื่อและรายละเอียดของแผนก</Typography>
        </Box>
        <Stack gap="20px" sx={{ padding: { xs: '20px', sm: '28px' } }}>
          <TextField
            required
            label="ชื่อแผนก"
            placeholder="เช่น เทคโนโลยีสารสนเทศ"
            value={formData.departmentName}
            onChange={(event) => updateField('departmentName', event.target.value)}
            error={Boolean(errors.departmentName)}
            helperText={errors.departmentName || `${formData.departmentName.length}/100 ตัวอักษร`}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <TextField
            multiline
            minRows={4}
            maxRows={8}
            label="รายละเอียด"
            placeholder="ระบุหน้าที่หรือขอบเขตงานของแผนก"
            value={formData.description}
            onChange={(event) => updateField('description', event.target.value)}
            helperText="ไม่บังคับ"
          />
        </Stack>
        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" gap="10px" sx={{ padding: { xs: '16px 20px', sm: '18px 28px' }, borderTop: '1px solid #D8E0EA', backgroundColor: '#F8FAFC' }}>
          <Button type="button" variant="outlined" onClick={() => { setFormData(initialData); setErrors({}); }}>ล้างการแก้ไข</Button>
          <Button type="submit" variant="contained" disabled={loading || saving}>{isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มแผนก'}</Button>
        </Stack>
      </Surface>

      <Dialog open={confirmationOpen} onClose={() => !saving && setConfirmationOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>ยืนยันการบันทึกข้อมูลแผนก</DialogTitle>
        <DialogContent dividers>
          <Stack gap="8px">
            <Typography><strong>ชื่อแผนก:</strong> {formData.departmentName.trim()}</Typography>
            <Typography><strong>รายละเอียด:</strong> {formData.description.trim() || '-'}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: '14px 20px' }}>
          <Button variant="outlined" disabled={saving} onClick={() => setConfirmationOpen(false)}>กลับไปแก้ไข</Button>
          <Button variant="contained" color="success" disabled={saving} onClick={confirmSave}>{saving ? 'กำลังบันทึก...' : 'ยืนยันบันทึก'}</Button>
        </DialogActions>
      </Dialog>
    </LayoutComponent>
  );
}

export default RoleDepartmentFormPage;
