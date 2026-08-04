import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { useLocation } from 'react-router-dom';

import {
  getLeaveEntitlements,
  leaveEntitlementStorageKey,
} from '../utils/leaveentitlementstorage.js';

import {
  getLeaveRequests,
  leaveRequestStorageKey,
} from '../utils/leaverequeststorage.js';

const EMPTY_BALANCES = [];

const normalizeRole = (value) =>
  String(value || 'employee')
    .trim()
    .toLowerCase();

const normalizeStatus = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const formatDays = (value) => {
  const number = toNumber(value);

  return Number.isInteger(number)
    ? String(number)
    : number
        .toFixed(2)
        .replace(/\.?0+$/, '');
};

const getTimestamp = (value) => {
  const timestamp = new Date(
    value || 0,
  ).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
};

const getRequestYear = (request) => {
  const value =
    request?.startDate ||
    request?.submittedAt ||
    request?.createdAt ||
    '';

  const directYear = Number(
    String(value).slice(0, 4),
  );

  if (
    Number.isInteger(directYear) &&
    directYear > 0
  ) {
    return directYear;
  }

  const date = new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date.getFullYear();
};

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  ).format(date);
};

const normalizeFallbackBalances = (
  balances,
) =>
  balances.map((balance) => {
    const totalDays = Math.max(
      toNumber(balance.totalDays),
      0,
    );

    const usedDays = Math.max(
      toNumber(balance.usedDays),
      0,
    );

    const pendingDays = Math.max(
      toNumber(balance.pendingDays),
      0,
    );

    const remainingDays = Math.max(
      totalDays - usedDays,
      0,
    );

    const availableDays = Math.max(
      remainingDays - pendingDays,
      0,
    );

    return {
      ...balance,
      totalDays,
      usedDays,
      pendingDays,
      remainingDays,
      availableDays,
    };
  });

const buildLeaveBalances = ({
  role,
  fallbackBalances = EMPTY_BALANCES,
}) => {
  const normalizedRole =
    normalizeRole(role);

  /*
   * อ่านคำขอลาก่อน เพราะ initializeLeaveRequests()
   * จะย้ายยอดคำขอที่ Approved เข้า Entitlement Storage
   */
  const requests =
    getLeaveRequests({
      role: normalizedRole,
    });

  const entitlements =
    getLeaveEntitlements({
      role: normalizedRole,
    });

  if (
    entitlements.length === 0
  ) {
    return normalizeFallbackBalances(
      fallbackBalances,
    );
  }

  return entitlements.map(
    (entitlement) => {
      const leaveTypeId = Number(
        entitlement.leaveTypeId,
      );

      const year = Number(
        entitlement.year,
      );

      const relatedRequests =
        requests.filter(
          (request) =>
            Number(
              request.leaveTypeId,
            ) === leaveTypeId &&
            getRequestYear(
              request,
            ) === year,
        );

      const pendingDays =
        relatedRequests
          .filter(
            (request) =>
              normalizeStatus(
                request.status,
              ) === 'pending',
          )
          .reduce(
            (
              total,
              request,
            ) =>
              total +
              toNumber(
                request.leaveDays,
              ),
            0,
          );

      const totalDays =
        Math.max(
          toNumber(
            entitlement.totalDays,
          ),
          0,
        );

      const usedDays =
        Math.min(
          Math.max(
            toNumber(
              entitlement.usedDays,
            ),
            0,
          ),
          totalDays,
        );

      const remainingDays =
        Math.max(
          totalDays - usedDays,
          0,
        );

      const availableDays =
        Math.max(
          remainingDays -
            pendingDays,
          0,
        );

      const latestRequestTimestamp =
        relatedRequests.reduce(
          (
            latest,
            request,
          ) =>
            Math.max(
              latest,

              getTimestamp(
                request.updatedAt ||
                  request.approvedAt ||
                  request.submittedAt ||
                  request.createdAt,
              ),
            ),
          0,
        );

      const latestTimestamp =
        Math.max(
          getTimestamp(
            entitlement.updatedAt,
          ),

          latestRequestTimestamp,
        );

      return {
        id:
          entitlement.id ||
          `${normalizedRole}-${leaveTypeId}-${year}`,

        leaveTypeId,

        leaveType:
          entitlement.leaveType ||
          'Leave',

        year,

        totalDays,

        usedDays,

        pendingDays,

        remainingDays,

        availableDays,

        updatedAt:
          latestTimestamp > 0
            ? formatDateTime(
                latestTimestamp,
              )
            : '-',
      };
    },
  );
};

