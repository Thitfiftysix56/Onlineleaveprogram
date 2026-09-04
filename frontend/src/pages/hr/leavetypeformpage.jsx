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
import { BackButton, PageHeader } from '../../components/sharedvisualfoundation.jsx';
import { roleDashboardCardSurfaceSx } from '../../theme/rolecardsurface.js';
import { useNavigate, useParams } from 'react-router-dom';
import { createLeaveType, getLeaveType, updateLeaveType } from '../../api/leave-type-service.js';

function LeaveTypeFormPage({ mode = 'add' }) {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const { leaveTypeId } = useParams();
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
  };

  const validateForm = () => {
    const validationErrors = {};

    const code = formData.code.trim().toUpperCase();
    const name = formData.name.trim();
    const description = formData.description.trim();

    const defaultDays = Number(formData.defaultDays);
    const minimumDays = Number(formData.minimumDays);
    const maximumDaysPerRequest = Number(
      formData.maximumDaysPerRequest,
    );

    if (!code) {
      validationErrors.code =
        'กรุณากรอกรหัสประเภทการลา';
    } else if (!/^[A-Z0-9]{2,10}$/.test(code)) {
      validationErrors.code =
        'ใช้ตัวอักษร A-Z หรือตัวเลข จำนวน 2–10 ตัว';
    }

    if (!name) {
      validationErrors.name =
        'กรุณากรอกชื่อประเภทการลา';
    }

    if (!description) {
      validationErrors.description =
        'กรุณากรอกรายละเอียด';
    } else if (description.length < 10) {
      validationErrors.description =
        'รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร';
    }

    if (!formData.defaultDays) {
      validationErrors.defaultDays =
        'กรุณากรอกจำนวนวันลาเริ่มต้น';
    } else if (
      Number.isNaN(defaultDays) ||
      defaultDays < 0 ||
      defaultDays > 365
    ) {
      validationErrors.defaultDays =
        'จำนวนวันต้องอยู่ระหว่าง 0-365 วัน';
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
      code: formData.code.trim().toUpperCase(),
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

    setSaving(true); setErrorMessage('');
    try {
      const result = isEditMode ? await updateLeaveType(leaveTypeId, leaveTypeData) : await createLeaveType(leaveTypeData);
      setConfirmationOpen(false);
      setSuccessMessage(result.message || 'บันทึกประเภทการลาเรียบร้อยแล้ว');
      window.setTimeout(() => navigate('/hr/leave-types'), 500);
    } catch (error) { setErrorMessage(error.response?.data?.message || 'ไม่สามารถบันทึกประเภทการลาได้'); }
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
      <PageHeader title={isEditMode ? 'แก้ไขประเภทการลา' : 'เพิ่มประเภทการลา'} actions={<BackButton onClick={() => navigate('/hr/leave-types')}>กลับ</BackButton>} sx={{ maxWidth: '820px', marginInline: 'auto' }} />

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
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'repeat(2, minmax(0, 1fr))',
          },
          gap: '16px',
          width: '100%',
          maxWidth: '820px',
          marginInline: 'auto',
          '& > .MuiPaper-root': {
            borderRadius: '20px',
            borderColor: '#E2E8F0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            ...roleDashboardCardSurfaceSx,
          },
          '& > .MuiPaper-root > .MuiBox-root:first-of-type': {
            background: 'transparent !important',
            borderBottom: '0 !important',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
          },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            gridRow: { lg: 'span 2' },
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
              required
              label="รหัสประเภทการลา"
              placeholder="เช่น AL"
              value={formData.code}
              onChange={(event) =>
                handleInputChange(
                  'code',
                  event.target.value.toUpperCase(),
                )
              }
              error={Boolean(errors.code)}
              helperText={
                errors.code ||
                'ใช้ตัวอักษร A-Z หรือตัวเลข จำนวน 2–10 ตัว'
              }
              slotProps={{
                htmlInput: {
                  maxLength: 10,
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

            <TextField
              fullWidth
              required
              multiline
              minRows={4}
              label="รายละเอียด"
              placeholder="ระบุเงื่อนไขการใช้ประเภทการลานี้"
              value={formData.description}
              onChange={(event) =>
                handleInputChange(
                  'description',
                  event.target.value,
                )
              }
              error={Boolean(errors.description)}
              helperText={
                errors.description ||
                `${formData.description.length}/500 ตัวอักษร`
              }
              slotProps={{
                htmlInput: {
                  maxLength: 500,
                },
              }}
              sx={{
                gridColumn: {
                  xs: 'auto',
                  sm: '1 / -1',
                },

                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },

                '& .MuiFormHelperText-root': {
                  textAlign: errors.description
                    ? 'left'
                    : 'right',
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
                  min: 0,
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
                backgroundColor: '#059669',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',

                '&:hover': {
                  backgroundColor: '#047857',
                  boxShadow: 'none',
                },
              }}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </Box>
        </Box>
      </Box>
      <Dialog open={confirmationOpen} onClose={() => !saving && setConfirmationOpen(false)} fullWidth maxWidth="sm"><DialogTitle sx={{ fontWeight: 800 }}>ยืนยันการบันทึกประเภทการลา</DialogTitle><DialogContent dividers><Box sx={{ display: 'grid', gap: '10px' }}><Typography><strong>รหัส:</strong> {formData.code}</Typography><Typography><strong>ชื่อ:</strong> {formData.name}</Typography><Typography><strong>สิทธิ์เริ่มต้น:</strong> {formData.defaultDays} วัน</Typography><Typography><strong>ช่วงวันที่ขอ:</strong> {formData.minimumDays}-{formData.maximumDaysPerRequest} วัน</Typography><Typography><strong>เอกสารแนบ:</strong> {formData.attachmentRequired === 'Yes' ? 'จำเป็น' : 'ไม่จำเป็น'}</Typography></Box></DialogContent><DialogActions sx={{ padding: '14px 20px' }}><Button type="button" variant="outlined" disabled={saving} onClick={() => setConfirmationOpen(false)} sx={{ color: '#475569', borderColor: '#CBD5E1' }}>กลับไปแก้ไข</Button><Button type="button" variant="contained" disabled={saving} onClick={confirmSave} sx={{ backgroundColor: '#15803D', '&:hover': { backgroundColor: '#166534' } }}>{saving ? 'กำลังบันทึก...' : 'ยืนยันบันทึก'}</Button></DialogActions></Dialog>
    </HRLayout>
  );
}

export default LeaveTypeFormPage;
