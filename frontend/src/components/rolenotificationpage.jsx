import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

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
  TextField,
  Typography,
} from '@mui/material';

import { useLocation } from 'react-router-dom';

import {
  getNotifications,
  initializeNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  notificationStorageKey,
  saveNotifications,
} from '../utils/notificationstorage.js';

const getCategoryFromType = (type) => {
  const normalizedType = String(
    type || '',
  )
    .trim()
    .toLowerCase();

  const categoryTypes = {
    'category-leave-request':
      'Leave Request',

    'category-approval':
      'Approval',

    'category-employee':
      'Employee',

    'category-entitlement':
      'Entitlement',

    'category-system':
      'System',

    'category-account':
      'Account',
  };

  if (
    categoryTypes[normalizedType]
  ) {
    return categoryTypes[
      normalizedType
    ];
  }

  if (
    normalizedType ===
    'leave-submitted'
  ) {
    return 'Approval';
  }

  if (
    normalizedType ===
      'leave-approved' ||
    normalizedType ===
      'leave-rejected' ||
    normalizedType ===
      'leave-cancelled'
  ) {
    return 'Leave Request';
  }

  return 'System';
};

const getTypeFromCategory = (
  category,
) => {
  const categoryTypes = {
    'Leave Request':
      'category-leave-request',

    Approval:
      'category-approval',

    Employee:
      'category-employee',

    Entitlement:
      'category-entitlement',

    System:
      'category-system',

    Account:
      'category-account',
  };

  return (
    categoryTypes[category] ||
    'category-system'
  );
};

