import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createPosition, getPosition, getPositions, updatePosition } from '../api/position-service.js';

const emptyData = { positionName: '', status: 'Active' };

function RolePositionFormPage({
  LayoutComponent,
  activeMenu,
  mode = 'add',
  dialogOnly = false,
  open = true,
  positionId: positionIdProp,
  onClose,
  onSaved,
}) {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const { positionId: routePositionId } = useParams();
  const [selectedPositionId, setSelectedPositionId] = useState(positionIdProp || routePositionId || '');
  const [formData, setFormData] = useState(emptyData);
  const [initialData, setInitialData] = useState(emptyData);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [positionOptions, setPositionOptions] = useState([]);

  useEffect(() => {
    setSelectedPositionId(positionIdProp || routePositionId || '');
  }, [positionIdProp, routePositionId]);

  useEffect(() => {
    if (!isEditMode) return undefined;
    let active = true;
    getPositions()
      .then((rows) => { if (active) setPositionOptions(Array.isArray(rows) ? rows : []); })
      .catch(() => { if (active) setPositionOptions([]); });
    return () => { active = false; };
  }, [isEditMode]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!isEditMode) {
        setFormData(emptyData);
        setInitialData(emptyData);
        setLoading(false);
        return;
      }
      if (!selectedPositionId) return;
      setLoading(true);
      try {
        const position = await getPosition(selectedPositionId);
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
  }, [isEditMode, selectedPositionId]);

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
      const result = isEditMode ? await updatePosition(selectedPositionId, payload) : await createPosition(payload);
      setConfirmationOpen(false);
      setMessage({ type: 'success', text: result.message || 'บันทึกข้อมูลตำแหน่งเรียบร้อยแล้ว' });
      window.setTimeout(() => {
        if (onSaved) onSaved(result);
        else navigate('/admin/position-management');
      }, 500);
    } catch (error) {
      setConfirmationOpen(false);
      setMessage({ type: 'error', text: error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลตำแหน่งได้' });
    } finally {
      setSaving(false);
    }
  };

  const closeForm = () => {
    if (saving) return;
    if (onClose) onClose();
    else navigate('/admin/position-management');
  };

  const selectPosition = (value) => {
    if (dialogOnly) setSelectedPositionId(value);
    else navigate(`/admin/position-management/${value}/edit`);
  };

  const formDialogs = (
    <>
      <Dialog open={open && !confirmationOpen} onClose={closeForm} fullWidth maxWidth="sm" slotProps={{ paper: { component: 'form', onSubmit: requestConfirmation, noValidate: true, sx: { width: 'calc(100% - 32px)', maxWidth: '480px', margin: 'auto', borderRadius: '18px', overflow: 'hidden' } } }}>
        <DialogTitle sx={{ padding: '18px 22px', borderBottom: 0, background: 'transparent', color: 'var(--role-text, #1E3A8A)', fontSize: '20px', fontWeight: 700 }}>
          {isEditMode ? 'แก้ไขตำแหน่ง' : 'เพิ่มตำแหน่ง'}
        </DialogTitle>
        <DialogContent sx={{ padding: '22px 22px 24px !important' }}>
          {message.text ? <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ marginBottom: '24px' }}>{message.text}</Alert> : null}
          {loading ? <Alert severity="info" sx={{ marginBottom: '24px' }}>กำลังโหลดข้อมูลตำแหน่ง...</Alert> : null}
          <Box>
            {isEditMode ? (
              <FormControl fullWidth>
                <Select
                  value={String(selectedPositionId || '')}
                  displayEmpty
                  renderValue={(value) => positionOptions.find((position) => String(position.positionId ?? position.id) === String(value))?.positionName || 'เลือกตำแหน่ง'}
                  inputProps={{ 'aria-label': 'เลือกตำแหน่ง' }}
                  onChange={(event) => selectPosition(event.target.value)}
                  sx={{ height: '48px', borderRadius: '10px' }}
                >
                  {positionOptions.map((position) => {
                    const id = position.positionId ?? position.id;
                    return <MenuItem key={id} value={String(id)}>{position.positionName}</MenuItem>;
                  })}
                </Select>
              </FormControl>
            ) : null}
            <TextField
              fullWidth
              required
              label="ชื่อตำแหน่ง"
              placeholder="เช่น นักพัฒนาซอฟต์แวร์"
              value={formData.positionName}
              onChange={(event) => updateName(event.target.value)}
              error={Boolean(errors.positionName)}
              helperText={errors.positionName || `${formData.positionName.length}/100 ตัวอักษร`}
              slotProps={{ htmlInput: { maxLength: 100 } }}
              sx={{ marginTop: isEditMode ? '22px' : 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ width: '100%', justifyContent: 'flex-end', columnGap: '12px', rowGap: '10px', flexWrap: 'wrap', padding: '16px 22px 20px', borderTop: 0, backgroundColor: 'transparent' }}>
          <Button type="button" variant="outlined" onClick={() => { setFormData(initialData); setErrors({}); }} sx={{ minWidth: '116px', height: '42px', borderRadius: '9px', fontSize: '13px', fontWeight: 600 }}>ล้างการแก้ไข</Button>
          <Button type="submit" variant="contained" disabled={loading || saving} sx={{ minWidth: '148px', height: '42px', borderRadius: '9px', fontSize: '13px', fontWeight: 600 }}>{isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มตำแหน่ง'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmationOpen} onClose={() => !saving && setConfirmationOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>ยืนยันการบันทึกข้อมูลตำแหน่ง</DialogTitle>
        <DialogContent><Typography><strong>ชื่อตำแหน่ง:</strong> {formData.positionName.trim()}</Typography></DialogContent>
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

export default RolePositionFormPage;
