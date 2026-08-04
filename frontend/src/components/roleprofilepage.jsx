import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
} from '@mui/material';

import {
  useNavigate,
} from 'react-router-dom';

import {
  getCurrentUser,
  getDashboardPathByRole,
} from '../utils/authstorage.js';

const formatDateTime = (
  dateTime,
) => {
  if (!dateTime) {
    return 'Not available';
  }

  const date =
    new Date(dateTime);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Not available';
  }

  return date.toLocaleString(
    'en-GB',
    {
      day:
        '2-digit',

      month:
        'short',

      year:
        'numeric',

      hour:
        '2-digit',

      minute:
        '2-digit',
    },
  );
};

const getInitials = (
  displayName,
) => {
  const normalizedName =
    String(
      displayName || '',
    ).trim();

  if (!normalizedName) {
    return 'U';
  }

  const nameParts =
    normalizedName
      .split(/\s+/)
      .filter(Boolean);

  if (
    nameParts.length === 1
  ) {
    return nameParts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return nameParts
    .slice(0, 2)
    .map(
      (namePart) =>
        namePart
          .charAt(0)
          .toUpperCase(),
    )
    .join('');
};

function RoleProfilePage({
  LayoutComponent,
  theme,
}) {
  const navigate =
    useNavigate();

  const currentUser =
    getCurrentUser();

  const resolvedTheme = {
    primary:
      theme?.primary ||
      '#2563EB',

    dark:
      theme?.dark ||
      '#1D4ED8',

    soft:
      theme?.soft ||
      '#EFF6FF',

    border:
      theme?.border ||
      '#BFDBFE',

    text:
      theme?.text ||
      '#1E3A8A',
  };

  const displayName =
    currentUser?.displayName ||
    currentUser?.username ||
    'User';

  const profileItems = [
    {
      label:
        'User ID',

      value:
        currentUser?.userId ||
        'Not available',
    },
    {
      label:
        'Username',

      value:
        currentUser?.username ||
        'Not available',
    },
    {
      label:
        'Display Name',

      value:
        displayName,
    },
    {
      label:
        'Role',

      value:
        currentUser?.role ||
        'Not available',

      capitalize:
        true,
    },
  ];

  const sessionItems = [
    {
      label:
        'Last Login',

      value:
        formatDateTime(
          currentUser?.loginAt,
        ),
    },
    {
      label:
        'Password Changed',

      value:
        formatDateTime(
          currentUser
            ?.passwordChangedAt,
        ),
    },
  ];

  const handleOpenDashboard =
    () => {
      navigate(
        getDashboardPathByRole(
          currentUser?.role,
        ),
      );
    };

  const handleChangePassword =
    () => {
      const role =
        String(
          currentUser?.role ||
            '',
        )
          .trim()
          .toLowerCase();

      if (!role) {
        navigate(
          '/login',
        );

        return;
      }

      navigate(
        `/${role}/change-password`,
      );
    };

  return (
    <LayoutComponent activeMenu="Profile">
      <Box
        sx={{
          display:
            'flex',

          alignItems: {
            xs:
              'flex-start',

            md:
              'center',
          },

          justifyContent:
            'space-between',

          flexDirection: {
            xs:
              'column',

            md:
              'row',
          },

          gap:
            '16px',

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
            Profile
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
            View your account and login information.
          </Typography>
        </Box>

        <Button
          type="button"
          variant="outlined"
          onClick={
            handleOpenDashboard
          }
          sx={{
            minWidth:
              '140px',

            height:
              '42px',

            color:
              resolvedTheme.primary,

            borderColor:
              resolvedTheme.primary,

            borderRadius:
              '8px',

            fontSize:
              '14px',

            fontWeight:
              700,

            textTransform:
              'none',

            '&:hover': {
              backgroundColor:
                resolvedTheme.soft,

              borderColor:
                resolvedTheme.dark,
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            lg:
              'minmax(280px, 0.75fr) minmax(0, 1.5fr)',
          },

          gap:
            '24px',

          alignItems:
            'start',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            padding:
              '28px',

            display:
              'flex',

            flexDirection:
              'column',

            alignItems:
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
                '96px',

              height:
                '96px',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              backgroundColor:
                resolvedTheme.soft,

              color:
                resolvedTheme.primary,

              border:
                `1px solid ${resolvedTheme.border}`,

              borderRadius:
                '50%',

              fontSize:
                '30px',

              fontWeight:
                900,
            }}
          >
            {getInitials(
              displayName,
            )}
          </Box>

          <Typography
            sx={{
              color:
                '#111827',

              fontSize:
                '21px',

              fontWeight:
                800,

              marginTop:
                '20px',
            }}
          >
            {displayName}
          </Typography>

          <Typography
            sx={{
              color:
                '#6B7280',

              fontSize:
                '14px',

              marginTop:
                '5px',
            }}
          >
            {currentUser?.username ||
              'No username'}
          </Typography>

          <Chip
            label={
              currentUser?.role ||
              'Unknown Role'
            }
            sx={{
              marginTop:
                '16px',

              backgroundColor:
                resolvedTheme.soft,

              color:
                resolvedTheme.dark,

              borderRadius:
                '999px',

              fontSize:
                '12px',

              fontWeight:
                800,

              textTransform:
                'capitalize',
            }}
          />

          <Button
            fullWidth
            type="button"
            variant="contained"
            onClick={
              handleChangePassword
            }
            sx={{
              height:
                '44px',

              marginTop:
                '28px',

              backgroundColor:
                resolvedTheme.primary,

              borderRadius:
                '8px',

              fontSize:
                '14px',

              fontWeight:
                700,

              textTransform:
                'none',

              boxShadow:
                'none',

              '&:hover': {
                backgroundColor:
                  resolvedTheme.dark,

                boxShadow:
                  'none',
              },
            }}
          >
            Change Password
          </Button>
        </Paper>

        <Box
          sx={{
            display:
              'flex',

            flexDirection:
              'column',

            gap:
              '24px',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              padding: {
                xs:
                  '22px',

                sm:
                  '28px',
              },

              backgroundColor:
                '#FFFFFF',

              border:
                '1px solid #E5E7EB',

              borderRadius:
                '12px',
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
              Account Information
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
                  '5px',
              }}
            >
              Information from the account currently signed in.
            </Typography>

            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns: {
                  xs:
                    '1fr',

                  sm:
                    'repeat(2, minmax(0, 1fr))',
                },

                gap:
                  '20px',

                marginTop:
                  '24px',
              }}
            >
              {profileItems.map(
                (profileItem) => (
                  <Box
                    key={
                      profileItem.label
                    }
                    sx={{
                      padding:
                        '18px',

                      backgroundColor:
                        '#F9FAFB',

                      border:
                        '1px solid #E5E7EB',

                      borderRadius:
                        '8px',
                    }}
                  >
                    <Typography
                      sx={{
                        color:
                          '#9CA3AF',

                        fontSize:
                          '11px',

                        fontWeight:
                          800,

                        textTransform:
                          'uppercase',

                        letterSpacing:
                          '0.5px',
                      }}
                    >
                      {profileItem.label}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#111827',

                        fontSize:
                          '14px',

                        fontWeight:
                          700,

                        lineHeight:
                          1.5,

                        marginTop:
                          '6px',

                        textTransform:
                          profileItem.capitalize
                            ? 'capitalize'
                            : 'none',

                        wordBreak:
                          'break-word',
                      }}
                    >
                      {profileItem.value}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              padding: {
                xs:
                  '22px',

                sm:
                  '28px',
              },

              backgroundColor:
                resolvedTheme.soft,

              border:
                `1px solid ${resolvedTheme.border}`,

              borderRadius:
                '12px',
            }}
          >
            <Typography
              sx={{
                color:
                  resolvedTheme.dark,

                fontSize:
                  '18px',

                fontWeight:
                  800,
              }}
            >
              Security Information
            </Typography>

            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns: {
                  xs:
                    '1fr',

                  sm:
                    'repeat(2, minmax(0, 1fr))',
                },

                gap:
                  '20px',

                marginTop:
                  '20px',
              }}
            >
              {sessionItems.map(
                (sessionItem) => (
                  <Box
                    key={
                      sessionItem.label
                    }
                  >
                    <Typography
                      sx={{
                        color:
                          resolvedTheme.text,

                        fontSize:
                          '11px',

                        fontWeight:
                          800,

                        textTransform:
                          'uppercase',

                        letterSpacing:
                          '0.5px',
                      }}
                    >
                      {sessionItem.label}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          resolvedTheme.dark,

                        fontSize:
                          '14px',

                        fontWeight:
                          700,

                        marginTop:
                          '6px',
                      }}
                    >
                      {sessionItem.value}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </LayoutComponent>
  );
}

export default RoleProfilePage;