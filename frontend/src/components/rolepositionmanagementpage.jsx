import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getPositions, updatePositionStatus } from '../api/position-service.js';

function RolePositionManagementPage({
  LayoutComponent,
  activeMenu,
  theme,
}) {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionMessage, setActionMessage] = useState('');

  const loadPositions = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const rows = await getPositions();
      setPositions(rows.map((item) => ({ ...item, id: item.positionId, activeEmployeeCount: item.employeeCount })));
    } catch (error) { setLoadError(error.response?.data?.message || 'Unable to load positions.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadPositions(); }, [loadPositions]);

  const filteredPositions = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return positions.filter((position) => {
      const matchesSearch =
        !keyword ||
        position.positionName
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === 'All' ||
        position.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [positions, searchText, statusFilter]);

  const positionSummary = useMemo(
    () => ({
      total: positions.length,
      active: positions.filter(
        (position) => position.status === 'Active',
      ).length,
      inactive: positions.filter(
        (position) => position.status === 'Inactive',
      ).length,
      employees: positions.reduce(
        (total, position) =>
          total + position.employeeCount,
        0,
      ),
    }),
    [positions],
  );

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter('All');
    setActionMessage('');
  };

  const handleAddPosition = () => {
    navigate('/admin/position-management/add');
  };

  const handleEditPosition = (position) => {
    navigate(`/admin/position-management/${position.id}/edit`);
  };

  const handleStatusChange = async (selectedPosition) => {
    const nextStatus =
      selectedPosition.status === 'Active'
        ? 'Inactive'
        : 'Active';

    setUpdatingId(selectedPosition.id);
    try {
      await updatePositionStatus(selectedPosition.id, nextStatus);
      await loadPositions();
      setActionMessage(`${selectedPosition.positionName} was changed to ${nextStatus}.`);
    } catch (error) { setLoadError(error.response?.data?.message || 'Unable to update position status.'); }
    finally { setUpdatingId(null); }
  };

  const summaryCards = [
    {
      title: 'Total Positions',
      value: positionSummary.total,
      color: theme.primary,
      backgroundColor: theme.soft,
    },
    {
      title: 'Active Positions',
      value: positionSummary.active,
      color: '#059669',
      backgroundColor: '#ECFDF5',
    },
    {
      title: 'Inactive Positions',
      value: positionSummary.inactive,
      color: '#D97706',
      backgroundColor: '#FFFBEB',
    },
    {
      title: 'Assigned Employees',
      value: positionSummary.employees,
      color: '#2563EB',
      backgroundColor: '#EFF6FF',
    },
  ];

  return (
    <LayoutComponent activeMenu={activeMenu}>
      <Box
        sx={{
          display: 'flex',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          justifyContent: 'space-between',
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              color: '#111827',
              fontSize: {
                xs: '26px',
                sm: '30px',
              },
              fontWeight: 800,
            }}
          >
            Position Management
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '15px',
              marginTop: '6px',
            }}
          >
            Create, review and manage organization positions.
          </Typography>
        </Box>

        <Button
          type="button"
          variant="contained"
          onClick={handleAddPosition}
          sx={{
            minWidth: '155px',
            height: '44px',
            padding: '0 20px',
            backgroundColor: theme.primary,
            color: '#FFFFFF',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 'none',

            '&:hover': {
              backgroundColor: theme.dark,
              boxShadow: 'none',
            },
          }}
        >
          + Add Position
        </Button>
      </Box>

      {actionMessage && (
        <Alert
          severity="info"
          onClose={() => setActionMessage('')}
          sx={{
            marginBottom: '24px',
            borderRadius: '8px',
          }}
        >
          {actionMessage}
        </Alert>
      )}

      {(loading || loadError) && (
        <Alert severity={loadError ? 'error' : 'info'} action={loadError ? <Button onClick={loadPositions}>Retry</Button> : null} sx={{ marginBottom: '24px' }}>
          {loadError || 'Loading positions...'}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(4, minmax(0, 1fr))',
          },
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {summaryCards.map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              padding: '20px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
            }}
          >
            <Box
              sx={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: card.backgroundColor,
                color: card.color,
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 800,
              }}
            >
              {card.value}
            </Box>

            <Typography
              sx={{
                color: '#111827',
                fontSize: '15px',
                fontWeight: 800,
                marginTop: '14px',
              }}
            >
              {card.title}
            </Typography>
          </Paper>
        ))}
      </Box>

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
              fontWeight: 800,
            }}
          >
            Position List
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '14px',
              marginTop: '4px',
            }}
          >
            Showing {filteredPositions.length} of{' '}
            {positions.length} positions
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(320px, 2fr) minmax(190px, 1fr) auto',
              },
              gap: '16px',
              marginTop: '22px',
            }}
          >
            <TextField
              fullWidth
              label="Search Position"
              placeholder="Position name"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '48px',
                  borderRadius: '8px',

                  '&.Mui-focused fieldset': {
                    borderColor: theme.primary,
                  },
                },

                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme.primary,
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel id="position-status-filter-label">
                Status
              </InputLabel>

              <Select
                labelId="position-status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                sx={{
                  height: '48px',
                  borderRadius: '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor: theme.primary,
                    },
                }}
              >
                <MenuItem value="All">
                  All Statuses
                </MenuItem>

                <MenuItem value="Active">
                  Active
                </MenuItem>

                <MenuItem value="Inactive">
                  Inactive
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              type="button"
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                minWidth: '110px',
                height: '48px',
                padding: '0 18px',
                color: '#374151',
                borderColor: '#D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  backgroundColor: '#F9FAFB',
                  borderColor: '#9CA3AF',
                },
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {filteredPositions.length > 0 ? (
          <Box
            sx={{
              width: '100%',
              overflowX: 'auto',
            }}
          >
            <Table
              sx={{
                minWidth: '850px',
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: '#F9FAFB',
                  }}
                >
                  {[
                    'Position',
                    'Employees',
                    'Active Employees',
                    'Status',
                    'Updated',
                    'Actions',
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      align={
                        heading === 'Actions'
                          ? 'right'
                          : [
                                'Employees',
                                'Active Employees',
                              ].includes(heading)
                            ? 'center'
                            : 'left'
                      }
                      sx={{
                        color: '#6B7280',
                        fontSize: '12px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        whiteSpace: 'nowrap',
                        borderBottom:
                          '1px solid #E5E7EB',
                      }}
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredPositions.map((position) => {
                  const isActive =
                    position.status === 'Active';

                  return (
                    <TableRow
                      key={position.id}
                      hover
                      sx={{
                        '&:last-child td': {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: '#111827',
                          fontSize: '14px',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        {position.positionName}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          color: '#111827',
                          fontSize: '14px',
                          fontWeight: 700,
                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        {position.employeeCount}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          color: '#059669',
                          fontSize: '14px',
                          fontWeight: 700,
                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        {position.activeEmployeeCount}
                      </TableCell>

                      <TableCell
                        sx={{
                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        <Chip
                          label={position.status}
                          size="small"
                          sx={{
                            minWidth: '76px',
                            backgroundColor: isActive
                              ? '#DCFCE7'
                              : '#FEF3C7',
                            color: isActive
                              ? '#15803D'
                              : '#B45309',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          color: '#6B7280',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        {position.updatedAt}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          whiteSpace: 'nowrap',
                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '8px',
                          }}
                        >
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() =>
                              handleEditPosition(position)
                            }
                            sx={{
                              minWidth: '68px',
                              height: '36px',
                              padding: '0 12px',
                              color: theme.primary,
                              borderColor: theme.primary,
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'none',

                              '&:hover': {
                                backgroundColor: theme.soft,
                                borderColor: theme.dark,
                              },
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="outlined"
                            disabled={updatingId === position.id}
                            onClick={() =>
                              handleStatusChange(position)
                            }
                            sx={{
                              minWidth: '92px',
                              height: '36px',
                              padding: '0 12px',
                              color: isActive
                                ? '#B45309'
                                : '#15803D',
                              borderColor: isActive
                                ? '#F59E0B'
                                : '#22C55E',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'none',

                              '&:hover': {
                                backgroundColor: isActive
                                  ? '#FFFBEB'
                                  : '#F0FDF4',
                              },
                            }}
                          >
                            {isActive
                              ? 'Deactivate'
                              : 'Activate'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Box
            sx={{
              minHeight: '300px',
              padding: '40px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.soft,
                color: theme.primary,
                borderRadius: '50%',
                fontSize: '24px',
                fontWeight: 800,
              }}
            >
              0
            </Box>

            <Typography
              sx={{
                color: '#111827',
                fontSize: '18px',
                fontWeight: 800,
                marginTop: '16px',
              }}
            >
              No positions found
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '6px',
              }}
            >
              Try changing or clearing the selected filters.
            </Typography>

            <Button
              type="button"
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                height: '42px',
                marginTop: '20px',
                padding: '0 18px',
                color: theme.primary,
                borderColor: theme.primary,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  backgroundColor: theme.soft,
                  borderColor: theme.dark,
                },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>
    </LayoutComponent>
  );
}

export default RolePositionManagementPage;
