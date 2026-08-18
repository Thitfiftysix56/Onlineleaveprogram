import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Box,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';

import { getLeaveBalance } from '../api/leave-service.js';

const legacyLeaveBalanceSamples = [
  {
    id: 1,
    leaveType: 'Annual Leave',
    year: 2026,
    totalDays: 10,
    usedDays: 3,
    pendingDays: 2,
    updatedAt: '20 Jul 2026, 14:05',
  },
  {
    id: 2,
    leaveType: 'Sick Leave',
    year: 2026,
    totalDays: 30,
    usedDays: 1,
    pendingDays: 0,
    updatedAt: '16 Jul 2026, 09:20',
  },
  {
    id: 3,
    leaveType: 'Personal Leave',
    year: 2026,
    totalDays: 5,
    usedDays: 0,
    pendingDays: 1,
    updatedAt: '20 Jul 2026, 14:05',
  },
  {
    id: 4,
    leaveType: 'Annual Leave',
    year: 2025,
    totalDays: 10,
    usedDays: 8,
    pendingDays: 0,
    updatedAt: '31 Dec 2025, 16:30',
  },
  {
    id: 5,
    leaveType: 'Sick Leave',
    year: 2025,
    totalDays: 30,
    usedDays: 4,
    pendingDays: 0,
    updatedAt: '31 Dec 2025, 16:30',
  },
  {
    id: 6,
    leaveType: 'Personal Leave',
    year: 2025,
    totalDays: 5,
    usedDays: 2,
    pendingDays: 0,
    updatedAt: '31 Dec 2025, 16:30',
  },
];

const leaveTypeLabels = {
  'Annual Leave': 'ลาพักร้อน',
  'Sick Leave': 'ลาป่วย',
  'Personal Leave': 'ลากิจ',
  'Maternity Leave': 'ลาคลอด',
  'Other Leave': 'ลาอื่น ๆ',
};

const formatDays = (
  numberOfDays,
) => {
  const numericValue =
    Number(numberOfDays);

  if (
    !Number.isFinite(
      numericValue,
    )
  ) {
    return '0';
  }

  if (
    Number.isInteger(
      numericValue,
    )
  ) {
    return String(
      numericValue,
    );
  }

  return numericValue
    .toFixed(2)
    .replace(
      /\.?0+$/,
      '',
    );
};

const getLeaveTypeLabel = (
  leaveType,
) =>
  leaveTypeLabels[
    leaveType
  ] ||
  leaveType ||
  '-';

const formatDateTime = (
  value,
) => {
  if (!value) {
    return '-';
  }

  const text =
    String(value).trim();

  const englishDateMatch =
    text.match(
      /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4}),?\s+(\d{1,2}):(\d{2})$/,
    );

  if (
    englishDateMatch
  ) {
    const [
      ,
      day,
      monthText,
      year,
      hour,
      minute,
    ] =
      englishDateMatch;

    const months = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12',
    };

    const normalizedMonth =
      monthText
        .charAt(0)
        .toUpperCase() +
      monthText
        .slice(1)
        .toLowerCase();

    const month =
      months[
        normalizedMonth
      ];

    if (month) {
      return `${String(
        day,
      ).padStart(
        2,
        '0',
      )}/${month}/${year} ${String(
        hour,
      ).padStart(
        2,
        '0',
      )}:${minute}`;
    }
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return text;
  }

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      '0',
    );

  const month =
    String(
      date.getMonth() +
        1,
    ).padStart(
      2,
      '0',
    );

  const year =
    date.getFullYear();

  const hour =
    String(
      date.getHours(),
    ).padStart(
      2,
      '0',
    );

  const minute =
    String(
      date.getMinutes(),
    ).padStart(
      2,
      '0',
    );

  return `${day}/${month}/${year} ${hour}:${minute}`;
};

