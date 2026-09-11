import { useState } from 'react';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';

const formatDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const today = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

function ThaiCalendarField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  min,
  max,
  primaryColor,
}) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    new Date(`${value || min || today()}T00:00:00Z`));

  const openPicker = () => {
    if (disabled) return;
    setVisibleMonth(new Date(`${value || min || today()}T00:00:00Z`));
    setOpen(true);
  };
  const year = visibleMonth.getUTCFullYear();
  const month = visibleMonth.getUTCMonth();
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const moveMonth = (offset) => setVisibleMonth(new Date(Date.UTC(year, month + offset, 1)));
  const selectDay = (day) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(date);
    setOpen(false);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        required={required}
        disabled={disabled}
        label={label}
        value={formatDate(value)}
        placeholder="วว/ดด/ปปปป"
        error={error}
        helperText={helperText}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicker();
          }
        }}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="button" disabled={disabled} edge="end" aria-label={`เลือก${label}`} onClick={(event) => { event.stopPropagation(); openPicker(); }}>
                  <CalendarMonthRounded fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          cursor: 'pointer',
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px', cursor: 'pointer',
            ...(primaryColor ? { '&.Mui-focused fieldset': { borderColor: primaryColor } } : {}),
          },
          '& .MuiInputBase-input': { cursor: 'pointer' },
          ...(primaryColor ? { '& .MuiInputLabel-root.Mui-focused': { color: primaryColor } } : {}),
        }}
      />
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <IconButton aria-label="เดือนก่อนหน้า" onClick={() => moveMonth(-1)}>‹</IconButton>
          <Typography sx={{ fontWeight: 800 }}>
            {visibleMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
          </Typography>
          <IconButton aria-label="เดือนถัดไป" onClick={() => moveMonth(1)}>›</IconButton>
        </DialogTitle>
        <DialogContent sx={{ paddingBottom: '20px !important' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((name) => (
              <Typography key={name} sx={{ color: '#64748B', fontSize: '12px', fontWeight: 700, padding: '6px 0' }}>{name}</Typography>
            ))}
            {days.map((day, index) => {
              if (!day) return <Box key={`empty-${index}`} />;
              const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const outsideRange = Boolean(min && date < min) || Boolean(max && date > max);
              return (
                <Button key={date} type="button" disabled={outsideRange} onClick={() => selectDay(day)}
                  sx={{ minWidth: 0, height: '38px', padding: 0, borderRadius: '9px', fontWeight: value === date ? 800 : 500, backgroundColor: value === date ? '#DBEAFE' : 'transparent' }}>
                  {day}
                </Button>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ThaiCalendarField;
