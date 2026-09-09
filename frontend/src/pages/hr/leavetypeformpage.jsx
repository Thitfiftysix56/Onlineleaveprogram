import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import HRLayout from '../../layouts/hrlayout.jsx';
import { PageHeader } from '../../components/sharedvisualfoundation.jsx';
import { roleDashboardCardSurfaceSx } from '../../theme/rolecardsurface.js';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createLeaveType, getLeaveType, updateLeaveType } from '../../api/leave-type-service.js';

function LeaveTypeFormPage({ mode = 'add' }) {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const location = useLocation();
  const { leaveTypeId } = useParams();
  const returnTo =
    typeof location.state?.returnTo === 'string' &&
    location.state.returnTo.startsWith('/')
      ? location.state.returnTo
      : '/hr/leave-types';
  const initialFormData = {
    code: '',
    name: '',
    description: '',
    defaultDays: '',
    minimumDays: '1',
    maximumDaysPerRequest: '',
    attachmentRequired: 'No',
    status: 'Active',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationError, setConfirmationError] = useState('');

  useEffect(() => {
    let active = true;
    if (!isEditMode) return undefined;
    const load = async () => {
      setLoading(true);
      try {
        const item = await getLeaveType(leaveTypeId);
        if (active) setFormData({
          code: item.code, name: item.name, description: item.description,
          defaultDays: String(item.defaultDays), minimumDays: String(item.minimumDays),
          maximumDaysPerRequest: String(item.maximumDaysPerRequest),
          attachmentRequired: item.attachmentRequired ? 'Yes' : 'No', status: item.status,
        });
      } catch (error) { if (active) setErrorMessage(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลประเภทการลาได้'); }
      finally { if (active) setLoading(false); }
    };
    load(); return () => { active = false; };
  }, [isEditMode, leaveTypeId]);

  const handleInputChange = (fieldName, value) => {
    setFormData((previousData) => ({
      ...previousData,
      [fieldName]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [fieldName]: '',
    }));

    setSuccessMessage('');
    setErrorMessage('');
    setConfirmationError('');
  };

  const validateForm = () => {
    const validationErrors = {};

    const name = formData.name.trim();
    const defaultDays = Number(formData.defaultDays);
    const minimumDays = Number(formData.minimumDays);
    const maximumDaysPerRequest = Number(
      formData.maximumDaysPerRequest,
    );

    if (!name) {
      validationErrors.name =
        'กรุณากรอกชื่อประเภทการลา';
    }

    if (!formData.defaultDays) {
      validationErrors.defaultDays =
        'กรุณากรอกจำนวนวันลาเริ่มต้น';
    } else if (
      Number.isNaN(defaultDays) ||
      defaultDays <= 0 ||
      defaultDays > 365
    ) {
      validationErrors.defaultDays =
        'จำนวนวันต้องอยู่ระหว่าง 1-365 วัน';
    }

    if (!formData.minimumDays) {
      validationErrors.minimumDays =
        'กรุณากรอกจำนวนวันลาขั้นต่ำ';
    } else if (
      Number.isNaN(minimumDays) ||
      minimumDays <= 0 ||
      minimumDays > 365
    ) {
      validationErrors.minimumDays =
        'จำนวนวันขั้นต่ำต้องอยู่ระหว่าง 1-365 วัน';
    }

    if (!formData.maximumDaysPerRequest) {
      validationErrors.maximumDaysPerRequest =
        'กรุณากรอกจำนวนวันลาสูงสุดต่อคำขอ';
    } else if (
      Number.isNaN(maximumDaysPerRequest) ||
      maximumDaysPerRequest <= 0 ||
      maximumDaysPerRequest > 365
    ) {
      validationErrors.maximumDaysPerRequest =
        'จำนวนวันสูงสุดต้องอยู่ระหว่าง 1-365 วัน';
    } else if (
      !validationErrors.minimumDays &&
      maximumDaysPerRequest < minimumDays
    ) {
      validationErrors.maximumDaysPerRequest =
        'จำนวนวันสูงสุดต้องไม่น้อยกว่าจำนวนวันขั้นต่ำ';
    }

    if (!formData.attachmentRequired) {
      validationErrors.attachmentRequired =
        'กรุณาเลือกเงื่อนไขเอกสารแนบ';
    }

    if (!formData.status) {
      validationErrors.status =
        'กรุณาเลือกสถานะประเภทการลา';
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSuccessMessage('');

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    setConfirmationOpen(true);
  };

  const confirmSave = async () => {
    const leaveTypeData = {
      ...(isEditMode ? { code: formData.code } : {}),
      name: formData.name.trim(),
      description: formData.description.trim(),
      defaultDays: Number(formData.defaultDays),
      minimumDays: Number(formData.minimumDays),
      maximumDaysPerRequest: Number(
        formData.maximumDaysPerRequest,
      ),
      attachmentRequired:
        formData.attachmentRequired === 'Yes',
      status: formData.status,
    };

    setSaving(true); setErrorMessage(''); setConfirmationError('');
    try {
      const result = isEditMode ? await updateLeaveType(leaveTypeId, leaveTypeData) : await createLeaveType(leaveTypeData);
      setConfirmationOpen(false);
      setConfirmationError('');
      setSuccessMessage(result.message || 'บันทึกประเภทการลาเรียบร้อยแล้ว');
      window.setTimeout(() => navigate(returnTo), 500);
    } catch (error) {
      const message = error.response?.data?.message || 'ไม่สามารถบันทึกประเภทการลาได้';
      setErrorMessage(message);
      setConfirmationError(message);
    }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setSuccessMessage('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <HRLayout activeMenu="Leave Type">
      <PageHeader title={isEditMode ? 'แก้ไขประเภทการลา' : 'เพิ่มประเภทการลา'} actions={<Button type="button" variant="outlined" onClick={() => navigate(returnTo)}>ยกเลิก</Button>} sx={{ maxWidth: '920px', marginInline: 'auto' }} />

      {successMessage && (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage('')}
          sx={{
            marginBottom: '24px',
            borderRadius: '8px',
          }}
        >
          {successMessage}
        </Alert>
      )}

      {(errorMessage || loading) && <Alert severity={errorMessage ? 'error' : 'info'} sx={{ marginBottom: '24px' }}>{errorMessage || 'กำลังโหลดข้อมูลประเภทการลา...'}</Alert>}

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 0,
          width: '100%',
          maxWidth: '920px',
          marginInline: 'auto',
          ...roleDashboardCardSurfaceSx,
          padding: {
            xs: '20px',
            sm: '28px 32px',
          },
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 82%, var(--role-soft, #ECFDF5) 100%)',
          border: '0',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
          '& > .MuiPaper-root': {
            background: 'transparent !important',
            border: '0 !important',
            borderRadius: '0 !important',
            boxShadow: 'none !important',
            overflow: 'visible',
          },
          '& > .MuiPaper-root > .MuiBox-root:first-of-type': {
            background: 'transparent !important',
            borderBottom: '0 !important',
            padding: {
              xs: '8px 0 10px',
              sm: '10px 4px 12px',
            },
          },
          '& > .MuiPaper-root > .MuiBox-root:last-of-type': {
            padding: {
              xs: '12px 0 24px',
              sm: '14px 4px 28px',
            },
          },
          '& > .MuiPaper-root + .MuiPaper-root': {
            marginTop: '2px',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
          },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '24px',
              },
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <Typography
              sx={{
                color: '#111827',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              ข้อมูลประเภทการลา
            </Typography>

          </Box>

          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '28px',
              },
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: '22px',
            }}
          >
            <TextField
              fullWidth
              label="รหัสประเภทการลา"
              value={isEditMode ? formData.code : 'ระบบสร้างอัตโนมัติเมื่อบันทึก'}
              helperText={
                isEditMode
                  ? 'รหัสประเภทการลาไม่สามารถแก้ไขได้'
                  : 'ระบบจะกำหนดรหัสรูปแบบ LT-xxx ให้อัตโนมัติ'
              }
              slotProps={{
                input: {
                  readOnly: true,
                },
                htmlInput: {
                  maxLength: 10,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  ...(!isEditMode && {
                    backgroundColor: '#F8FAFC',
                  }),
                },
                '& .MuiInputBase-input': {
                  ...(!isEditMode && {
                    color: '#64748B',
                    WebkitTextFillColor: '#64748B',
                  }),
                },
              }}
            />

            <TextField
              fullWidth
              required
              label="ชื่อประเภทการลา"
              placeholder="เช่น ลาพักร้อน"
              value={formData.name}
              onChange={(event) =>
                handleInputChange(
                  'name',
                  event.target.value,
                )
              }
              error={Boolean(errors.name)}
              helperText={errors.name}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '24px',
              },
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <Typography
              sx={{
                color: '#111827',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              การกำหนดสิทธิ์ลา
            </Typography>

          </Box>

          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '28px',
              },
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, minmax(0, 1fr))',
              },
              gap: '22px',
            }}
          >
            <TextField
              fullWidth
              required
              type="number"
              label="จำนวนวันลาเริ่มต้น"
              value={formData.defaultDays}
              onChange={(event) =>
                handleInputChange(
                  'defaultDays',
                  event.target.value,
                )
              }
              error={Boolean(errors.defaultDays)}
              helperText={errors.defaultDays}
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 365,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              fullWidth
              required
              type="number"
              label="จำนวนวันขอขั้นต่ำ"
              value={formData.minimumDays}
              onChange={(event) =>
                handleInputChange(
                  'minimumDays',
                  event.target.value,
                )
              }
              error={Boolean(errors.minimumDays)}
              helperText={errors.minimumDays}
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 365,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              fullWidth
              required
              type="number"
              label="จำนวนวันขอสูงสุด"
              value={formData.maximumDaysPerRequest}
              onChange={(event) =>
                handleInputChange(
                  'maximumDaysPerRequest',
                  event.target.value,
                )
              }
              error={Boolean(
                errors.maximumDaysPerRequest,
              )}
              helperText={errors.maximumDaysPerRequest}
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 365,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '24px',
              },
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <Typography
              sx={{
                color: '#111827',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              เงื่อนไขคำขอ
            </Typography>

          </Box>

          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '28px',
              },
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: '22px',
            }}
          >
            <FormControl
              fullWidth
              required
              error={Boolean(errors.attachmentRequired)}
            >
              <InputLabel id="attachment-required-label">
                เอกสารแนบ
              </InputLabel>

              <Select
                labelId="attachment-required-label"
                value={formData.attachmentRequired}
                label="เอกสารแนบ"
                onChange={(event) =>
                  handleInputChange(
                    'attachmentRequired',
                    event.target.value,
                  )
                }
                sx={{
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="No">
                  ไม่จำเป็น
                </MenuItem>

                <MenuItem value="Yes">
                  จำเป็น
                </MenuItem>
              </Select>

              {errors.attachmentRequired && (
                <FormHelperText>
                  {errors.attachmentRequired}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              required
              error={Boolean(errors.status)}
            >
              <InputLabel id="leave-type-status-label">
                สถานะ
              </InputLabel>

              <Select
                labelId="leave-type-status-label"
                value={formData.status}
                label="สถานะ"
                onChange={(event) =>
                  handleInputChange(
                    'status',
                    event.target.value,
                  )
                }
                sx={{
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="Active">
                  ใช้งานอยู่
                </MenuItem>

                <MenuItem value="Inactive">
                  ไม่ใช้งาน
                </MenuItem>
              </Select>

              {errors.status && (
                <FormHelperText>
                  {errors.status}
                </FormHelperText>
              )}
            </FormControl>

          </Box>
        </Paper>

        <Box
          sx={{
            gridColumn: '1 / -1',
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '4px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column-reverse',
                sm: 'row',
              },
              gap: '12px',
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={handleReset}
              sx={{
                minWidth: '110px',
                height: '44px',
                padding: '0 20px',
                color: '#374151',
                borderColor: '#D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  borderColor: '#9CA3AF',
                  backgroundColor: '#F9FAFB',
                },
              }}
            >
              ล้างข้อมูล
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving || loading}
              sx={{
                minWidth: '160px',
                height: '44px',
                padding: '0 20px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',

                '&:hover': {
                  backgroundColor: '#1D4ED8',
                  boxShadow: 'none',
                },
              }}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </Box>
        </Box>
      </Box>
      <Dialog open={confirmationOpen} onClose={() => { if (!saving) { setConfirmationOpen(false); setConfirmationError(''); } }} fullWidth maxWidth="sm"><DialogTitle sx={{ fontWeight: 800 }}>ยืนยันการบันทึกประเภทการลา</DialogTitle><DialogContent>{confirmationError ? <Alert severity="error" sx={{ marginBottom: '16px' }}>{confirmationError}</Alert> : null}<Box sx={{ display: 'grid', gap: '10px' }}><Typography><strong>รหัส:</strong> {isEditMode ? formData.code : 'ระบบสร้างอัตโนมัติ'}</Typography><Typography><strong>ชื่อ:</strong> {formData.name}</Typography><Typography><strong>สิทธิ์เริ่มต้น:</strong> {formData.defaultDays} วัน</Typography><Typography><strong>ช่วงวันที่ขอ:</strong> {formData.minimumDays}-{formData.maximumDaysPerRequest} วัน</Typography><Typography><strong>เอกสารแนบ:</strong> {formData.attachmentRequired === 'Yes' ? 'จำเป็น' : 'ไม่จำเป็น'}</Typography></Box></DialogContent><DialogActions sx={{ padding: '14px 20px' }}><Button type="button" variant="outlined" color="secondary" disabled={saving} onClick={() => { setConfirmationOpen(false); setConfirmationError(''); }}>กลับไปแก้ไข</Button><Button type="button" variant="contained" color="success" disabled={saving} onClick={confirmSave}>{saving ? 'กำลังบันทึก...' : 'ยืนยันบันทึก'}</Button></DialogActions></Dialog>
    </HRLayout>
  );
}

export default LeaveTypeFormPage;