const getLeaveTypeStyle = (
  leaveType,
  theme,
) => {
  const leaveTypeStyles = {
    'Annual Leave': {
      shortName: 'A',
      backgroundColor:
        '#EFF6FF',
      color:
        '#2563EB',
      borderColor:
        '#BFDBFE',
    },

    'Sick Leave': {
      shortName: 'S',
      backgroundColor:
        '#FFF1F2',
      color:
        '#E11D48',
      borderColor:
        '#FECDD3',
    },

    'Personal Leave': {
      shortName: 'P',
      backgroundColor:
        '#F5F3FF',
      color:
        '#7C3AED',
      borderColor:
        '#DDD6FE',
    },

    'Maternity Leave': {
      shortName: 'M',
      backgroundColor:
        '#FDF2F8',
      color:
        '#DB2777',
      borderColor:
        '#FBCFE8',
    },
  };

  return (
    leaveTypeStyles[
      leaveType
    ] || {
      shortName:
        String(
          leaveType || 'L',
        )
          .trim()
          .charAt(0)
          .toUpperCase() ||
        'L',

      backgroundColor:
        theme?.soft ||
        '#F3F4F6',

      color:
        theme?.primary ||
        '#4B5563',

      borderColor:
        theme?.border ||
        '#D1D5DB',
    }
  );
};

const getBalanceStatus = (
  balance,
) => {
  if (
    balance.availableDays <=
    0
  ) {
    return {
      label:
        'สิทธิ์หมด',

      backgroundColor:
        '#FEE2E2',

      color:
        '#B91C1C',
    };
  }

  const availablePercentage =
    balance.totalDays >
    0
      ? (balance.availableDays /
          balance.totalDays) *
        100
      : 0;

  if (
    availablePercentage <=
    25
  ) {
    return {
      label:
        'คงเหลือน้อย',

      backgroundColor:
        '#FEF3C7',

      color:
        '#B45309',
    };
  }

  return {
    label:
      'ใช้งานได้',

    backgroundColor:
      '#DCFCE7',

    color:
      '#15803D',
  };
};