function RoleNotificationPage({
  LayoutComponent,

  pageTitle = 'Notifications',

  pageDescription =
    'Review notifications and important updates.',

  initialNotifications = [],

  theme,
}) {
  const location = useLocation();

  const pathRole =
    location.pathname.split('/')[1];

  const currentRole = [
    'employee',
    'supervisor',
    'hr',
    'admin',
  ].includes(pathRole)
    ? pathRole
    : 'employee';

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('All');

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState('All');

  const [
    actionMessage,
    setActionMessage,
  ] = useState('');

  const normalizeForPage =
    useCallback(
      (notification) => ({
        ...notification,

        category:
          notification.category ||
          getCategoryFromType(
            notification.type,
          ),
      }),
      [],
    );

  const loadNotifications = useCallback(() => {
    const storedNotifications =
      getNotifications({
        role: currentRole,
      }).map(normalizeForPage);

    setNotifications(
      storedNotifications,
    );
  }, [currentRole, normalizeForPage]);

  const seedInitialNotifications =
    useCallback(() => {
      const storedRoleNotifications =
        getNotifications({
          role: currentRole,
        });

      if (
        storedRoleNotifications.length >
          0 ||
        !Array.isArray(
          initialNotifications,
        ) ||
        initialNotifications.length ===
          0
      ) {
        return;
      }

      const allNotifications =
        initializeNotifications();

      const highestId =
        allNotifications.length > 0
          ? Math.max(
              ...allNotifications.map(
                (notification) =>
                  Number(
                    notification.id,
                  ) || 0,
              ),
            )
          : 0;

      const seededNotifications =
        initialNotifications.map(
          (
            notification,
            index,
          ) => ({
            id:
              highestId +
              index +
              1,

            role: currentRole,

            title:
              notification.title ||
              'Notification',

            message:
              notification.message ||
              '',

            type:
              notification.type ||
              getTypeFromCategory(
                notification.category,
              ),

            referenceId:
              notification.referenceId ??
              null,

            path:
              notification.path ||
              null,

            isRead: Boolean(
              notification.isRead,
            ),

            createdAt:
              notification.createdAt ||
              new Date().toISOString(),
          }),
        );

      saveNotifications([
        ...allNotifications,
        ...seededNotifications,
      ]);
    }, [currentRole, initialNotifications]);

  useEffect(() => {
    seedInitialNotifications();
    loadNotifications();

    setSearchText('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setActionMessage('');

    const handleStorageChange = (
      event,
    ) => {
      if (
        !event.key ||
        event.key ===
          notificationStorageKey
      ) {
        loadNotifications();
      }
    };

    const handleWindowFocus = () => {
      loadNotifications();
    };

    window.addEventListener(
      'storage',
      handleStorageChange,
    );

    window.addEventListener(
      'focus',
      handleWindowFocus,
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange,
      );

      window.removeEventListener(
        'focus',
        handleWindowFocus,
      );
    };
  }, [
    loadNotifications,
    seedInitialNotifications,
  ]);

  const categories = useMemo(
    () => {
      const availableCategories =
        notifications
          .map(
            (notification) =>
              notification.category,
          )
          .filter(Boolean);

      return [
        'All',

        ...new Set(
          availableCategories,
        ),
      ];
    },
    [notifications],
  );

  const filteredNotifications =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return notifications
        .filter(
          (notification) => {
            const title = String(
              notification.title || '',
            ).toLowerCase();

            const notificationMessage =
              String(
                notification.message ||
                  '',
              ).toLowerCase();

            const matchesSearch =
              !keyword ||
              title.includes(
                keyword,
              ) ||
              notificationMessage.includes(
                keyword,
              );

            const matchesStatus =
              statusFilter === 'All' ||
              (statusFilter ===
                'Unread' &&
                !notification.isRead) ||
              (statusFilter ===
                'Read' &&
                notification.isRead);

            const matchesCategory =
              categoryFilter ===
                'All' ||
              notification.category ===
                categoryFilter;

            return (
              matchesSearch &&
              matchesStatus &&
              matchesCategory
            );
          },
        )
        .sort(
          (
            firstNotification,
            secondNotification,
          ) =>
            new Date(
              secondNotification.createdAt,
            ) -
            new Date(
              firstNotification.createdAt,
            ),
        );
    }, [
      notifications,
      searchText,
      statusFilter,
      categoryFilter,
    ]);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead,
    ).length;

  const readCount =
    notifications.filter(
      (notification) =>
        notification.isRead,
    ).length;

  const todayDate = new Date();

  const todayCount =
    notifications.filter(
      (notification) => {
        const notificationDate =
          new Date(
            notification.createdAt,
          );

        if (
          Number.isNaN(
            notificationDate.getTime(),
          )
        ) {
          return false;
        }

        return (
          notificationDate.getFullYear() ===
            todayDate.getFullYear() &&
          notificationDate.getMonth() ===
            todayDate.getMonth() &&
          notificationDate.getDate() ===
            todayDate.getDate()
        );
      },
    ).length;

  const formatDateTime = (
    dateTimeString,
  ) => {
    if (!dateTimeString) {
      return '-';
    }

    const date =
      new Date(dateTimeString);

    if (
      Number.isNaN(date.getTime())
    ) {
      return '-';
    }

    return date.toLocaleString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  const getCategoryStyle = (
    category,
  ) => {
    const categoryStyles = {
      'Leave Request': {
        backgroundColor:
          '#EFF6FF',

        color: '#1D4ED8',
      },

      Approval: {
        backgroundColor:
          '#F5F3FF',

        color: '#6D28D9',
      },

      Employee: {
        backgroundColor:
          '#ECFDF5',

        color: '#047857',
      },

      Entitlement: {
        backgroundColor:
          '#FFF7ED',

        color: '#C2410C',
      },

      System: {
        backgroundColor:
          '#FEF3C7',

        color: '#B45309',
      },

      Account: {
        backgroundColor:
          '#F3F4F6',

        color: '#4B5563',
      },
    };

    return (
      categoryStyles[category] || {
        backgroundColor:
          theme.soft,

        color:
          theme.dark ||
          theme.primary,
      }
    );
  };

  const handleMarkAsRead = (
    notificationId,
  ) => {
    const selectedNotification =
      notifications.find(
        (notification) =>
          Number(
            notification.id,
          ) ===
          Number(
            notificationId,
          ),
      );

    if (!selectedNotification) {
      return;
    }

    const updatedNotification =
      markNotificationAsRead(
        notificationId,
      );

    if (!updatedNotification) {
      setActionMessage(
        'The notification could not be marked as read.',
      );

      return;
    }

    loadNotifications();

    setActionMessage(
      `"${selectedNotification.title}" was marked as read.`,
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleMarkAllAsRead =
    () => {
      if (unreadCount === 0) {
        setActionMessage(
          'All notifications are already marked as read.',
        );

        return;
      }

      const updatedCount =
        markAllNotificationsAsRead(
          currentRole,
        );

      loadNotifications();

      setActionMessage(
        `${updatedCount} notification(s) were marked as read.`,
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setActionMessage('');
  };

  return (
    <LayoutComponent activeMenu="Notification">
      <Box
        sx={{
          display: 'flex',

          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },

          justifyContent:
            'space-between',

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
            {pageTitle}
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',

              fontSize: '15px',

              marginTop: '6px',
            }}
          >
            {pageDescription}
          </Typography>
        </Box>

        <Button
          type="button"
          variant="contained"
          onClick={
            handleMarkAllAsRead
          }
          disabled={
            unreadCount === 0
          }
          sx={{
            minWidth: '160px',

            height: '44px',

            padding: '0 20px',

            backgroundColor:
              theme.primary,

            color: '#FFFFFF',

            borderRadius: '8px',

            fontSize: '14px',

            fontWeight: 700,

            textTransform: 'none',

            boxShadow: 'none',

            '&:hover': {
              backgroundColor:
                theme.dark,

              boxShadow: 'none',
            },

            '&.Mui-disabled': {
              backgroundColor:
                '#D1D5DB',

              color: '#6B7280',
            },
          }}
        >
          Mark All as Read
        </Button>
      </Box>

      {actionMessage && (
        <Alert
          severity="success"
          onClose={() =>
            setActionMessage('')
          }
          sx={{
            marginBottom: '24px',

            borderRadius: '8px',
          }}
        >
          {actionMessage}
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
        {[
          {
            title:
              'Total Notifications',

            value:
              notifications.length,

            color: '#2563EB',
          },

          {
            title:
              'Unread Notifications',

            value: unreadCount,

            color: '#DC2626',
          },

          {
            title:
              'Read Notifications',

            value: readCount,

            color: '#059669',
          },

          {
            title:
              'Received Today',

            value: todayCount,

            color: '#7C3AED',
          },
        ].map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              padding: '20px',

              backgroundColor:
                '#FFFFFF',

              border:
                '1px solid #E5E7EB',

              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                color: '#6B7280',

                fontSize: '14px',

                fontWeight: 600,
              }}
            >
              {card.title}
            </Typography>

            <Typography
              sx={{
                color: card.color,

                fontSize: '30px',

                fontWeight: 800,

                marginTop: '8px',
              }}
            >
              {card.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',

          border:
            '1px solid #E5E7EB',

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

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          <Typography
            sx={{
              color: '#111827',

              fontSize: '18px',

              fontWeight: 800,
            }}
          >
            Notification List
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',

              fontSize: '14px',

              marginTop: '4px',
            }}
          >
            Showing{' '}
            {
              filteredNotifications.length
            }{' '}
            of {notifications.length}{' '}
            notifications
          </Typography>

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',

                lg: 'minmax(280px, 2fr) minmax(180px, 1fr) minmax(190px, 1fr) auto',
              },

              gap: '16px',

              marginTop: '22px',
            }}
          >
            <TextField
              fullWidth
              label="Search Notification"
              placeholder="Notification title or message"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value,
                )
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    height: '48px',

                    borderRadius:
                      '8px',

                    '&.Mui-focused fieldset':
                      {
                        borderColor:
                          theme.primary,
                      },
                  },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color:
                      theme.primary,
                  },
              }}
            />

            <FormControl fullWidth>
              <InputLabel id="notification-status-label">
                Status
              </InputLabel>

              <Select
                labelId="notification-status-label"
                value={statusFilter}
                label="Status"
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',

                  borderRadius: '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        theme.primary,
                    },
                }}
              >
                <MenuItem value="All">
                  All Statuses
                </MenuItem>

                <MenuItem value="Unread">
                  Unread
                </MenuItem>

                <MenuItem value="Read">
                  Read
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="notification-category-label">
                Category
              </InputLabel>

              <Select
                labelId="notification-category-label"
                value={
                  categoryFilter
                }
                label="Category"
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',

                  borderRadius: '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        theme.primary,
                    },
                }}
              >
                {categories.map(
                  (category) => (
                    <MenuItem
                      key={category}
                      value={category}
                    >
                      {category ===
                      'All'
                        ? 'All Categories'
                        : category}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                minWidth: '110px',

                height: '48px',

                padding: '0 18px',

                color: '#374151',

                borderColor:
                  '#D1D5DB',

                borderRadius: '8px',

                fontSize: '14px',

                fontWeight: 700,

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    '#F9FAFB',

                  borderColor:
                    '#9CA3AF',
                },
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {filteredNotifications.length >
        0 ? (
          <Box>
            {filteredNotifications.map(
              (
                notification,
                index,
              ) => {
                const categoryStyle =
                  getCategoryStyle(
                    notification.category,
                  );

                const categorySymbol =
                  String(
                    notification.category ||
                      'N',
                  )
                    .charAt(0)
                    .toUpperCase();

                return (
                  <Box
                    key={
                      notification.id
                    }
                    sx={{
                      display: 'flex',

                      alignItems: {
                        xs: 'flex-start',
                        md: 'center',
                      },

                      flexDirection: {
                        xs: 'column',
                        md: 'row',
                      },

                      gap: '18px',

                      padding: {
                        xs: '20px',
                        sm: '22px 24px',
                      },

                      backgroundColor:
                        notification.isRead
                          ? '#FFFFFF'
                          : theme.unreadBackground ||
                            theme.soft,

                      borderLeft:
                        notification.isRead
                          ? '4px solid transparent'
                          : `4px solid ${theme.primary}`,

                      borderBottom:
                        index ===
                        filteredNotifications.length -
                          1
                          ? 'none'
                          : '1px solid #E5E7EB',

                      '&:hover': {
                        backgroundColor:
                          notification.isRead
                            ? '#F9FAFB'
                            : theme.soft,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: '46px',

                        height: '46px',

                        flexShrink: 0,

                        display: 'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'center',

                        backgroundColor:
                          categoryStyle.backgroundColor,

                        color:
                          categoryStyle.color,

                        borderRadius:
                          '12px',

                        fontSize: '16px',

                        fontWeight: 800,
                      }}
                    >
                      {categorySymbol}
                    </Box>

                    <Box
                      sx={{
                        minWidth: 0,

                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',

                          alignItems:
                            'center',

                          flexWrap: 'wrap',

                          gap: '10px',
                        }}
                      >
                        <Typography
                          sx={{
                            color:
                              '#111827',

                            fontSize:
                              '15px',

                            fontWeight:
                              notification.isRead
                                ? 700
                                : 800,
                          }}
                        >
                          {
                            notification.title
                          }
                        </Typography>

                        {!notification.isRead && (
                          <Box
                            sx={{
                              width:
                                '8px',

                              height:
                                '8px',

                              backgroundColor:
                                theme.primary,

                              borderRadius:
                                '50%',
                            }}
                          />
                        )}

                        <Chip
                          label={
                            notification.category
                          }
                          size="small"
                          sx={{
                            backgroundColor:
                              categoryStyle.backgroundColor,

                            color:
                              categoryStyle.color,

                            borderRadius:
                              '999px',

                            fontSize:
                              '11px',

                            fontWeight:
                              700,
                          }}
                        />
                      </Box>

                      <Typography
                        sx={{
                          color: '#4B5563',

                          fontSize: '14px',

                          lineHeight: 1.7,

                          marginTop: '7px',
                        }}
                      >
                        {
                          notification.message
                        }
                      </Typography>

                      <Typography
                        sx={{
                          color: '#9CA3AF',

                          fontSize: '12px',

                          marginTop: '8px',
                        }}
                      >
                        {formatDateTime(
                          notification.createdAt,
                        )}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flexShrink: 0,
                      }}
                    >
                      {notification.isRead ? (
                        <Chip
                          label="Read"
                          size="small"
                          sx={{
                            minWidth:
                              '66px',

                            backgroundColor:
                              '#F3F4F6',

                            color:
                              '#6B7280',

                            borderRadius:
                              '999px',

                            fontSize:
                              '11px',

                            fontWeight:
                              700,
                          }}
                        />
                      ) : (
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={() =>
                            handleMarkAsRead(
                              notification.id,
                            )
                          }
                          sx={{
                            minWidth:
                              '120px',

                            height:
                              '40px',

                            padding:
                              '0 16px',

                            backgroundColor:
                              '#FFFFFF',

                            color:
                              theme.primary,

                            borderColor:
                              theme.primary,

                            borderRadius:
                              '8px',

                            fontSize:
                              '13px',

                            fontWeight:
                              700,

                            textTransform:
                              'none',

                            '&:hover':
                              {
                                backgroundColor:
                                  theme.soft,

                                borderColor:
                                  theme.dark,
                              },
                          }}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </Box>
                  </Box>
                );
              },
            )}
          </Box>
        ) : (
          <Box
            sx={{
              minHeight: '300px',

              padding: '40px 24px',

              display: 'flex',

              flexDirection: 'column',

              alignItems: 'center',

              justifyContent:
                'center',

              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: '64px',

                height: '64px',

                display: 'flex',

                alignItems: 'center',

                justifyContent:
                  'center',

                backgroundColor:
                  theme.soft,

                color:
                  theme.primary,

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
              No notifications found
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',

                fontSize: '14px',

                marginTop: '6px',
              }}
            >
              Try changing or clearing
              the selected filters.
            </Typography>

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                height: '42px',

                marginTop: '20px',

                padding: '0 18px',

                color:
                  theme.primary,

                borderColor:
                  theme.primary,

                borderRadius: '8px',

                fontSize: '14px',

                fontWeight: 700,

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    theme.soft,

                  borderColor:
                    theme.dark,
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

export default RoleNotificationPage;
