import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createPosition, getPosition, updatePosition } from '../api/position-service.js';
import { BackButton, PageHeader, Surface } from './sharedvisualfoundation.jsx';

const emptyData = { positionName: '', status: 'Active' };

function RolePositionFormPage({ LayoutComponent, activeMenu, mode = 'add' }) {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const { positionId } = useParams();
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
        const position = await getPosition(positionId);
        const nextData = { positionName: position.positionName || '', status: position.status || 'Active' };
        if (active) {
          setFormData(nextData);
          setInitialData(nextData);
        }
      } catch (error) {
        if (active) setMessage({ type: 'error', text: error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลตำแหน่งได้' });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [isEditMode, positionId]);

  const updateName = (value) => {
    setFormData((current) => ({ ...current, positionName: value }));
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  const validate = () => {
    const name = formData.positionName.trim();
    const nextErrors = {};
    if (!name) nextErrors.positionName = 'กรุณากรอกชื่อตำแหน่ง';
    else if (name.length < 2) nextErrors.positionName = 'ชื่อตำแหน่งต้องมีอย่างน้อย 2 ตัวอักษร';
    else if (name.length > 100) nextErrors.positionName = 'ชื่อตำแหน่งต้องไม่เกิน 100 ตัวอักษร';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const requestConfirmation = (event) => {
    event.preventDefault();
    if (validate()) setConfirmationOpen(true);
  };

  const confirmSave = async () => {
    const payload = { positionName: formData.positionName.trim(), status: formData.status };
    setSaving(true);
    try {
      const result = isEditMode ? await updatePosition(positionId, payload) : await createPosition(payload);
      setConfirmationOpen(false);
      setMessage({ type: 'success', text: result.message || 'บันทึกข้อมูลตำแหน่งเรียบร้อยแล้ว' });
      window.setTimeout(() => navigate('/admin/position-management'), 500);
    } catch (error) {
      setConfirmationOpen(false);
      setMessage({ type: 'error', text: error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลตำแหน่งได้' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutComponent activeMenu={activeMenu}>
      <PageHeader
        title={isEditMode ? 'แก้ไขตำแหน่ง' : 'เพิ่มตำแหน่ง'}
        subtitle={isEditMode ? 'ปรับปรุงข้อมูลตำแหน่งที่เลือก' : 'เพิ่มตำแหน่งใหม่สำหรับองค์กร'}
        actions={<BackButton onClick={() => navigate('/admin/position-management')}>กลับ</BackButton>}
        sx={{ marginBottom: '22px' }}
      />
      {message.text ? <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ marginBottom: '20px' }}>{message.text}</Alert> : null}
      {loading ? <Alert severity="info" sx={{ marginBottom: '20px' }}>กำลังโหลดข้อมูลตำแหน่ง...</Alert> : null}

      <Surface component="form" onSubmit={requestConfirmation} noValidate padding={0} sx={{ maxWidth: 760, overflow: 'hidden' }}>
        <Box sx={{ padding: { xs: '20px', sm: '24px' }, borderBottom: '1px solid #D8E0EA', backgroundColor: '#F8FAFC' }}>
          <Typography component="h2" variant="h6">ข้อมูลตำแหน่ง</Typography>
          <Typography variant="body2" sx={{ color: '#475569', marginTop: '4px' }}>ระบุชื่อตำแหน่งที่ใช้ในองค์กร</Typography>
        </Box>
        <Box sx={{ padding: { xs: '20px', sm: '28px' } }}>
          <TextField
            required
            label="ชื่อตำแหน่ง"
            placeholder="เช่น นักพัฒนาซอฟต์แวร์"
            value={formData.positionName}
            onChange={(event) => updateName(event.target.value)}
            error={Boolean(errors.positionName)}
            helperText={errors.positionName || `${formData.positionName.length}/100 ตัวอักษร`}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
        </Box>
        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" gap="10px" sx={{ padding: { xs: '16px 20px', sm: '18px 28px' }, borderTop: '1px solid #D8E0EA', backgroundColor: '#F8FAFC' }}>
          <Button type="button" variant="outlined" onClick={() => { setFormData(initialData); setErrors({}); }}>ล้างการแก้ไข</Button>
          <Button type="submit" variant="contained" disabled={loading || saving}>{isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มตำแหน่ง'}</Button>
        </Stack>
      </Surface>

      <Dialog open={confirmationOpen} onClose={() => !saving && setConfirmationOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>ยืนยันการบันทึกข้อมูลตำแหน่ง</DialogTitle>
        <DialogContent dividers><Typography><strong>ชื่อตำแหน่ง:</strong> {formData.positionName.trim()}</Typography></DialogContent>
        <DialogActions sx={{ padding: '14px 20px' }}>
          <Button variant="outlined" disabled={saving} onClick={() => setConfirmationOpen(false)}>กลับไปแก้ไข</Button>
          <Button variant="contained" color="success" disabled={saving} onClick={confirmSave}>{saving ? 'กำลังบันทึก...' : 'ยืนยันบันทึก'}</Button>
        </DialogActions>
      </Dialog>
    </LayoutComponent>
  );
}

export default RolePositionFormPage;
