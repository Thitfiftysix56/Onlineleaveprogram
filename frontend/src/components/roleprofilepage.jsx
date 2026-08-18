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

const allowedImageTypes =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);

const emptyEditForm = {
  fullName: '',
  email: '',
  phone: '',
};

const roleLabels = {
  employee: 'พนักงาน',
  supervisor: 'หัวหน้างาน',
  hr: 'ฝ่ายทรัพยากรบุคคล',
  admin: 'ผู้ดูแลระบบ',
};

const getRoleLabel = (
  role,
) => {
  const normalizedRole =
    String(role || '')
      .trim()
      .toLowerCase();

  return (
    roleLabels[normalizedRole] ||
    role ||
    'ไม่ระบุบทบาท'
  );
};

const getInitials = (
  displayName,
) =>
  String(
    displayName || 'ผู้ใช้',
  )
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (namePart) =>
        namePart.charAt(0),
    )
    .join('') || 'U';

const translateProfileMessage = (
  message,
  fallback,
) => {
  const text =
    String(
      message || '',
    ).trim();

  const messageMap = {
    'Profile updated successfully.':
      'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว',

    'Profile updated successfully':
      'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว',

    'Unable to update profile.':
      'ไม่สามารถอัปเดตข้อมูลส่วนตัวได้',

    'Unable to load profile.':
      'ไม่สามารถโหลดข้อมูลส่วนตัวได้',

    'Profile not found.':
      'ไม่พบข้อมูลส่วนตัว',
  };

  return (
    messageMap[text] ||
    text ||
    fallback
  );
};

