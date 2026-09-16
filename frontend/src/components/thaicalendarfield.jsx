import { useState } from 'react';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { SYSTEM_START_YEAR } from '../config/systemdates.js';

const formatDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const today = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const calendarStartValue = (value, min, max, allowedYears) => {
  let candidate = value || today();
  if (min && candidate < min) candidate = min;
  if (max && candidate > max) candidate = max;

  const years = Array.isArray(allowedYears)
    ? [...new Set(allowedYears.map(Number).filter(Number.isInteger))].sort((first, second) => second - first)
    : [];
  if (years.length > 0 && !years.includes(Number(candidate.slice(0, 4)))) {
    const year = years[0];
    candidate = `${year}-01-01`;
    if (min && candidate < min) candidate = min;
    if (max && candidate > max) candidate = max;
  }
  return candidate;
};

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
  allowedYears,
  primaryColor,
}) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    new Date(`${calendarStartValue(value, min, max, allowedYears)}T00:00:00Z`));

  const openPicker = () => {
    if (disabled) return;
    setVisibleMonth(new Date(`${calendarStartValue(value, min, max, allowedYears)}T00:00:00Z`));
    setOpen(true);
  };
  const year = visibleMonth.getUTCFullYear();
  const month = visibleMonth.getUTCMonth();
  const visibleMonthValue = `${year}-${String(month + 1).padStart(2, '0')}`;
  const normalizedAllowedYears = Array.isArray(allowedYears)
    ? [...new Set(allowedYears.map(Number).filter(Number.isInteger))]
    : null;
  const previousMonthYear = new Date(Date.UTC(year, month - 1, 1)).getUTCFullYear();
  const nextMonthYear = new Date(Date.UTC(year, month + 1, 1)).getUTCFullYear();
  const previousMonthDisabled = Boolean(min && visibleMonthValue <= min.slice(0, 7)) ||
    Boolean(normalizedAllowedYears && !normalizedAllowedYears.includes(previousMonthYear));
  const nextMonthDisabled = Boolean(max && visibleMonthValue >= max.slice(0, 7)) ||
    Boolean(normalizedAllowedYears && !normalizedAllowedYears.includes(nextMonthYear));
  const currentYear = Number(today().slice(0, 4));
  const minimumYear = Math.max(
    SYSTEM_START_YEAR,
    min ? Number(min.slice(0, 4)) : SYSTEM_START_YEAR,
  );
  const maximumYear = max ? Number(max.slice(0, 4)) : currentYear + 10;
  const selectableYears = Array.from(
    { length: maximumYear - minimumYear + 1 },
    (_, index) => maximumYear - index,
  ).filter((selectableYear) =>
    !normalizedAllowedYears || normalizedAllowedYears.includes(selectableYear));
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const moveMonth = (offset) => setVisibleMonth(new Date(Date.UTC(year, month + offset, 1)));
  const selectMonth = (nextMonth) => setVisibleMonth(new Date(Date.UTC(year, Number(nextMonth), 1)));
  const selectYear = (nextYear) => {
    const numericYear = Number(nextYear);
    let nextMonth = month;
    if (min && numericYear === Number(min.slice(0, 4))) nextMonth = Math.max(nextMonth, Number(min.slice(5, 7)) - 1);
    if (max && numericYear === Number(max.slice(0, 4))) nextMonth = Math.min(nextMonth, Number(max.slice(5, 7)) - 1);
    setVisibleMonth(new Date(Date.UTC(numericYear, nextMonth, 1)));
  };
  const todayValue = today();
  const todayOutsideRange = Boolean(min && todayValue < min) || Boolean(max && todayValue > max) ||
    Boolean(normalizedAllowedYears && !normalizedAllowedYears.includes(Number(todayValue.slice(0, 4))));
  const showCurrentMonth = () => {
    if (todayOutsideRange) return;
    setVisibleMonth(new Date(`${todayValue}T00:00:00Z`));
  };
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
          <IconButton aria-label="เดือนก่อนหน้า" disabled={previousMonthDisabled} onClick={() => moveMonth(-1)}>‹</IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Select
              size="small"
              value={month}
              onChange={(event) => selectMonth(event.target.value)}
              aria-label="เลือกเดือน"
              sx={{
                minWidth: '132px',
                borderRadius: '10px',
                fontWeight: 700,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
            >
              {thaiMonths.map((monthName, monthIndex) => {
                const monthValue = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
                const outsideRange = Boolean(min && monthValue < min.slice(0, 7)) || Boolean(max && monthValue > max.slice(0, 7));
                return <MenuItem key={monthName} value={monthIndex} disabled={outsideRange}>{monthName}</MenuItem>;
              })}
            </Select>
            <Select
              size="small"
              value={year}
              onChange={(event) => selectYear(event.target.value)}
              aria-label="เลือกปี"
              sx={{
                minWidth: '96px',
                borderRadius: '10px',
                fontWeight: 700,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
            >
              {selectableYears.map((selectableYear) => (
                <MenuItem key={selectableYear} value={selectableYear}>{selectableYear + 543}</MenuItem>
              ))}
            </Select>
          </Box>
          <IconButton aria-label="เดือนถัดไป" disabled={nextMonthDisabled} onClick={() => moveMonth(1)}>›</IconButton>
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
              const isToday = date === todayValue;
              return (
                <Button key={date} type="button" disabled={outsideRange} onClick={() => selectDay(day)}
                  sx={{
                    minWidth: 0,
                    width: '34px',
                    height: '34px',
                    justifySelf: 'center',
                    padding: 0,
                    borderRadius: '11px',
                    fontWeight: value === date || isToday ? 800 : 500,
                    color: isToday ? (primaryColor || '#1D4ED8') : undefined,
                    backgroundColor: value === date
                      ? '#BFDBFE'
                      : isToday
                        ? `color-mix(in srgb, ${primaryColor || '#2563EB'} 20%, white)`
                        : 'transparent',
                    boxShadow: isToday && value !== date ? `0 5px 14px color-mix(in srgb, ${primaryColor || '#2563EB'} 30%, transparent)` : 'none',
                    transform: isToday && value !== date ? 'translateY(-1px)' : 'none',
                    transition: 'background-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease',
                    '&:hover': {
                      backgroundColor: value === date
                        ? '#93C5FD'
                        : isToday
                          ? `color-mix(in srgb, ${primaryColor || '#2563EB'} 28%, white)`
                          : '#F1F5F9',
                    },
                  }}>
                  {day}
                </Button>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '0 24px 20px' }}>
          <Button
            type="button"
            disabled={todayOutsideRange}
            onClick={showCurrentMonth}
            sx={{
              borderRadius: '999px',
              padding: '7px 18px',
              fontWeight: 700,
              color: primaryColor || '#2563EB',
            }}
          >
            วันนี้
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ThaiCalendarField;