function RoleLeaveBalancePage({
  LayoutComponent,
  theme,
}) {
  void legacyLeaveBalanceSamples;
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1];

  const [
    selectedYear,
    setSelectedYear,
  ] = useState(
    String(currentYear),
  );

  const [balances, setBalances] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    setLoadError('');

    getLeaveBalance(Number(selectedYear))
      .then((data) => {
        if (!active) return;
        setBalances((data?.balances || []).map((balance) => ({
          ...balance,
          year: data.year,
          totalDays: balance.total,
          usedDays: balance.used,
          pendingDays: balance.pending,
        })));
      })
      .catch((error) => {
        if (active) {
          setBalances([]);
          setLoadError(error.response?.data?.message || 'ไม่สามารถโหลดสิทธิ์วันลาได้');
        }
      });

    return () => {
      active = false;
    };
  }, [selectedYear]);

  const selectedBalances =
    useMemo(
      () =>
        balances
          .filter(
            (
              balance,
            ) =>
              String(
                balance.year,
              ) ===
              selectedYear,
          )
          .map(
            (
              balance,
            ) => {
              const totalDays =
                Number(
                  balance.totalDays,
                ) || 0;

              const usedDays =
                Number(
                  balance.usedDays,
                ) || 0;

              const pendingDays =
                Number(
                  balance.pendingDays,
                ) || 0;

              const remainingDays =
                totalDays -
                usedDays;

              const availableDays =
                remainingDays -
                pendingDays;

              return {
                ...balance,

                totalDays,

                usedDays,

                pendingDays,

                remainingDays,

                availableDays,
              };
            },
          ),
      [
        balances,
        selectedYear,
      ],
    );

  const summary =
    useMemo(
      () =>
        selectedBalances.reduce(
          (
            result,
            balance,
          ) => ({
            totalDays:
              result.totalDays +
              Number(
                balance.totalDays,
              ),

            usedDays:
              result.usedDays +
              Number(
                balance.usedDays,
              ),

            pendingDays:
              result.pendingDays +
              Number(
                balance.pendingDays,
              ),

            availableDays:
              result.availableDays +
              Number(
                balance.availableDays,
              ),
          }),
          {
            totalDays:
              0,

            usedDays:
              0,

            pendingDays:
              0,

            availableDays:
              0,
          },
        ),
      [
        selectedBalances,
      ],
    );

  const summaryCards = [
    {
      title:
        'สิทธิ์ทั้งหมด',

      value:
        summary.totalDays,

      description:
        'จำนวนวันลาที่ได้รับ',

      backgroundColor:
        theme?.soft ||
        '#EFF6FF',

      color:
        theme?.primary ||
        '#2563EB',

      borderColor:
        theme?.border ||
        '#BFDBFE',
    },

    {
      title:
        'ใช้ไปแล้ว',

      value:
        summary.usedDays,

      description:
        'จากคำขอที่อนุมัติแล้ว',

      backgroundColor:
        '#FFF1F2',

      color:
        '#E11D48',

      borderColor:
        '#FECDD3',
    },

    {
      title:
        'รออนุมัติ',

      value:
        summary.pendingDays,

      description:
        'อยู่ระหว่างการพิจารณา',

      backgroundColor:
        '#FFFBEB',

      color:
        '#D97706',

      borderColor:
        '#FDE68A',
    },

    {
      title:
        'คงเหลือใช้ได้',

      value:
        summary.availableDays,

      description:
        'สามารถใช้ยื่นคำขอได้',

      backgroundColor:
        '#ECFDF5',

      color:
        '#059669',

      borderColor:
        '#A7F3D0',
    },
  ];

  return (
    <LayoutComponent
      activeMenu="Leave Balance"
    >
      <Box
        sx={{
          display:
            'flex',

          alignItems: {
            xs:
              'flex-start',

            sm:
              'center',
          },

          justifyContent:
            'space-between',

          flexDirection: {
            xs:
              'column',

            sm:
              'row',
          },

          gap:
            '16px',

          marginBottom:
            '24px',
        }}
      >
        <Typography
          component="h1"
          sx={{
            color:
              '#111827',

            fontSize: {
              xs:
                '26px',

              sm:
                '30px',
            },

            fontWeight:
              800,
          }}
        >
          สิทธิ์วันลาคงเหลือ
        </Typography>

        <FormControl
          size="small"
          sx={{
            width: {
              xs:
                '100%',

              sm:
                '170px',
            },
          }}
        >
          <InputLabel id="leave-balance-year-label">
            ปีสิทธิ์
          </InputLabel>

          <Select
            labelId="leave-balance-year-label"
            value={
              selectedYear
            }
            label="ปีสิทธิ์"
            onChange={(
              event,
            ) =>
              setSelectedYear(
                event.target
                  .value,
              )
            }
            sx={{
              height:
                '44px',

              backgroundColor:
                '#FFFFFF',

              borderRadius:
                '9px',

              '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                {
                  borderColor:
                    theme?.primary ||
                    '#2563EB',
                },

              '& .MuiSelect-select':
                {
                  fontSize:
                    '13px',

                  fontWeight:
                    600,
                },
            }}
          >
            {availableYears.map(
              (
                year,
              ) => (
                <MenuItem
                  key={
                    year
                  }
                  value={String(
                    year,
                  )}
                >
                  {
                    year
                  }
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ marginBottom: '20px', borderRadius: '10px' }}>
          {loadError}
        </Alert>
      )}

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              'repeat(2, minmax(0, 1fr))',

            lg:
              'repeat(4, minmax(0, 1fr))',
          },

          gap: {
            xs:
              '12px',

            sm:
              '16px',
          },

          marginBottom:
            '26px',
        }}
      >
        {summaryCards.map(
          (
            card,
          ) => (
            <Paper
              key={
                card.title
              }
              elevation={0}
              sx={{
                minHeight:
                  '112px',

                padding:
                  '16px 18px',

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '14px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderRadius:
                  '12px',
              }}
            >
              <Box
                sx={{
                  width:
                    '48px',

                  height:
                    '48px',

                  flexShrink:
                    0,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  backgroundColor:
                    card.backgroundColor,

                  color:
                    card.color,

                  border:
                    `1px solid ${card.borderColor}`,

                  borderRadius:
                    '12px',

                  fontSize:
                    '18px',

                  fontWeight:
                    800,
                }}
              >
                {formatDays(
                  card.value,
                )}
              </Box>

              <Box
                sx={{
                  minWidth:
                    0,
                }}
              >
                <Typography
                  sx={{
                    color:
                      '#111827',

                    fontSize:
                      '14px',

                    fontWeight:
                      800,
                  }}
                >
                  {
                    card.title
                  }
                </Typography>

                <Typography
                  sx={{
                    color:
                      card.color,

                    fontSize:
                      '20px',

                    fontWeight:
                      800,

                    lineHeight:
                      1.3,

                    marginTop:
                      '2px',
                  }}
                >
                  {formatDays(
                    card.value,
                  )}{' '}
                  วัน
                </Typography>

                <Typography
                  sx={{
                    color:
                      '#9CA3AF',

                    fontSize:
                      '10px',

                    marginTop:
                      '2px',
                  }}
                >
                  {
                    card.description
                  }
                </Typography>
              </Box>
            </Paper>
          ),
        )}
      </Box>

      {selectedBalances.length >
      0 ? (
        <>
          <Typography
            sx={{
              color:
                '#111827',

              fontSize:
                '18px',

              fontWeight:
                800,

              marginBottom:
                '14px',
            }}
          >
            สิทธิ์แยกตามประเภทการลา
          </Typography>

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'repeat(2, minmax(0, 1fr))',

                lg:
                  'repeat(3, minmax(0, 1fr))',
              },

              gap:
                '18px',
            }}
          >
            {selectedBalances.map(
              (
                balance,
              ) => {
                const leaveTypeStyle =
                  getLeaveTypeStyle(
                    balance.leaveType,
                    theme,
                  );

                const balanceStatus =
                  getBalanceStatus(
                    balance,
                  );

                const usedPercentage =
                  balance.totalDays >
                  0
                    ? Math.min(
                        100,
                        (balance.usedDays /
                          balance.totalDays) *
                          100,
                      )
                    : 0;

                const pendingPercentage =
                  balance.totalDays >
                  0
                    ? Math.min(
                        100,
                        (balance.pendingDays /
                          balance.totalDays) *
                          100,
                      )
                    : 0;

                const committedPercentage =
                  Math.min(
                    100,
                    usedPercentage +
                      pendingPercentage,
                  );

                return (
                  <Paper
                    key={
                      balance.id
                    }
                    elevation={0}
                    sx={{
                      padding:
                        '20px',

                      backgroundColor:
                        '#FFFFFF',

                      border:
                        '1px solid #E5E7EB',

                      borderRadius:
                        '14px',
                    }}
                  >
                    <Box
                      sx={{
                        display:
                          'flex',

                        alignItems:
                          'flex-start',

                        justifyContent:
                          'space-between',

                        gap:
                          '12px',
                      }}
                    >
                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap:
                            '12px',

                          minWidth:
                            0,
                        }}
                      >
                        <Box
                          sx={{
                            width:
                              '46px',

                            height:
                              '46px',

                            flexShrink:
                              0,

                            display:
                              'flex',

                            alignItems:
                              'center',

                            justifyContent:
                              'center',

                            backgroundColor:
                              leaveTypeStyle.backgroundColor,

                            color:
                              leaveTypeStyle.color,

                            border:
                              `1px solid ${leaveTypeStyle.borderColor}`,

                            borderRadius:
                              '11px',

                            fontSize:
                              '17px',

                            fontWeight:
                              800,
                          }}
                        >
                          {
                            leaveTypeStyle.shortName
                          }
                        </Box>

                        <Box
                          sx={{
                            minWidth:
                              0,
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                '#111827',

                              fontSize:
                                '16px',

                              fontWeight:
                                800,

                              lineHeight:
                                1.4,
                            }}
                          >
                            {getLeaveTypeLabel(
                              balance.leaveType,
                            )}
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#9CA3AF',

                              fontSize:
                                '11px',

                              marginTop:
                                '2px',
                            }}
                          >
                            ปีสิทธิ์{' '}
                            {
                              balance.year
                            }
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        label={
                          balanceStatus.label
                        }
                        size="small"
                        sx={{
                          flexShrink:
                            0,

                          height:
                            '26px',

                          backgroundColor:
                            balanceStatus.backgroundColor,

                          color:
                            balanceStatus.color,

                          borderRadius:
                            '999px',

                          fontSize:
                            '10px',

                          fontWeight:
                            700,

                          '& .MuiChip-label':
                            {
                              padding:
                                '0 10px',
                            },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        padding:
                          '18px',

                        marginTop:
                          '18px',

                        backgroundColor:
                          leaveTypeStyle.backgroundColor,

                        border:
                          `1px solid ${leaveTypeStyle.borderColor}`,

                        borderRadius:
                          '12px',

                        textAlign:
                          'center',
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            leaveTypeStyle.color,

                          fontSize:
                            '34px',

                          fontWeight:
                            800,

                          lineHeight:
                            1,
                        }}
                      >
                        {formatDays(
                          balance.availableDays,
                        )}
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#374151',

                          fontSize:
                            '12px',

                          fontWeight:
                            700,

                          marginTop:
                            '7px',
                        }}
                      >
                        วันคงเหลือใช้ได้
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display:
                          'grid',

                        gridTemplateColumns:
                          'repeat(3, minmax(0, 1fr))',

                        gap:
                          '8px',

                        marginTop:
                          '16px',
                      }}
                    >
                      {[
                        {
                          label:
                            'สิทธิ์ทั้งหมด',

                          value:
                            balance.totalDays,

                          color:
                            '#111827',
                        },

                        {
                          label:
                            'ใช้ไปแล้ว',

                          value:
                            balance.usedDays,

                          color:
                            '#DC2626',
                        },

                        {
                          label:
                            'รออนุมัติ',

                          value:
                            balance.pendingDays,

                          color:
                            '#B45309',
                        },
                      ].map(
                        (
                          item,
                        ) => (
                          <Box
                            key={
                              item.label
                            }
                            sx={{
                              padding:
                                '11px 6px',

                              backgroundColor:
                                '#F8FAFC',

                              border:
                                '1px solid #F1F5F9',

                              borderRadius:
                                '9px',

                              textAlign:
                                'center',
                            }}
                          >
                            <Typography
                              sx={{
                                color:
                                  item.color,

                                fontSize:
                                  '17px',

                                fontWeight:
                                  800,
                              }}
                            >
                              {formatDays(
                                item.value,
                              )}
                            </Typography>

                            <Typography
                              sx={{
                                color:
                                  '#64748B',

                                fontSize:
                                  '9px',

                                fontWeight:
                                  600,

                                marginTop:
                                  '2px',

                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {
                                item.label
                              }
                            </Typography>
                          </Box>
                        ),
                      )}
                    </Box>

                    <Box
                      sx={{
                        marginTop:
                          '18px',
                      }}
                    >
                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          justifyContent:
                            'space-between',

                          gap:
                            '12px',

                          marginBottom:
                            '7px',
                        }}
                      >
                        <Typography
                          sx={{
                            color:
                              '#6B7280',

                            fontSize:
                              '11px',

                            fontWeight:
                              600,
                          }}
                        >
                          ใช้ไปและรออนุมัติ
                        </Typography>

                        <Typography
                          sx={{
                            color:
                              '#374151',

                            fontSize:
                              '11px',

                            fontWeight:
                              800,
                          }}
                        >
                          {committedPercentage.toFixed(
                            0,
                          )}
                          %
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={
                          committedPercentage
                        }
                        sx={{
                          height:
                            '8px',

                          backgroundColor:
                            '#E5E7EB',

                          borderRadius:
                            '999px',

                          '& .MuiLinearProgress-bar':
                            {
                              backgroundColor:
                                leaveTypeStyle.color,

                              borderRadius:
                                '999px',
                            },
                        }}
                      />

                      <Box
                        sx={{
                          display:
                            'flex',

                          flexWrap:
                            'wrap',

                          gap:
                            '12px',

                          marginTop:
                            '10px',
                        }}
                      >
                        <Box
                          sx={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap:
                              '5px',
                          }}
                        >
                          <Box
                            sx={{
                              width:
                                '7px',

                              height:
                                '7px',

                              backgroundColor:
                                '#DC2626',

                              borderRadius:
                                '50%',
                            }}
                          />

                          <Typography
                            sx={{
                              color:
                                '#6B7280',

                              fontSize:
                                '10px',
                            }}
                          >
                            ใช้แล้ว{' '}
                            {formatDays(
                              balance.usedDays,
                            )}{' '}
                            วัน
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap:
                              '5px',
                          }}
                        >
                          <Box
                            sx={{
                              width:
                                '7px',

                              height:
                                '7px',

                              backgroundColor:
                                '#F59E0B',

                              borderRadius:
                                '50%',
                            }}
                          />

                          <Typography
                            sx={{
                              color:
                                '#6B7280',

                              fontSize:
                                '10px',
                            }}
                          >
                            รออนุมัติ{' '}
                            {formatDays(
                              balance.pendingDays,
                            )}{' '}
                            วัน
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap:
                              '5px',
                          }}
                        >
                          <Box
                            sx={{
                              width:
                                '7px',

                              height:
                                '7px',

                              backgroundColor:
                                '#22C55E',

                              borderRadius:
                                '50%',
                            }}
                          />

                          <Typography
                            sx={{
                              color:
                                '#6B7280',

                              fontSize:
                                '10px',
                            }}
                          >
                            ใช้ได้{' '}
                            {formatDays(
                              balance.availableDays,
                            )}{' '}
                            วัน
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Typography
                      sx={{
                        color:
                          '#9CA3AF',

                        fontSize:
                          '10px',

                        marginTop:
                          '17px',
                      }}
                    >
                      อัปเดตล่าสุด:{' '}
                      {formatDateTime(
                        balance.updatedAt,
                      )}
                    </Typography>
                  </Paper>
                );
              },
            )}
          </Box>
        </>
      ) : (
        <Paper
          elevation={0}
          sx={{
            minHeight:
              '260px',

            padding:
              '36px 24px',

            display:
              'flex',

            flexDirection:
              'column',

            alignItems:
              'center',

            justifyContent:
              'center',

            backgroundColor:
              '#FFFFFF',

            border:
              '1px solid #E5E7EB',

            borderRadius:
              '14px',

            textAlign:
              'center',
          }}
        >
          <Box
            sx={{
              width:
                '56px',

              height:
                '56px',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              backgroundColor:
                theme?.soft ||
                '#EFF6FF',

              color:
                theme?.primary ||
                '#2563EB',

              borderRadius:
                '50%',

              fontSize:
                '20px',

              fontWeight:
                800,
            }}
          >
            0
          </Box>

          <Typography
            sx={{
              color:
                '#111827',

              fontSize:
                '17px',

              fontWeight:
                800,

              marginTop:
                '14px',
            }}
          >
            ไม่พบข้อมูลสิทธิ์วันลา
          </Typography>

          <Typography
            sx={{
              color:
                '#6B7280',

              fontSize:
                '13px',

              marginTop:
                '5px',
            }}
          >
            ยังไม่มีการกำหนดสิทธิ์วันลาสำหรับปีที่เลือก
          </Typography>
        </Paper>
      )}
    </LayoutComponent>
  );
}

export default RoleLeaveBalancePage;