const getLeaveTypeStyle = (
  leaveType,
) => {
  const styles = {
    'Annual Leave': {
      shortName: 'A',
      backgroundColor: '#EFF6FF',
      color: '#2563EB',
      borderColor: '#BFDBFE',
    },

    'Sick Leave': {
      shortName: 'S',
      backgroundColor: '#FEF2F2',
      color: '#DC2626',
      borderColor: '#FECACA',
    },

    'Personal Leave': {
      shortName: 'P',
      backgroundColor: '#F5F3FF',
      color: '#7C3AED',
      borderColor: '#DDD6FE',
    },
  };

  return (
    styles[leaveType] || {
      shortName:
        String(
          leaveType || 'Leave',
        )
          .trim()
          .charAt(0)
          .toUpperCase() || 'L',

      backgroundColor: '#F3F4F6',
      color: '#4B5563',
      borderColor: '#D1D5DB',
    }
  );
};

const getBalanceStatus = (
  balance,
) => {
  if (
    balance.availableDays <= 0
  ) {
    return {
      label: 'No Balance',
      backgroundColor: '#FEE2E2',
      color: '#B91C1C',
    };
  }

  const percentage =
    balance.totalDays > 0
      ? (balance.availableDays /
          balance.totalDays) *
        100
      : 0;

  if (percentage <= 25) {
    return {
      label: 'Low Balance',
      backgroundColor: '#FEF3C7',
      color: '#B45309',
    };
  }

  return {
    label: 'Available',
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  };
};

function SummaryCard({
  card,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        padding: '20px',

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
          width: '48px',

          height: '48px',

          display: 'flex',

          alignItems:
            'center',

          justifyContent:
            'center',

          backgroundColor:
            card.backgroundColor,

          color:
            card.color,

          borderRadius:
            '12px',

          fontSize:
            '19px',

          fontWeight: 800,
        }}
      >
        {formatDays(
          card.value,
        )}
      </Box>

      <Typography
        sx={{
          color:
            '#111827',

          fontSize:
            '15px',

          fontWeight:
            800,

          marginTop:
            '14px',
        }}
      >
        {card.title}
      </Typography>

      <Typography
        sx={{
          color:
            '#9CA3AF',

          fontSize:
            '12px',

          lineHeight:
            1.6,

          marginTop:
            '4px',
        }}
      >
        {card.description}
      </Typography>
    </Paper>
  );
}

function BalanceCard({
  balance,
}) {
  const typeStyle =
    getLeaveTypeStyle(
      balance.leaveType,
    );

  const status =
    getBalanceStatus(
      balance,
    );

  const committedPercentage =
    balance.totalDays > 0
      ? Math.min(
          100,

          ((balance.usedDays +
            balance.pendingDays) /
            balance.totalDays) *
            100,
        )
      : 0;

  const metrics = [
    {
      label: 'Total',
      value:
        balance.totalDays,
      color: '#111827',
    },
    {
      label: 'Used',
      value:
        balance.usedDays,
      color: '#DC2626',
    },
    {
      label: 'Pending',
      value:
        balance.pendingDays,
      color: '#B45309',
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        padding:
          '24px',

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
          display: 'flex',

          alignItems:
            'flex-start',

          justifyContent:
            'space-between',

          gap: '14px',
        }}
      >
        <Box
          sx={{
            display: 'flex',

            alignItems:
              'center',

            gap: '14px',
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
                typeStyle
                  .backgroundColor,

              color:
                typeStyle
                  .color,

              border: `1px solid ${typeStyle.borderColor}`,

              borderRadius:
                '12px',

              fontSize:
                '19px',

              fontWeight:
                800,
            }}
          >
            {typeStyle.shortName}
          </Box>

          <Box>
            <Typography
              sx={{
                color:
                  '#111827',

                fontSize:
                  '17px',

                fontWeight:
                  800,
              }}
            >
              {balance.leaveType}
            </Typography>

            <Typography
              sx={{
                color:
                  '#9CA3AF',

                fontSize:
                  '12px',

                marginTop:
                  '3px',
              }}
            >
              Entitlement year{' '}
              {balance.year}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={
            status.label
          }
          size="small"
          sx={{
            flexShrink: 0,

            backgroundColor:
              status.backgroundColor,

            color:
              status.color,

            borderRadius:
              '999px',

            fontSize:
              '10px',

            fontWeight:
              700,
          }}
        />
      </Box>

      <Box
        sx={{
          padding:
            '20px',

          marginTop:
            '22px',

          backgroundColor:
            typeStyle
              .backgroundColor,

          border: `1px solid ${typeStyle.borderColor}`,

          borderRadius:
            '12px',

          textAlign:
            'center',
        }}
      >
        <Typography
          sx={{
            color:
              typeStyle.color,

            fontSize:
              '36px',

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
              '#4B5563',

            fontSize:
              '12px',

            fontWeight:
              700,

            marginTop:
              '8px',
          }}
        >
          Available Days
        </Typography>
      </Box>

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns:
            'repeat(3, minmax(0, 1fr))',

          gap:
            '10px',

          marginTop:
            '20px',
        }}
      >
        {metrics.map(
          (item) => (
            <Box
              key={
                item.label
              }
              sx={{
                padding:
                  '12px 8px',

                backgroundColor:
                  '#F9FAFB',

                borderRadius:
                  '8px',

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
                    '#9CA3AF',

                  fontSize:
                    '10px',

                  fontWeight:
                    700,

                  textTransform:
                    'uppercase',

                  marginTop:
                    '3px',
                }}
              >
                {item.label}
              </Typography>
            </Box>
          ),
        )}
      </Box>

      <Box
        sx={{
          marginTop:
            '22px',
        }}
      >
        <Box
          sx={{
            display:
              'flex',

            justifyContent:
              'space-between',

            gap:
              '12px',

            marginBottom:
              '8px',
          }}
        >
          <Typography
            sx={{
              color:
                '#6B7280',

              fontSize:
                '11px',

              fontWeight:
                700,
            }}
          >
            Used and Pending
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
              '9px',

            backgroundColor:
              '#E5E7EB',

            borderRadius:
              '999px',

            '& .MuiLinearProgress-bar':
              {
                backgroundColor:
                  typeStyle
                    .color,

                borderRadius:
                  '999px',
              },
          }}
        />
      </Box>

      <Typography
        sx={{
          color:
            '#9CA3AF',

          fontSize:
            '10px',

          lineHeight:
            1.5,

          marginTop:
            '20px',
        }}
      >
        Last updated:{' '}
        {balance.updatedAt}
      </Typography>
    </Paper>
  );
}