function RoleProfilePage({
  LayoutComponent,
  theme,
}) {
  const fileInputRef =
    useRef(null);

  const currentUser =
    getCurrentUser();

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    editForm,
    setEditForm,
  ] = useState(
    emptyEditForm,
  );

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState('');

  const [
    removeImage,
    setRemoveImage,
  ] = useState(false);

  const [
    editError,
    setEditError,
  ] = useState('');

  const [
    saving,
    setSaving,
  ] = useState(false);

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
  };

  const loadProfile =
    async () => {
      setLoading(true);
      setLoadError('');

      try {
        const profileData =
          await getProfile();

        setProfile(
          profileData,
        );

        updateCurrentUserProfileSession(
          profileData,
        );
      } catch (error) {
        setLoadError(
          translateProfileMessage(
            error.response
              ?.data
              ?.message,
            'ไม่สามารถโหลดข้อมูลส่วนตัวได้',
          ),
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
    currentUser
      ?.displayName ||
    currentUser
      ?.username ||
    'ผู้ใช้';

  const profileImageUrl =
    profile
      ?.profileImageUrl ||
    '';

  const roleValue =
    profile?.roleName ||
    currentUser?.role ||
    '';

  const openEditProfile = (
    selectImage = false,
  ) => {
    if (!profile) {
      return;
    }

    setEditForm({
      fullName:
        profile.fullName ||
        '',

      email:
        profile.email ||
        '',

      phone:
        profile.phone ||
        '',
    });

    setSelectedImage(
      null,
    );

    setImagePreview(
      profile
        .profileImageUrl ||
        '',
    );

    setRemoveImage(
      false,
    );

    setEditError('');

    setEditOpen(true);

    if (selectImage) {
      window.setTimeout(
        () =>
          fileInputRef
            .current
            ?.click(),
        0,
      );
    }
  };

  const handleImageChange =
    (event) => {
      const file =
        event.target
          .files?.[0];

      event.target.value =
        '';

      if (!file) {
        return;
      }

      if (
        !allowedImageTypes.has(
          file.type,
        )
      ) {
        setEditError(
          'รูปโปรไฟล์ต้องเป็นไฟล์ JPEG, PNG หรือ WebP เท่านั้น',
        );

        return;
      }

      if (
        file.size >
        MAX_PROFILE_IMAGE_SIZE
      ) {
        setEditError(
          'รูปโปรไฟล์ต้องมีขนาดไม่เกิน 2 MB',
        );

        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        setSelectedImage(
          file,
        );

        setImagePreview(
          String(
            reader.result ||
              '',
          ),
        );

        setRemoveImage(
          false,
        );

        setEditError('');
      };

      reader.onerror =
        () => {
          setEditError(
            'ไม่สามารถแสดงตัวอย่างรูปที่เลือกได้',
          );
        };

      reader.readAsDataURL(
        file,
      );
    };

  const handleRemoveImage =
    () => {
      setSelectedImage(
        null,
      );

      setImagePreview('');

      setRemoveImage(
        true,
      );

      setEditError('');
    };

  const handleSaveProfile =
    async (event) => {
      event.preventDefault();

      setEditError('');

      const fullName =
        editForm.fullName
          .trim()
          .replace(
            /\s+/g,
            ' ',
          );

      const email =
        editForm.email
          .trim()
          .toLowerCase();

      if (
        fullName.split(
          ' ',
        ).length < 2
      ) {
        setEditError(
          'กรุณากรอกชื่อและนามสกุล',
        );

        return;
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email,
        )
      ) {
        setEditError(
          'กรุณากรอกอีเมลให้ถูกต้อง',
        );

        return;
      }

      const formData =
        new FormData();

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
        String(
          removeImage,
        ),
      );

      if (
        selectedImage
      ) {
        formData.set(
          'profileImage',
          selectedImage,
        );
      }

      setSaving(true);

      try {
        const result =
          await updateProfile(
            formData,
          );

        setProfile(
          result.profile,
        );

        updateCurrentUserProfileSession(
          result.profile,
        );

        setSuccessMessage(
          translateProfileMessage(
            result.message,
            'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว',
          ),
        );

        setEditOpen(
          false,
        );
      } catch (error) {
        setEditError(
          translateProfileMessage(
            error.response
              ?.data
              ?.message,
            'ไม่สามารถอัปเดตข้อมูลส่วนตัวได้',
          ),
        );
      } finally {
        setSaving(false);
      }
    };

  const profileItems = [
    {
      label:
        'รหัสพนักงาน',

      value:
        profile
          ?.employeeCode ||
        'ไม่มีข้อมูล',
    },

    {
      label:
        'ชื่อผู้ใช้',

      value:
        profile?.username ||
        currentUser
          ?.username ||
        'ไม่มีข้อมูล',
    },

    {
      label:
        'ชื่อ-นามสกุล',

      value:
        displayName,
    },

    {
      label:
        'อีเมล',

      value:
        profile?.email ||
        'ไม่มีข้อมูล',
    },

    {
      label:
        'เบอร์โทรศัพท์',

      value:
        profile?.phone ||
        'ไม่มีข้อมูล',
    },

    {
      label:
        'บทบาท',

      value:
        getRoleLabel(
          roleValue,
        ),
    },

    {
      label:
        'แผนก',

      value:
        profile
          ?.department ||
        'ไม่มีข้อมูล',
    },

    {
      label:
        'ตำแหน่ง',

      value:
        profile
          ?.position ||
        'ไม่มีข้อมูล',
    },
  ];

  return (
    <LayoutComponent
      activeMenu="Profile"
    >
      <Box
        sx={{
          marginBottom:
            '22px',
        }}
      >
        <Typography
          component="h1"
          sx={{
            color:
              '#111827',

            fontSize: {
              xs: '26px',
              sm: '30px',
            },

            fontWeight:
              800,
          }}
        >
          ข้อมูลส่วนตัว
        </Typography>
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
                onClick={
                  loadProfile
                }
                sx={{
                  color:
                    'inherit',

                  fontWeight:
                    700,
                }}
              >
                ลองอีกครั้ง
              </Button>
            ) : null
          }
          onClose={
            successMessage
              ? () =>
                  setSuccessMessage(
                    '',
                  )
              : undefined
          }
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
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
            minHeight:
              '360px',

            display:
              'grid',

            placeItems:
              'center',

            backgroundColor:
              '#FFFFFF',

            border:
              '1px solid #E5E7EB',

            borderRadius:
              '14px',
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
        <Paper
          elevation={0}
          sx={{
            backgroundColor:
              '#FFFFFF',

            border:
              '1px solid #E5E7EB',

            borderRadius:
              '14px',

            overflow:
              'hidden',
          }}
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

              padding: {
                xs:
                  '22px',

                sm:
                  '26px 28px',
              },

              background:
                `linear-gradient(
                  135deg,
                  ${resolvedTheme.soft} 0%,
                  #FFFFFF 65%
                )`,

              borderBottom:
                '1px solid #E5E7EB',
            }}
          >
            <Box
              sx={{
                display:
                  'flex',

                alignItems:
                  'center',

                gap: {
                  xs:
                    '14px',

                  sm:
                    '18px',
                },
              }}
            >
              <Button
                type="button"
                aria-label="เลือกรูปโปรไฟล์"
                onClick={() =>
                  openEditProfile(
                    true,
                  )
                }
                disabled={
                  !profile
                }
                sx={{
                  minWidth:
                    0,

                  padding:
                    0,

                  flexShrink:
                    0,

                  borderRadius:
                    '50%',

                  '&:hover':
                    {
                      backgroundColor:
                        'transparent',
                    },
                }}
              >
                <Avatar
                  src={
                    profileImageUrl ||
                    undefined
                  }
                  alt={
                    displayName
                  }
                  sx={{
                    width: {
                      xs:
                        '76px',

                      sm:
                        '88px',
                    },

                    height: {
                      xs:
                        '76px',

                      sm:
                        '88px',
                    },

                    backgroundColor:
                      '#FFFFFF',

                    color:
                      resolvedTheme.primary,

                    border:
                      `2px solid ${resolvedTheme.border}`,

                    boxShadow:
                      '0 4px 14px rgba(15, 23, 42, 0.06)',

                    fontSize:
                      '26px',

                    fontWeight:
                      900,
                  }}
                >
                  {getInitials(
                    displayName,
                  )}
                </Avatar>
              </Button>

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

                    fontSize: {
                      xs:
                        '18px',

                      sm:
                        '21px',
                    },

                    fontWeight:
                      800,

                    lineHeight:
                      1.4,

                    wordBreak:
                      'break-word',
                  }}
                >
                  {
                    displayName
                  }
                </Typography>

                <Typography
                  sx={{
                    color:
                      '#64748B',

                    fontSize:
                      '13px',

                    marginTop:
                      '2px',
                  }}
                >
                  {profile
                    ?.username ||
                    currentUser
                      ?.username ||
                    'ไม่ระบุชื่อผู้ใช้'}
                </Typography>

                <Box
                  sx={{
                    display:
                      'flex',

                    alignItems:
                      'center',

                    flexWrap:
                      'wrap',

                    gap:
                      '8px',

                    marginTop:
                      '9px',
                  }}
                >
                  <Chip
                    label={getRoleLabel(
                      roleValue,
                    )}
                    size="small"
                    sx={{
                      height:
                        '27px',

                      backgroundColor:
                        '#FFFFFF',

                      color:
                        resolvedTheme.dark,

                      border:
                        `1px solid ${resolvedTheme.border}`,

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

                  <Typography
                    sx={{
                      color:
                        '#94A3B8',

                      fontSize:
                        '10px',
                    }}
                  >
                    คลิกที่รูปเพื่อเปลี่ยนรูปโปรไฟล์
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Button
              type="button"
              variant="contained"
              onClick={() =>
                openEditProfile(
                  false,
                )
              }
              disabled={
                !profile
              }
              sx={{
                width: {
                  xs:
                    '100%',

                  sm:
                    'auto',
                },

                minWidth: {
                  sm:
                    '150px',
                },

                height:
                  '42px',

                padding:
                  '0 18px',

                backgroundColor:
                  resolvedTheme.primary,

                color:
                  '#FFFFFF',

                borderRadius:
                  '9px',

                fontSize:
                  '13px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                boxShadow:
                  'none',

                '&:hover':
                  {
                    backgroundColor:
                      resolvedTheme.dark,

                    boxShadow:
                      'none',
                  },
              }}
            >
              แก้ไขข้อมูลส่วนตัว
            </Button>
          </Box>

          <Box
            sx={{
              padding: {
                xs:
                  '22px',

                sm:
                  '26px 28px 30px',
              },
            }}
          >
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
              ข้อมูลบัญชี
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

                columnGap: {
                  sm:
                    '48px',

                  lg:
                    '72px',
                },

                rowGap:
                  '0',

                marginTop:
                  '14px',
              }}
            >
              {profileItems.map(
                (
                  item,
                  index,
                ) => (
                  <Box
                    key={
                      item.label
                    }
                    sx={{
                      minHeight:
                        '72px',

                      display:
                        'flex',

                      flexDirection:
                        'column',

                      justifyContent:
                        'center',

                      padding:
                        '13px 0',

                      borderBottom:
                        index <
                        profileItems.length -
                          2
                          ? '1px solid #EEF0F3'
                          : {
                              xs:
                                '1px solid #EEF0F3',

                              sm:
                                'none',
                            },
                    }}
                  >
                    <Typography
                      sx={{
                        color:
                          '#94A3B8',

                        fontSize:
                          '10px',

                        fontWeight:
                          700,

                        marginBottom:
                          '4px',
                      }}
                    >
                      {
                        item.label
                      }
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

                        wordBreak:
                          'break-word',
                      }}
                    >
                      {
                        item.value
                      }
                    </Typography>
                  </Box>
                ),
              )}
            </Box>
          </Box>
        </Paper>
      )}

      <Dialog
        open={
          editOpen
        }
        keepMounted
        fullWidth
        maxWidth="sm"
        onClose={() =>
          !saving &&
          setEditOpen(
            false,
          )
        }
        component="form"
        onSubmit={
          handleSaveProfile
        }
        slotProps={{
          paper: {
            sx: {
              borderRadius:
                '14px',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            color:
              '#111827',

            fontSize:
              '19px',

            fontWeight:
              800,

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          แก้ไขข้อมูลส่วนตัว
        </DialogTitle>

        <DialogContent
          sx={{
            padding:
              '22px !important',
          }}
        >
          {editError && (
            <Alert
              severity="error"
              sx={{
                marginBottom:
                  '20px',

                borderRadius:
                  '9px',
              }}
            >
              {
                editError
              }
            </Alert>
          )}

          <Box
            sx={{
              display:
                'flex',

              flexDirection:
                'column',

              alignItems:
                'center',

              marginBottom:
                '24px',
            }}
          >
            <Avatar
              src={
                imagePreview ||
                undefined
              }
              alt={
                editForm.fullName
              }
              sx={{
                width:
                  '108px',

                height:
                  '108px',

                backgroundColor:
                  resolvedTheme.soft,

                color:
                  resolvedTheme.primary,

                border:
                  `1px solid ${resolvedTheme.border}`,

                fontSize:
                  '32px',

                fontWeight:
                  900,
              }}
            >
              {getInitials(
                editForm.fullName,
              )}
            </Avatar>

            <input
              ref={
                fileInputRef
              }
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleImageChange
              }
            />

            <Box
              sx={{
                display:
                  'flex',

                flexWrap:
                  'wrap',

                justifyContent:
                  'center',

                gap:
                  '8px',

                marginTop:
                  '14px',
              }}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={() =>
                  fileInputRef
                    .current
                    ?.click()
                }
                disabled={
                  saving
                }
                sx={{
                  height:
                    '38px',

                  padding:
                    '0 14px',

                  color:
                    resolvedTheme.primary,

                  borderColor:
                    resolvedTheme.border,

                  borderRadius:
                    '8px',

                  fontSize:
                    '12px',

                  fontWeight:
                    700,

                  textTransform:
                    'none',

                  '&:hover':
                    {
                      backgroundColor:
                        resolvedTheme.soft,

                      borderColor:
                        resolvedTheme.primary,
                    },
                }}
              >
                เลือกรูป
              </Button>

              {imagePreview && (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={
                    handleRemoveImage
                  }
                  disabled={
                    saving
                  }
                  sx={{
                    height:
                      '38px',

                    padding:
                      '0 14px',

                    color:
                      '#DC2626',

                    borderColor:
                      '#FCA5A5',

                    borderRadius:
                      '8px',

                    fontSize:
                      '12px',

                    fontWeight:
                      700,

                    textTransform:
                      'none',

                    '&:hover':
                      {
                        backgroundColor:
                          '#FEF2F2',

                        borderColor:
                          '#DC2626',
                      },
                  }}
                >
                  ลบรูป
                </Button>
              )}
            </Box>

            <Typography
              sx={{
                color:
                  '#9CA3AF',

                fontSize:
                  '11px',

                marginTop:
                  '8px',
              }}
            >
              รองรับ JPEG, PNG และ WebP ขนาดไม่เกิน 2 MB
            </Typography>
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
              },

              gap:
                '14px',
            }}
          >
            <TextField
              required
              fullWidth
              size="small"
              label="ชื่อ-นามสกุล"
              value={
                editForm.fullName
              }
              onChange={(
                event,
              ) =>
                setEditForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    fullName:
                      event
                        .target
                        .value,
                  }),
                )
              }
              disabled={
                saving
              }
              slotProps={{
                htmlInput: {
                  maxLength:
                    201,
                },
              }}
            />

            <TextField
              required
              fullWidth
              size="small"
              type="email"
              label="อีเมล"
              value={
                editForm.email
              }
              onChange={(
                event,
              ) =>
                setEditForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    email:
                      event
                        .target
                        .value,
                  }),
                )
              }
              disabled={
                saving
              }
              slotProps={{
                htmlInput: {
                  maxLength:
                    100,
                },
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="เบอร์โทรศัพท์"
              value={
                editForm.phone
              }
              onChange={(
                event,
              ) =>
                setEditForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    phone:
                      event
                        .target
                        .value,
                  }),
                )
              }
              disabled={
                saving
              }
              slotProps={{
                htmlInput: {
                  maxLength:
                    20,
                },
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="รหัสพนักงาน"
              value={
                profile
                  ?.employeeCode ||
                ''
              }
              disabled
            />

            <TextField
              fullWidth
              size="small"
              label="ชื่อผู้ใช้"
              value={
                profile
                  ?.username ||
                ''
              }
              disabled
            />

            <TextField
              fullWidth
              size="small"
              label="บทบาท"
              value={getRoleLabel(
                roleValue,
              )}
              disabled
            />

            <TextField
              fullWidth
              size="small"
              label="แผนก"
              value={
                profile
                  ?.department ||
                ''
              }
              disabled
            />

            <TextField
              fullWidth
              size="small"
              label="ตำแหน่ง"
              value={
                profile
                  ?.position ||
                ''
              }
              disabled
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            padding:
              '14px 22px 18px',

            borderTop:
              '1px solid #E5E7EB',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={() =>
              setEditOpen(
                false,
              )
            }
            disabled={
              saving
            }
            sx={{
              minWidth:
                '84px',

              height:
                '40px',

              color:
                '#374151',

              borderColor:
                '#D1D5DB',

              borderRadius:
                '8px',

              fontSize:
                '13px',

              fontWeight:
                700,

              textTransform:
                'none',
            }}
          >
            ยกเลิก
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={
              saving
            }
            sx={{
              minWidth:
                '118px',

              height:
                '40px',

              backgroundColor:
                resolvedTheme.primary,

              color:
                '#FFFFFF',

              borderRadius:
                '8px',

              fontSize:
                '13px',

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
            {saving
              ? 'กำลังบันทึก...'
              : 'บันทึกข้อมูล'}
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutComponent>
  );
}

export default RoleProfilePage;