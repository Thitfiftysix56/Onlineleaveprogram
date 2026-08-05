import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  getProfile,
  updateProfile,
} from '../api/profile-service.js';
import {
  getCurrentUser,
  updateCurrentUserProfileSession,
} from '../utils/authstorage.js';

const MAX_PROFILE_IMAGE_SIZE =
  2 * 1024 * 1024;

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const emptyEditForm = {
  fullName: '',
  email: '',
  phone: '',
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return 'Not available';

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getInitials = (displayName) =>
  String(displayName || 'User')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((namePart) =>
      namePart.charAt(0).toUpperCase(),
    )
    .join('') || 'U';

function RoleProfilePage({
  LayoutComponent,
  theme,
}) {
  const fileInputRef = useRef(null);
  const currentUser = getCurrentUser();

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const [editOpen, setEditOpen] =
    useState(false);

  const [editForm, setEditForm] =
    useState(emptyEditForm);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState('');

  const [removeImage, setRemoveImage] =
    useState(false);

  const [editError, setEditError] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const resolvedTheme = {
    primary: theme?.primary || '#2563EB',
    dark: theme?.dark || '#1D4ED8',
    soft: theme?.soft || '#EFF6FF',
    border: theme?.border || '#BFDBFE',
    text: theme?.text || '#1E3A8A',
  };

  const loadProfile = async () => {
    setLoading(true);
    setLoadError('');

    try {
      const profileData =
        await getProfile();

      setProfile(profileData);

      updateCurrentUserProfileSession(
        profileData,
      );
    } catch (error) {
      setLoadError(
        error.response?.data?.message ||
          'Unable to load profile.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const displayName =
    profile?.fullName ||
    currentUser?.displayName ||
    currentUser?.username ||
    'User';

  const profileImageUrl =
    profile?.profileImageUrl || '';

  const openEditProfile = (
    selectImage = false,
  ) => {
    if (!profile) return;

    setEditForm({
      fullName: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
    });

    setSelectedImage(null);

    setImagePreview(
      profile.profileImageUrl || '',
    );

    setRemoveImage(false);
    setEditError('');
    setEditOpen(true);

    if (selectImage) {
      window.setTimeout(
        () =>
          fileInputRef.current?.click(),
        0,
      );
    }
  };

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    event.target.value = '';

    if (!file) return;

    if (!allowedImageTypes.has(file.type)) {
      setEditError(
        'Profile image must be a JPEG, PNG or WebP file.',
      );

      return;
    }

    if (
      file.size >
      MAX_PROFILE_IMAGE_SIZE
    ) {
      setEditError(
        'Profile image must not exceed 2 MB.',
      );

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setSelectedImage(file);

      setImagePreview(
        String(reader.result || ''),
      );

      setRemoveImage(false);
      setEditError('');
    };

    reader.onerror = () => {
      setEditError(
        'Unable to preview the selected image.',
      );
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setRemoveImage(true);
    setEditError('');
  };

  const handleSaveProfile = async (
    event,
  ) => {
    event.preventDefault();
    setEditError('');

    const fullName =
      editForm.fullName
        .trim()
        .replace(/\s+/g, ' ');

    const email =
      editForm.email
        .trim()
        .toLowerCase();

    if (
      fullName.split(' ').length < 2
    ) {
      setEditError(
        'Please enter both first name and last name.',
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      setEditError(
        'Please enter a valid email address.',
      );

      return;
    }

    const formData = new FormData();

    formData.set(
      'fullName',
      fullName,
    );

    formData.set(
      'email',
      email,
    );

    formData.set(
      'phone',
      editForm.phone.trim(),
    );

    formData.set(
      'removeProfileImage',
      String(removeImage),
    );

    if (selectedImage) {
      formData.set(
        'profileImage',
        selectedImage,
      );
    }

    setSaving(true);

    try {
      const result =
        await updateProfile(formData);

      setProfile(result.profile);

      updateCurrentUserProfileSession(
        result.profile,
      );

      setSuccessMessage(
        result.message ||
          'Profile updated successfully.',
      );

      setEditOpen(false);
    } catch (error) {
      setEditError(
        error.response?.data?.message ||
          'Unable to update profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  const profileItems = [
    {
      label: 'Employee ID',
      value:
        profile?.employeeCode ||
        'Not available',
    },
    {
      label: 'Username',
      value:
        profile?.username ||
        currentUser?.username ||
        'Not available',
    },
    {
      label: 'Full Name',
      value: displayName,
    },
    {
      label: 'Email',
      value:
        profile?.email ||
        'Not available',
    },
    {
      label: 'Phone Number',
      value:
        profile?.phone ||
        'Not available',
    },
    {
      label: 'Role',
      value:
        profile?.roleName ||
        currentUser?.role ||
        'Not available',
      capitalize: true,
    },
    {
      label: 'Department',
      value:
        profile?.department ||
        'Not available',
    },
    {
      label: 'Position',
      value:
        profile?.position ||
        'Not available',
    },
  ];

  const sessionItems = [
    {
      label: 'Last Login',
      value: formatDateTime(
        profile?.lastLoginAt ||
          currentUser?.loginAt,
      ),
    },
    {
      label: 'Password Changed',
      value: formatDateTime(
        profile?.passwordChangedAt ||
          currentUser?.passwordChangedAt,
      ),
    },
  ];

  return (
    <LayoutComponent activeMenu="Profile">
      <Box
        sx={{
          display: 'flex',
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
          justifyContent:
            'space-between',
          flexDirection: {
            xs: 'column',
            md: 'row',
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
            Profile
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '15px',
              marginTop: '6px',
            }}
          >
            View and update your profile
            information.
          </Typography>
        </Box>
      </Box>

      {(loadError ||
        successMessage) && (
        <Alert
          severity={
            loadError
              ? 'error'
              : 'success'
          }
          action={
            loadError ? (
              <Button
                onClick={loadProfile}
              >
                Retry
              </Button>
            ) : null
          }
          onClose={
            successMessage
              ? () =>
                  setSuccessMessage('')
              : undefined
          }
          sx={{
            marginBottom: '24px',
          }}
        >
          {loadError ||
            successMessage}
        </Alert>
      )}

      {loading ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: '360px',
            display: 'grid',
            placeItems: 'center',
            border:
              '1px solid #E5E7EB',
            borderRadius: '12px',
          }}
        >
          <CircularProgress
            sx={{
              color:
                resolvedTheme.primary,
            }}
          />
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg:
                'minmax(280px, 0.75fr) minmax(0, 1.5fr)',
            },
            gap: '24px',
            alignItems: 'start',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor:
                '#FFFFFF',
              border:
                '1px solid #E5E7EB',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <Button
              type="button"
              aria-label={
                'Select profile image'
              }
              onClick={() =>
                openEditProfile(true)
              }
              sx={{
                minWidth: 0,
                padding: 0,
                borderRadius: '50%',
              }}
            >
              <Avatar
                src={
                  profileImageUrl ||
                  undefined
                }
                alt={displayName}
                sx={{
                  width: '96px',
                  height: '96px',
                  backgroundColor:
                    resolvedTheme.soft,
                  color:
                    resolvedTheme.primary,
                  border:
                    `1px solid ${resolvedTheme.border}`,
                  fontSize: '30px',
                  fontWeight: 900,
                }}
              >
                {getInitials(
                  displayName,
                )}
              </Avatar>
            </Button>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '12px',
                marginTop: '8px',
              }}
            >
              Click the avatar to choose
              a photo
            </Typography>

            <Typography
              sx={{
                color: '#111827',
                fontSize: '21px',
                fontWeight: 800,
                marginTop: '16px',
              }}
            >
              {displayName}
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '5px',
              }}
            >
              {profile?.username ||
                currentUser?.username ||
                'No username'}
            </Typography>

            <Chip
              label={
                profile?.roleName ||
                currentUser?.role ||
                'Unknown Role'
              }
              sx={{
                marginTop: '16px',
                backgroundColor:
                  resolvedTheme.soft,
                color:
                  resolvedTheme.dark,
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                textTransform:
                  'capitalize',
              }}
            />

            <Button
              fullWidth
              type="button"
              variant="contained"
              onClick={() =>
                openEditProfile(false)
              }
              disabled={!profile}
              sx={{
                height: '44px',
                marginTop: '28px',
                backgroundColor:
                  resolvedTheme.primary,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor:
                    resolvedTheme.dark,
                  boxShadow: 'none',
                },
              }}
            >
              Edit Profile
            </Button>
          </Paper>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                padding: {
                  xs: '22px',
                  sm: '28px',
                },
                backgroundColor:
                  '#FFFFFF',
                border:
                  '1px solid #E5E7EB',
                borderRadius: '12px',
              }}
            >
              <Typography
                sx={{
                  color: '#111827',
                  fontSize: '18px',
                  fontWeight: 800,
                }}
              >
                Account Information
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  marginTop: '5px',
                }}
              >
                Employee ID, username,
                role, department and
                position are managed by
                HR or Admin.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm:
                      'repeat(2, minmax(0, 1fr))',
                  },
                  gap: '20px',
                  marginTop: '24px',
                }}
              >
                {profileItems.map(
                  (item) => (
                    <Box
                      key={item.label}
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
                        {item.label}
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
                            item.capitalize
                              ? 'capitalize'
                              : 'none',
                          wordBreak:
                            'break-word',
                        }}
                      >
                        {item.value}
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
                  xs: '22px',
                  sm: '28px',
                },
                backgroundColor:
                  resolvedTheme.soft,
                border:
                  `1px solid ${resolvedTheme.border}`,
                borderRadius: '12px',
              }}
            >
              <Typography
                sx={{
                  color:
                    resolvedTheme.dark,
                  fontSize: '18px',
                  fontWeight: 800,
                }}
              >
                Security Information
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm:
                      'repeat(2, minmax(0, 1fr))',
                  },
                  gap: '20px',
                  marginTop: '20px',
                }}
              >
                {sessionItems.map(
                  (item) => (
                    <Box
                      key={item.label}
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
                        {item.label}
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
                        {item.value}
                      </Typography>
                    </Box>
                  ),
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      )}

      <Dialog
        open={editOpen}
        keepMounted
        fullWidth
        maxWidth="sm"
        onClose={() =>
          !saving &&
          setEditOpen(false)
        }
        component="form"
        onSubmit={handleSaveProfile}
      >
        <DialogTitle>
          Edit Profile
        </DialogTitle>

        <DialogContent dividers>
          {editError && (
            <Alert
              severity="error"
              sx={{
                marginBottom: '20px',
              }}
            >
              {editError}
            </Alert>
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <Avatar
              src={
                imagePreview ||
                undefined
              }
              alt={editForm.fullName}
              sx={{
                width: '112px',
                height: '112px',
                backgroundColor:
                  resolvedTheme.soft,
                color:
                  resolvedTheme.primary,
                border:
                  `1px solid ${resolvedTheme.border}`,
                fontSize: '34px',
                fontWeight: 900,
              }}
            >
              {getInitials(
                editForm.fullName,
              )}
            </Avatar>

            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept={
                'image/jpeg,image/png,image/webp'
              }
              onChange={
                handleImageChange
              }
            />

            <Box
              sx={{
                display: 'flex',
                gap: '10px',
                marginTop: '14px',
              }}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={saving}
              >
                Choose Photo
              </Button>

              {imagePreview && (
                <Button
                  type="button"
                  color="error"
                  onClick={
                    handleRemoveImage
                  }
                  disabled={saving}
                >
                  Remove
                </Button>
              )}
            </Box>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '12px',
                marginTop: '8px',
              }}
            >
              JPEG, PNG or WebP,
              maximum 2 MB
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm:
                  'repeat(2, minmax(0, 1fr))',
              },
              gap: '16px',
            }}
          >
            <TextField
              required
              label="Full Name"
              value={editForm.fullName}
              onChange={(event) =>
                setEditForm(
                  (previous) => ({
                    ...previous,
                    fullName:
                      event.target.value,
                  }),
                )
              }
              disabled={saving}
              slotProps={{
                htmlInput: {
                  maxLength: 201,
                },
              }}
            />

            <TextField
              required
              type="email"
              label="Email"
              value={editForm.email}
              onChange={(event) =>
                setEditForm(
                  (previous) => ({
                    ...previous,
                    email:
                      event.target.value,
                  }),
                )
              }
              disabled={saving}
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />

            <TextField
              label="Phone Number"
              value={editForm.phone}
              onChange={(event) =>
                setEditForm(
                  (previous) => ({
                    ...previous,
                    phone:
                      event.target.value,
                  }),
                )
              }
              disabled={saving}
              slotProps={{
                htmlInput: {
                  maxLength: 20,
                },
              }}
            />

            <TextField
              label="Employee ID"
              value={
                profile?.employeeCode ||
                ''
              }
              disabled
            />

            <TextField
              label="Username"
              value={
                profile?.username || ''
              }
              disabled
            />

            <TextField
              label="Role"
              value={
                profile?.roleName || ''
              }
              disabled
            />

            <TextField
              label="Department"
              value={
                profile?.department ||
                ''
              }
              disabled
            />

            <TextField
              label="Position"
              value={
                profile?.position || ''
              }
              disabled
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            padding: '16px 24px',
          }}
        >
          <Button
            type="button"
            onClick={() =>
              setEditOpen(false)
            }
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              backgroundColor:
                resolvedTheme.primary,
              textTransform: 'none',
            }}
          >
            {saving
              ? 'Saving...'
              : 'Save Profile'}
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutComponent>
  );
}

export default RoleProfilePage;