function BalanceTable({
  balances,
  selectedYear,
}) {
  const headings = [
    'Leave Type',
    'Total Days',
    'Used Days',
    'Pending Days',
    'Remaining Days',
    'Available Days',
    'Status',
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor:
          '#FFFFFF',

        border:
          '1px solid #E5E7EB',

        borderRadius:
          '12px',

        overflow:
          'hidden',
      }}
    >
      <Box
        sx={{
          padding: {
            xs: '20px',
            sm: '24px',
          },

          borderBottom:
            '1px solid #E5E7EB',
        }}
      >
        <Typography
          sx={{
            color:
              '#111827',

            fontSize:
              '18px',

            fontWeight:
              800,
          }}
        >
          Balance Detail
        </Typography>

        <Typography
          sx={{
            color:
              '#6B7280',

            fontSize:
              '14px',

            marginTop:
              '4px',
          }}
        >
          Detailed leave entitlement for{' '}
          {selectedYear}.
        </Typography>
      </Box>

      <Box
        sx={{
          width:
            '100%',

          overflowX:
            'auto',
        }}
      >
        <Table
          sx={{
            minWidth:
              '900px',
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor:
                  '#F9FAFB',
              }}
            >
              {headings.map(
                (heading) => (
                  <TableCell
                    key={
                      heading
                    }
                    align={
                      heading ===
                        'Leave Type' ||
                      heading ===
                        'Status'
                        ? 'left'
                        : 'center'
                    }
                    sx={{
                      color:
                        '#6B7280',

                      fontSize:
                        '12px',

                      fontWeight:
                        800,

                      textTransform:
                        'uppercase',

                      letterSpacing:
                        '0.4px',

                      whiteSpace:
                        'nowrap',
                    }}
                  >
                    {heading}
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {balances.map(
              (balance) => {
                const status =
                  getBalanceStatus(
                    balance,
                  );

                const numericCells =
                  [
                    {
                      value:
                        balance.totalDays,
                      color:
                        '#111827',
                    },
                    {
                      value:
                        balance.usedDays,
                      color:
                        '#DC2626',
                    },
                    {
                      value:
                        balance.pendingDays,
                      color:
                        '#B45309',
                    },
                    {
                      value:
                        balance.remainingDays,
                      color:
                        '#374151',
                    },
                    {
                      value:
                        balance.availableDays,
                      color:
                        '#059669',
                    },
                  ];

                return (
                  <TableRow
                    key={
                      balance.id
                    }
                    hover
                  >
                    <TableCell
                      sx={{
                        color:
                          '#111827',

                        fontSize:
                          '14px',

                        fontWeight:
                          800,
                      }}
                    >
                      {balance.leaveType}
                    </TableCell>

                    {numericCells.map(
                      (
                        item,
                        index,
                      ) => (
                        <TableCell
                          key={`${balance.id}-${index}`}
                          align="center"
                          sx={{
                            color:
                              item.color,

                            fontSize:
                              '14px',

                            fontWeight:
                              700,
                          }}
                        >
                          {formatDays(
                            item.value,
                          )}
                        </TableCell>
                      ),
                    )}

                    <TableCell>
                      <Chip
                        label={
                          status.label
                        }
                        size="small"
                        sx={{
                          minWidth:
                            '92px',

                          backgroundColor:
                            status.backgroundColor,

                          color:
                            status.color,

                          borderRadius:
                            '999px',

                          fontSize:
                            '11px',

                          fontWeight:
                            700,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              },
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}

function EmptyBalance({
  theme,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight:
          '300px',

        padding:
          '40px 24px',

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
          '12px',

        textAlign:
          'center',
      }}
    >
      <Box
        sx={{
          width:
            '64px',

          height:
            '64px',

          display:
            'flex',

          alignItems:
            'center',

          justifyContent:
            'center',

          backgroundColor:
            theme.soft,

          color:
            theme.primary,

          borderRadius:
            '50%',

          fontSize:
            '24px',

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
            '18px',

          fontWeight:
            800,

          marginTop:
            '16px',
        }}
      >
        No leave balance found
      </Typography>

      <Typography
        sx={{
          color:
            '#6B7280',

          fontSize:
            '14px',

          lineHeight:
            1.7,

          marginTop:
            '6px',
        }}
      >
        No leave entitlement has been assigned for
        the selected year.
      </Typography>
    </Paper>
  );
}

function RoleLeaveBalancePage({
  LayoutComponent,
  theme,
  initialBalances = EMPTY_BALANCES,
}) {
  const location =
    useLocation();

  const pathRole =
    location.pathname
      .split('/')[1];

  const currentRole = [
    'employee',
    'supervisor',
    'hr',
    'admin',
  ].includes(pathRole)
    ? pathRole
    : 'employee';

  const createBalances =
    useCallback(
      () =>
        buildLeaveBalances({
          role:
            currentRole,

          fallbackBalances:
            initialBalances,
        }),
      [
        currentRole,
        initialBalances,
      ],
    );

  const [
    leaveBalances,
    setLeaveBalances,
  ] = useState(
    createBalances,
  );

  const [
    selectedYear,
    setSelectedYear,
  ] = useState(() => {
    const years =
      createBalances()
        .map(
          (balance) =>
            Number(
              balance.year,
            ),
        )
        .filter(
          Number.isInteger,
        )
        .sort(
          (
            first,
            second,
          ) =>
            second -
            first,
        );

    return String(
      years[0] ||
        new Date()
          .getFullYear(),
    );
  });

  const loadBalanceData =
    useCallback(() => {
      setLeaveBalances(
        createBalances(),
      );
    }, [createBalances]);

  useEffect(() => {
    loadBalanceData();

    const handleStorageChange = (
      event,
    ) => {
      if (
        !event.key ||
        event.key ===
          leaveEntitlementStorageKey ||
        event.key ===
          leaveRequestStorageKey
      ) {
        loadBalanceData();
      }
    };

    window.addEventListener(
      'storage',
      handleStorageChange,
    );

    window.addEventListener(
      'focus',
      loadBalanceData,
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange,
      );

      window.removeEventListener(
        'focus',
        loadBalanceData,
      );
    };
  }, [loadBalanceData]);

  const availableYears =
    useMemo(() => {
      const years =
        leaveBalances
          .map(
            (balance) =>
              Number(
                balance.year,
              ),
          )
          .filter(
            Number.isInteger,
          );

      return [
        ...new Set(years),
      ].sort(
        (
          first,
          second,
        ) =>
          second -
          first,
      );
    }, [leaveBalances]);

  useEffect(() => {
    if (
      availableYears.length >
        0 &&
      !availableYears.some(
        (year) =>
          String(year) ===
          selectedYear,
      )
    ) {
      setSelectedYear(
        String(
          availableYears[0],
        ),
      );
    }
  }, [
    availableYears,
    selectedYear,
  ]);

  const selectedBalances =
    useMemo(
      () =>
        leaveBalances.filter(
          (balance) =>
            String(
              balance.year,
            ) ===
            selectedYear,
        ),
      [
        leaveBalances,
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
              toNumber(
                balance.totalDays,
              ),

            usedDays:
              result.usedDays +
              toNumber(
                balance.usedDays,
              ),

            pendingDays:
              result.pendingDays +
              toNumber(
                balance.pendingDays,
              ),

            availableDays:
              result.availableDays +
              toNumber(
                balance.availableDays,
              ),
          }),
          {
            totalDays: 0,
            usedDays: 0,
            pendingDays: 0,
            availableDays: 0,
          },
        ),
      [selectedBalances],
    );

  const summaryCards = [
    {
      title:
        'Total Entitlement',

      value:
        summary.totalDays,

      description:
        'Total leave days granted',

      backgroundColor:
        theme.soft,

      color:
        theme.primary,
    },
    {
      title:
        'Used Days',

      value:
        summary.usedDays,

      description:
        'Days from approved requests',

      backgroundColor:
        '#FEF2F2',

      color:
        '#DC2626',
    },
    {
      title:
        'Pending Days',

      value:
        summary.pendingDays,

      description:
        'Days awaiting approval',

      backgroundColor:
        '#FEF3C7',

      color:
        '#B45309',
    },
    {
      title:
        'Available Days',

      value:
        summary.availableDays,

      description:
        'Days currently available',

      backgroundColor:
        '#ECFDF5',

      color:
        '#059669',
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
            '18px',

          marginBottom:
            '28px',
        }}
      >
        <Box>
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
            Leave Balance
          </Typography>

          <Typography
            sx={{
              color:
                '#6B7280',

              fontSize:
                '15px',

              marginTop:
                '6px',
            }}
          >
            Review your leave entitlement, usage and
            available balance.
          </Typography>
        </Box>

        <FormControl
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
            Entitlement Year
          </InputLabel>

          <Select
            labelId="leave-balance-year-label"
            value={
              selectedYear
            }
            label="Entitlement Year"
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
                '48px',

              backgroundColor:
                '#FFFFFF',

              borderRadius:
                '8px',

              '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                {
                  borderColor:
                    theme.primary,
                },
            }}
          >
            {availableYears.map(
              (year) => (
                <MenuItem
                  key={
                    year
                  }
                  value={
                    String(
                      year,
                    )
                  }
                >
                  {year}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            sm:
              'repeat(2, minmax(0, 1fr))',

            xl:
              'repeat(4, minmax(0, 1fr))',
          },

          gap:
            '20px',

          marginBottom:
            '24px',
        }}
      >
        {summaryCards.map(
          (card) => (
            <SummaryCard
              key={
                card.title
              }
              card={
                card
              }
            />
          ),
        )}
      </Box>

      {selectedBalances.length >
      0 ? (
        <>
          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns:
                {
                  xs:
                    '1fr',

                  lg:
                    'repeat(2, minmax(0, 1fr))',

                  xl:
                    'repeat(3, minmax(0, 1fr))',
                },

              gap:
                '24px',

              marginBottom:
                '24px',
            }}
          >
            {selectedBalances.map(
              (balance) => (
                <BalanceCard
                  key={
                    balance.id
                  }
                  balance={
                    balance
                  }
                />
              ),
            )}
          </Box>

          <BalanceTable
            balances={
              selectedBalances
            }
            selectedYear={
              selectedYear
            }
          />
        </>
      ) : (
        <EmptyBalance
          theme={
            theme
          }
        />
      )}

      <Paper
        elevation={0}
        sx={{
          padding: {
            xs:
              '20px',

            sm:
              '24px',
          },

          marginTop:
            '24px',

          backgroundColor:
            theme.soft,

          border: `1px solid ${
            theme.border ||
            '#E5E7EB'
          }`,

          borderRadius:
            '12px',
        }}
      >
        <Typography
          sx={{
            color:
              theme.dark,

            fontSize:
              '15px',

            fontWeight:
              800,
          }}
        >
          How Your Leave Balance Is Calculated
        </Typography>

        <Typography
          sx={{
            color:
              theme.text ||
              '#4B5563',

            fontSize:
              '13px',

            lineHeight:
              1.8,

            marginTop:
              '8px',
          }}
        >
          Remaining days equal total entitlement minus
          approved leave. Available days also deduct
          Pending requests, so the same entitlement cannot
          be used by multiple requests.
        </Typography>
      </Paper>
    </LayoutComponent>
  );
}

export default RoleLeaveBalancePage;