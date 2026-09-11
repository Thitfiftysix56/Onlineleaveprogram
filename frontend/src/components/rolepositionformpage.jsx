import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createPosition, getPosition, getPositions, updatePosition } from '../api/position-service.js';
import { getDepartments } from '../api/department-service.js';
import { divisionLabelFor, organizationCatalog } from '../constants/organizationcatalog.js';

const emptyData = { departmentName: '', departmentId: '', divisionName: '', positionGroup: '', positionName: '', status: 'Active' };
const positionChoices = Object.entries(organizationCatalog).flatMap(([departmentName, divisions]) =>
  Object.entries(divisions).flatMap(([divisionName, groups]) =>
    Object.entries(groups).flatMap(([positionGroup, names]) =>
      names.map((positionName) => ({ departmentName, divisionName, positionGroup, positionName })),
    ),
  ),
);

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
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [existingPositionNames, setExistingPositionNames] = useState([]);
  const [customPositionMode, setCustomPositionMode] = useState(false);

  useEffect(() => {
    setSelectedPositionId(positionIdProp || routePositionId || '');
  }, [positionIdProp, routePositionId]);

  useEffect(() => {
    let active = true;
    Promise.all([getDepartments(), getPositions()])
      .then(([departmentRows, positionRows]) => {
        if (!active) return;
        setDepartmentOptions((Array.isArray(departmentRows) ? departmentRows : []).filter((row) => row.isActive));
        setExistingPositionNames((Array.isArray(positionRows) ? positionRows : []).map((row) => row.positionName));
      })
      .catch(() => { if (active) { setDepartmentOptions([]); setExistingPositionNames([]); } });
    return () => { active = false; };
  }, [open]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!isEditMode) {
        setFormData(emptyData);
        setCustomPositionMode(false);
        setLoading(false);
        return;
      }
      if (!selectedPositionId) return;
      setLoading(true);
      setCustomPositionMode(false);
      setErrors({});
      setMessage({ type: '', text: '' });
      try {
        const position = await getPosition(selectedPositionId);
        const nextData = {
          departmentName: position.departmentName || '',
          departmentId: position.departmentId || '',
          divisionName: position.divisionName || '',
          positionGroup: position.positionGroup || '',
          positionName: position.positionName || '',
          status: position.status || 'Active',
        };
        if (active) {
          setFormData(nextData);
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

  const selectPositionName = (positionName) => {
    const choice = positionChoices.find((item) => item.positionName === positionName);
    const department = departmentOptions.find((item) =>
      item.departmentName === choice?.departmentName && item.divisionName === choice?.divisionName,
    );
    setFormData((current) => ({
      ...current,
      departmentName: choice?.departmentName || '',
      departmentId: department?.departmentId || '',
      divisionName: choice?.divisionName || '',
      positionGroup: choice?.positionGroup || '',
      positionName,
    }));
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  const selectPositionOption = (value) => {
    if (value === '__new__') {
      setCustomPositionMode(true);
      setFormData((current) => ({ ...current, departmentName: '', departmentId: '', divisionName: '', positionGroup: 'อื่นๆ', positionName: '' }));
      setErrors({});
      return;
    }
    setCustomPositionMode(false);
    selectPositionName(value);
  };

  const catalogChoices = positionChoices.filter((item) =>
    !existingPositionNames.includes(item.positionName) || (isEditMode && item.positionName === formData.positionName),
  );
  const availablePositionChoices = isEditMode && formData.positionName
    && !catalogChoices.some((item) => item.positionName === formData.positionName)
    ? [{
        departmentName: formData.departmentName,
        departmentId: formData.departmentId,
        divisionName: formData.divisionName,
        positionGroup: formData.positionGroup,
        positionName: formData.positionName,
      }, ...catalogChoices]
    : catalogChoices;

  const validate = () => {
    const name = formData.positionName.trim();
    const nextErrors = {};
    if (!formData.departmentName) nextErrors.departmentName = 'กรุณาเลือกแผนก';
    if (!formData.departmentId) nextErrors.departmentId = 'กรุณาเลือกฝ่าย';
    if (!formData.positionGroup) nextErrors.positionGroup = 'กรุณาเลือกกลุ่มตำแหน่ง';
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
    const payload = { departmentId: formData.departmentId, positionGroup: formData.positionGroup, positionName: formData.positionName.trim(), status: formData.status };
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
            <TextField select fullWidth required disabled={customPositionMode} label="ชื่อตำแหน่ง" value={customPositionMode ? '__new__' : formData.positionName}
              onChange={(event) => selectPositionOption(event.target.value)} error={!customPositionMode && Boolean(errors.positionName)}
              helperText={!customPositionMode ? errors.positionName : ''} sx={{ display: customPositionMode ? 'none' : undefined }}>
              {availablePositionChoices.length ? availablePositionChoices.map((item) => <MenuItem key={`${item.departmentName}-${item.divisionName}-${item.positionName}`} value={item.positionName}>{item.positionName}</MenuItem>) : (
                <MenuItem disabled value="">ไม่มีชื่อตำแหน่งที่สามารถเพิ่มได้</MenuItem>
              )}
              {!isEditMode ? <MenuItem value="__new__">เพิ่มตำแหน่งใหม่</MenuItem> : null}
            </TextField>
            {customPositionMode ? (
              <Box sx={{ display: 'grid', gap: '18px', marginTop: '18px' }}>
                <TextField fullWidth required label="ชื่อตำแหน่งใหม่" value={formData.positionName}
                  onChange={(event) => setFormData((current) => ({ ...current, positionName: event.target.value }))}
                  error={Boolean(errors.positionName)} helperText={errors.positionName} />
                <TextField select fullWidth required label="สังกัด" value={formData.departmentId}
                  onChange={(event) => {
                    const department = departmentOptions.find((item) => String(item.departmentId) === String(event.target.value));
                    setFormData((current) => ({ ...current, departmentId: event.target.value, departmentName: department?.departmentName || '', divisionName: department?.divisionName || '' }));
                    setErrors((current) => ({ ...current, departmentName: '', departmentId: '' }));
                  }} error={Boolean(errors.departmentId || errors.departmentName)} helperText={errors.departmentId || errors.departmentName}>
                  {departmentOptions.map((item) => (
                    <MenuItem key={item.departmentId} value={item.departmentId}>{item.departmentName} — {divisionLabelFor(item.divisionName)}</MenuItem>
                  ))}
                </TextField>
              </Box>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions sx={{ width: '100%', justifyContent: 'flex-end', columnGap: '12px', rowGap: '10px', flexWrap: 'wrap', padding: '16px 22px 20px', borderTop: 0, backgroundColor: 'transparent' }}>
          <Button type="button" variant="outlined" onClick={closeForm} sx={{ minWidth: '116px', height: '42px', borderRadius: '9px', fontSize: '13px', fontWeight: 600 }}>ยกเลิก</Button>
          <Button type="submit" variant="contained" disabled={loading || saving} sx={{ minWidth: '148px', height: '42px', borderRadius: '9px', fontSize: '13px', fontWeight: 600 }}>{isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มตำแหน่ง'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmationOpen} onClose={() => !saving && setConfirmationOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>ยืนยันการบันทึกข้อมูลตำแหน่ง</DialogTitle>
        <DialogContent><Box sx={{ display: 'grid', gap: '8px' }}>
          <Typography><strong>ชื่อตำแหน่ง:</strong> {formData.positionName}</Typography>
          {customPositionMode ? <Typography><strong>สังกัด:</strong> {formData.departmentName} — {divisionLabelFor(formData.divisionName)}</Typography> : null}
        </Box></DialogContent>
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
