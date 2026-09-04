import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';

import { getLeaveBalance } from '../api/leave-service.js';

const number = (value) => Number(value || 0);

const leaveAccents = [
  {
    color: '#4338CA',
    soft: '#E0E7FF',
    gradient:
      'linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 45%, #E0E7FF 100%)',
  },
  {
    color: '#C2410C',
    soft: '#FFEDD5',
    gradient:
      'linear-gradient(135deg, #FFFFFF 0%, #FFFBF5 45%, #FFEDD5 100%)',
  },
  {
    color: '#BE123C',
    soft: '#FFE4E6',
    gradient:
      'linear-gradient(135deg, #FFFFFF 0%, #FFF8F9 45%, #FFE4E6 100%)',
  },
  {
    color: '#0E7490',
    soft: '#CFFAFE',
    gradient:
      'linear-gradient(135deg, #FFFFFF 0%, #F4FDFF 45%, #CFFAFE 100%)',
  },
  {
    color: '#6D28D9',
    soft: '#EDE9FE',
    gradient:
      'linear-gradient(135deg, #FFFFFF 0%, #FAF8FF 45%, #EDE9FE 100%)',
  },
];

const getLeaveAccent = (balance, index) => {
  const id = Number(balance.leaveTypeId);

  if (id >= 1 && id <= 3) {
    return leaveAccents[id - 1];
  }

  const name = String(balance.leaveType || '').toLowerCase();

  if (
    name.includes('annual') ||
    name.includes('vacation') ||
    name.includes('พักร้อน')
  ) {
    return leaveAccents[0];
  }

  if (
    name.includes('personal') ||
    name.includes('business') ||
    name.includes('กิจ')
  ) {
    return leaveAccents[1];
  }

  if (
    name.includes('sick') ||
    name.includes('ป่วย')
  ) {
    return leaveAccents[2];
  }

  return leaveAccents[3 + (index % 2)];
};

export default function DashboardLeaveBalance() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    getLeaveBalance(year)
      .then((result) => {
        if (active) {
          setBalances(result?.balances || []);
        }
      })
      .catch(() => {
        if (active) {
          setError('ไม่สามารถโหลดข้อมูลสิทธิ์การลาได้');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [year]);

  const years = [0, 1, 2].map(
    (offset) => new Date().getFullYear() - offset,
  );

  return (
    <Box
      component="section"
      sx={{
        marginTop: '8px',
        marginBottom: '28px',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '14px',
        }}
      >
        <Typography
          component="h2"
          sx={{
            color: '#0F172A',
            fontSize: {
              xs: '16px',
              sm: '18px',
            },
            fontWeight: 600,
          }}
        >
          สิทธิ์การลาของฉัน
        </Typography>

        <Select
          size="small"
          value={year}
          onChange={(event) =>
            setYear(Number(event.target.value))
          }
          inputProps={{
            'aria-label': 'ปีของสิทธิ์การลา',
          }}
          sx={{
            width: 120,
            height: 42,
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#334155',
            backgroundColor: '#FFFFFF',

            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E2E8F0',
            },

            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CBD5E1',
            },

            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#93C5FD',
            },
          }}
        >
          {years.map((item) => (
            <MenuItem
              key={item}
              value={item}
            >
              ปี {item}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {loading ? (
        <Box
          sx={{
            minHeight: 150,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Alert severity="error">
          {error}
        </Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },

            gap: '16px',
          }}
        >
          {balances.map((balance, index) => {
            const accent = getLeaveAccent(
              balance,
              index,
            );

            return (
              <Paper
                key={
                  balance.leaveTypeId ||
                  balance.leaveType
                }
                elevation={0}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',

                  minHeight: '72px',

                  padding: '16px 18px',

                  background: accent.gradient,

                  border:
                    '1px solid rgba(226, 232, 240, 0.8)',

                  borderRadius: '18px',

                  boxShadow:
                    '0 8px 24px rgba(15, 23, 42, 0.06)',

                  transition:
                    'transform 160ms ease, box-shadow 160ms ease',

                  '&:hover': {
                    transform: 'translateY(-2px)',

                    boxShadow:
                      '0 12px 28px rgba(15, 23, 42, 0.09)',
                  },
                }}
              >
                {/* ประเภทการลา */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minWidth: 0,
                    flexShrink: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: '10px',
                      height: '10px',

                      borderRadius: '50%',

                      backgroundColor:
                        accent.color,

                      boxShadow: `0 0 0 5px ${accent.soft}`,
                    }}
                  />

                  <Typography
                    noWrap
                    sx={{
                      color: '#334155',
                      fontSize: '14px',
                      fontWeight: 800,
                    }}
                  >
                    {balance.leaveType || '-'}
                  </Typography>
                </Box>

                {/* คงเหลือ */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    flexWrap: 'nowrap',
                    gap: '7px',
                    marginTop: 0,
                    marginLeft: 'auto',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      color: '#64748B',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    คงเหลือ
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '7px',

                      marginTop: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        color: accent.color,

                        fontSize: {
                          xs: '17px',
                          sm: '18px',
                        },

                        fontWeight: 800,
                        lineHeight: 1.1,
                      }}
                    >
                      {number(
                        balance.remaining,
                      )}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#475569',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      วัน
                    </Typography>
                  </Box>
                </Box>

                {/* ข้อมูลด้านล่าง */}
                <Box
                  sx={{
                    display: 'none',
                    alignItems: 'center',

                    flexWrap: 'wrap',

                    gap: {
                      xs: '10px 18px',
                      sm: '24px',
                    },

                    marginTop: '24px',
                    paddingTop: '14px',

                    borderTop:
                      '1px solid rgba(226, 232, 240, 0.85)',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#64748B',
                      fontSize: '12px',
                    }}
                  >
                    สิทธิ์ทั้งหมด{' '}
                    <Box
                      component="span"
                      sx={{
                        color: '#334155',
                        fontWeight: 800,
                      }}
                    >
                      {number(
                        balance.total,
                      )}{' '}
                      วัน
                    </Box>
                  </Typography>

                  <Typography
                    sx={{
                      color: '#64748B',
                      fontSize: '12px',
                    }}
                  >
                    ใช้แล้ว{' '}
                    <Box
                      component="span"
                      sx={{
                        color: '#334155',
                        fontWeight: 800,
                      }}
                    >
                      {number(
                        balance.used,
                      )}{' '}
                      วัน
                    </Box>
                  </Typography>
                </Box>
              </Paper>
            );
          })}

          {!balances.length ? (
            <Paper
              elevation={0}
              sx={{
                gridColumn: '1 / -1',

                padding: '34px',

                border:
                  '1px dashed #CBD5E1',

                borderRadius: '16px',

                backgroundColor:
                  '#FFFFFF',

                color: '#64748B',

                textAlign: 'center',
                fontSize: '13px',
              }}
            >
              ยังไม่มีข้อมูลสิทธิ์การลาในปีนี้
            </Paper>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
