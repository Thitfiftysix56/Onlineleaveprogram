import { useEffect, useState } from 'react';
import {
  Alert,
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

const emptyData = { departmentName: '', description: '', status: 'Active' };

function RoleDepartmentFormPage({
  LayoutComponent,
  activeMenu,
  mode = 'add',
  dialogOnly = false,
  open = true,
  departmentId: departmentIdProp,
  onClose,
  onSaved,
}) {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const { departmentId: routeDepartmentId } = useParams();
  const departmentId = departmentIdProp || routeDepartmentId;
  const [formData, setFormData] = useState(emptyData);
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
      window.setTimeout(() => {
        if (onSaved) onSaved(result);
        else navigate('/admin/department-management');
      }, 500);
    } catch (error) {
      setConfirmationOpen(false);
      setMessage({ type: 'error', text: error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลแผนกได้' });
    } finally {
      setSaving(false);
    }
  };

  const closeForm = () => {
    if (saving) return;
    if (onClose) onClose();
    else navigate('/admin/department-management');
  };

  const formDialogs = (
    <>
      <Dialog
        open={open && !confirmationOpen}
        onClose={closeForm}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: requestConfirmation,
            noValidate: true,
            sx: { width: 'calc(100% - 32px)', maxWidth: '540px', margin: 'auto', borderRadius: '18px', overflow: 'hidden' },
          },
        }}
      >
        <DialogTitle sx={{ padding: '18px 22px', borderBottom: 0, background: 'transparent', color: 'var(--role-text, #1E3A8A)', fontSize: '20px', fontWeight: 700 }}>
          {isEditMode ? 'แก้ไขแผนก' : 'เพิ่มแผนก'}
        </DialogTitle>
        <DialogContent sx={{ padding: '22px 22px 24px !important' }}>
          {message.text ? <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ marginBottom: '20px' }}>{message.text}</Alert> : null}
          {loading ? <Alert severity="info" sx={{ marginBottom: '20px' }}>กำลังโหลดข้อมูลแผนก...</Alert> : null}
          <TextField
            fullWidth
            required
            label="ชื่อแผนก"
            placeholder="เช่น เทคโนโลยีสารสนเทศ"
            value={formData.departmentName}
            onChange={(event) => updateField('departmentName', event.target.value)}
            error={Boolean(errors.departmentName)}
            helperText={errors.departmentName || `${formData.departmentName.length}/100 ตัวอักษร`}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            sx={{ marginBottom: '22px' }}
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            label="รายละเอียด"
            placeholder="ระบุหน้าที่หรือขอบเขตงานของแผนก"
            value={formData.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', columnGap: '12px', rowGap: '10px', flexWrap: 'wrap', padding: '16px 22px 20px', borderTop: 0, backgroundColor: 'transparent' }}>
          <Button type="button" variant="outlined" onClick={closeForm} sx={{ minWidth: '116px', height: '42px', borderRadius: '9px', fontSize: '13px', fontWeight: 600 }}>ยกเลิก</Button>
          <Button type="submit" variant="contained" disabled={loading || saving} sx={{ minWidth: '148px', height: '42px', borderRadius: '9px', fontSize: '13px', fontWeight: 600 }}>{isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มแผนก'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmationOpen} onClose={() => !saving && setConfirmationOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>ยืนยันการบันทึกข้อมูลแผนก</DialogTitle>
        <DialogContent>
          <Stack gap="8px">
            <Typography><strong>ชื่อแผนก:</strong> {formData.departmentName.trim()}</Typography>
            <Typography><strong>รายละเอียด:</strong> {formData.description.trim() || '-'}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: '14px 20px' }}>
          <Button variant="outlined" color="secondary" disabled={saving} onClick={() => setConfirmationOpen(false)}>กลับไปแก้ไข</Button>
          <Button variant="contained" color="success" disabled={saving} onClick={confirmSave}>{saving ? 'กำลังบันทึก...' : 'ยืนยันบันทึก'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );

  if (dialogOnly) return formDialogs;

  return (
    <LayoutComponent activeMenu={activeMenu}>
      {formDialogs}
    </LayoutComponent>
  );
}

export default RoleDepartmentFormPage;
