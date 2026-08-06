import { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import { useLocation, useNavigate } from 'react-router-dom';

import { getLeaveOptions, getMyLeaveRequest, saveLeaveDraft, submitLeaveDraft, submitLeaveRequest as submitLeaveRequestApi, updateLeaveDraft } from '../api/leave-service.js';

const emptyFormData = {
  leaveTypeId: '',
  startDate: '',
  endDate: '',
  reason: '',
};

const allowedRoles = [
  'employee',
  'supervisor',
  'hr',
  'admin',
];

const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

const maximumFileSize =
  10 * 1024 * 1024;

const getYearFromDate = (
  dateValue,
) => {
  const year = Number(
    String(
      dateValue || '',
    ).slice(0, 4),
  );

  return Number.isInteger(
    year,
  ) && year > 0
    ? year
    : null;
};

const normalizeHolidayDate = (
  holiday,
) => {
  const value =
    typeof holiday ===
    'string'
      ? holiday
      : holiday?.holidayDate ||
        holiday?.holiday_date ||
        holiday?.date ||
        '';

  const dateMatch =
    String(value)
      .trim()
      .match(
        /^\d{4}-\d{2}-\d{2}/,
      );

  return dateMatch
    ? dateMatch[0]
    : '';
};

const normalizeLeaveType = (
  leaveType,
) => {
  const requiresAttachment =
    Boolean(
      leaveType
        ?.requiresAttachment ??
        leaveType
          ?.attachmentRequired,
    );

  return {
    ...leaveType,

    id:
      Number(
        leaveType?.id,
      ),

    status:
      leaveType?.status ===
      'Inactive'
        ? 'Inactive'
        : 'Active',

    requiresAttachment,

    attachmentRequired:
      requiresAttachment,

    attachmentRequiredAfterDays:
      Number(
        leaveType
          ?.attachmentRequiredAfterDays,
      ) > 0
        ? Number(
            leaveType
              .attachmentRequiredAfterDays,
          )
        : null,

    minimumDays:
      Math.max(
        Number(
          leaveType
            ?.minimumDays,
        ) || 1,
        0.5,
      ),

    maximumDaysPerRequest:
      Math.max(
        Number(
          leaveType
            ?.maximumDaysPerRequest,
        ) || 365,
        0.5,
      ),
  };
};

const formatDays = (
  value,
) => {
  const number =
    Number(value) || 0;

  return Number.isInteger(
    number,
  )
    ? String(number)
    : number
        .toFixed(2)
        .replace(
          /\.?0+$/,
          '',
        );
};

const formatFileSize = (
  fileSize,
) => {
  const size =
    Number(fileSize) || 0;

  return size <
    1024 * 1024
    ? `${(
        size / 1024
      ).toFixed(1)} KB`
    : `${(
        size /
        (1024 * 1024)
      ).toFixed(1)} MB`;
};

const getAttachmentRuleText =
  (leaveType) => {
    if (!leaveType) {
      return 'Not selected';
    }

    if (
      leaveType
        .requiresAttachment
    ) {
      return 'Always required';
    }

    if (
      Number(
        leaveType
          .attachmentRequiredAfterDays,
      ) > 0
    ) {
      return `Required from ${formatDays(
        leaveType
          .attachmentRequiredAfterDays,
      )} working day(s)`;
    }

    return 'Optional';
  };

function RoleCreateLeaveRequestPage({
  LayoutComponent,
  theme,
  organizationHolidays = [],
}) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const pathRole =
    location.pathname.split(
      '/',
    )[1];

  const currentRole =
    allowedRoles.includes(
      pathRole,
    )
      ? pathRole
      : 'employee';

  const searchParameters =
    new URLSearchParams(
      location.search,
    );

  const editParameter =
    searchParameters.get(
      'edit',
    );

  const editRequestId =
    editParameter !== null
      ? Number(editParameter)
      : null;

  const isEditMode =
    Number.isInteger(
      editRequestId,
    ) &&
    editRequestId > 0;

  const [
    formData,
    setFormData,
  ] = useState({
    ...emptyFormData,
  });

  const [
    attachments,
    setAttachments,
  ] = useState([]);

  const [
    loadedDraft,
    setLoadedDraft,
  ] = useState(null);

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    message,
    setMessage,
  ] = useState(null);

  const [leaveOptions, setLeaveOptions] = useState({ leaveTypes: [], holidays: [] });
  const entitlementYear = getYearFromDate(formData.startDate) || new Date().getFullYear();

  useEffect(() => {
    let active = true;
    getLeaveOptions(entitlementYear).then((data) => { if (active) setLeaveOptions(data || { leaveTypes: [], holidays: [] }); }).catch((error) => { if (active) setMessage({ severity: 'error', text: error.response?.data?.message || 'Unable to load leave options.' }); });
    return () => { active = false; };
  }, [entitlementYear]);

  useEffect(() => {
    setErrors({});

    if (!isEditMode) {
      setLoadedDraft(null);

      setFormData({
        ...emptyFormData,
      });

      setAttachments([]);

      setMessage(null);

      return;
    }

    getMyLeaveRequest(editRequestId).then((storedRequest) => {

    const belongsToCurrentRole =
      !storedRequest?.role ||
      storedRequest.role ===
        currentRole;

    if (
      !storedRequest ||
      String(
        storedRequest.status,
      ).toLowerCase() !==
        'draft' ||
      !belongsToCurrentRole
    ) {
      setLoadedDraft(null);

      setFormData({
        ...emptyFormData,
      });

      setAttachments([]);

      setMessage({
        severity:
          'error',

        text:
          `Draft #${editRequestId} was not found or is no longer available for editing.`,
      });

      return;
    }

    setLoadedDraft(
      storedRequest,
    );

    setFormData({
      leaveTypeId:
        storedRequest
          .leaveTypeId || '',

      startDate:
        storedRequest
          .startDate || '',

      endDate:
        storedRequest
          .endDate || '',

      reason:
        storedRequest.reason ||
        '',
    });

    setAttachments(
      Array.isArray(
        storedRequest
          .attachments,
      )
        ? storedRequest
            .attachments
        : [],
    );

    setMessage({
      severity:
        'info',

      text:
        `Draft #${storedRequest.id} is open for editing.`,
    });
    }).catch((error) => setMessage({ severity: 'error', text: error.response?.data?.message || `Draft #${editRequestId} was not found.` }));
  }, [
    currentRole,
    editRequestId,
    isEditMode,
    location.search,
  ]);

  const roleRequests = [];

  const activeLeaveTypes =
    useMemo(() => {
      return (leaveOptions.leaveTypes || []).map(normalizeLeaveType);
    },
      [leaveOptions],
    );

  const inactiveSelectedLeaveType =
    useMemo(() => {
      if (
        !formData.leaveTypeId
      ) {
        return null;
      }

      const isActive =
        activeLeaveTypes.some(
          (leaveType) =>
            Number(
              leaveType.id,
            ) ===
            Number(
              formData
                .leaveTypeId,
            ),
        );

      if (isActive) {
        return null;
      }

      return null;
    }, [
      activeLeaveTypes,
      formData.leaveTypeId,
    ]);

  const selectableLeaveTypes =
    useMemo(
      () =>
        inactiveSelectedLeaveType
          ? [
              ...activeLeaveTypes,
              inactiveSelectedLeaveType,
            ]
          : activeLeaveTypes,
      [
        activeLeaveTypes,
        inactiveSelectedLeaveType,
      ],
    );

  const calculatedLeaveTypes =
    useMemo(
      () =>
        selectableLeaveTypes.map(
          (leaveType) => {
            const leaveTypeId =
              Number(
                leaveType.id,
              );

            const entitlement = leaveType.hasEntitlement ? leaveType : null;
            const pendingDays = Number(leaveType.pendingDays || 0);

            const totalDays =
              Number(
                entitlement
                  ?.totalDays,
              ) || 0;

            const usedDays =
              Number(
                entitlement
                  ?.usedDays,
              ) || 0;

            const remainingDays =
              Math.max(
                totalDays -
                  usedDays,
                0,
              );

            const availableDays =
              Math.max(
                remainingDays -
                  pendingDays,
                0,
              );

            return {
              ...leaveType,

              entitlement,

              hasEntitlement:
                Boolean(
                  entitlement,
                ),

              totalDays,

              usedDays,

              pendingDays,

              remainingDays,

              availableDays,

              isSelectable:
                leaveType.status ===
                'Active',
            };
          },
        ),
      [
        currentRole,
        entitlementYear,
        roleRequests,
        selectableLeaveTypes,
      ],
    );

  const selectedLeaveType =
    useMemo(
      () =>
        calculatedLeaveTypes.find(
          (leaveType) =>
            Number(
              leaveType.id,
            ) ===
            Number(
              formData
                .leaveTypeId,
            ),
        ) || null,
      [
        calculatedLeaveTypes,
        formData.leaveTypeId,
      ],
    );

  const activeHolidayDates =
    useMemo(() => {
      const storedHolidayDates = (leaveOptions.holidays || []).map((holiday) => holiday.date);

      const propHolidayDates =
        organizationHolidays
          .map(
            normalizeHolidayDate,
          )
          .filter(Boolean);

      return Array.from(
        new Set([
          ...storedHolidayDates,
          ...propHolidayDates,
        ]),
      );
    }, [
      organizationHolidays,
      leaveOptions,
    ]);

  const activeHolidayDateSet =
    useMemo(
      () =>
        new Set(
          activeHolidayDates,
        ),
      [activeHolidayDates],
    );

  const workingDaySummary =
    useMemo(() => {
      if (
        !formData.startDate ||
        !formData.endDate
      ) {
        return {
          workingDays: 0,
          weekendDays: 0,
          holidayDays: 0,
          excludedDates: [],
        };
      }

      const startDate =
        new Date(
          `${formData.startDate}T00:00:00Z`,
        );

      const endDate =
        new Date(
          `${formData.endDate}T00:00:00Z`,
        );

      if (
        Number.isNaN(
          startDate.getTime(),
        ) ||
        Number.isNaN(
          endDate.getTime(),
        ) ||
        startDate > endDate
      ) {
        return {
          workingDays: 0,
          weekendDays: 0,
          holidayDays: 0,
          excludedDates: [],
        };
      }

      let workingDays = 0;
      let weekendDays = 0;
      let holidayDays = 0;

      const excludedDates =
        [];

      const currentDate =
        new Date(startDate);

      while (
        currentDate <= endDate
      ) {
        const date =
          currentDate
            .toISOString()
            .slice(0, 10);

        const dayOfWeek =
          currentDate
            .getUTCDay();

        const isWeekend =
          dayOfWeek === 0 ||
          dayOfWeek === 6;

        const isHoliday =
          activeHolidayDateSet.has(
            date,
          );

        if (isWeekend) {
          weekendDays += 1;

          excludedDates.push({
            date,
            reason:
              'Weekend',
          });
        } else if (
          isHoliday
        ) {
          holidayDays += 1;

          excludedDates.push({
            date,

            reason:
              'Organization Holiday',
          });
        } else {
          workingDays += 1;
        }

        currentDate.setUTCDate(
          currentDate.getUTCDate() +
            1,
        );
      }

      return {
        workingDays,
        weekendDays,
        holidayDays,
        excludedDates,
      };
    }, [
      activeHolidayDateSet,
      formData.endDate,
      formData.startDate,
    ]);

  const requestedDays =
    workingDaySummary
      .workingDays;

  const attachmentRequired =
    useMemo(() => {
      if (
        !selectedLeaveType
      ) {
        return false;
      }

      if (
        selectedLeaveType
          .requiresAttachment
      ) {
        return true;
      }

      const threshold =
        Number(
          selectedLeaveType
            .attachmentRequiredAfterDays,
        );

      return (
        threshold > 0 &&
        requestedDays >=
          threshold
      );
    }, [
      requestedDays,
      selectedLeaveType,
    ]);

  const handleInputChange = (
    fieldName,
    value,
  ) => {
    setFormData(
      (
        previousData,
      ) => ({
        ...previousData,

        [fieldName]:
          value,
      }),
    );

    setErrors(
      (
        previousErrors,
      ) => ({
        ...previousErrors,

        [fieldName]: '',

        dateRange: '',

        balance: '',

        overlap: '',

        policy: '',
      }),
    );

    setMessage(null);
  };

  const dateRangesOverlap = (
    firstStartDate,
    firstEndDate,
    secondStartDate,
    secondEndDate,
  ) =>
    firstStartDate <=
      secondEndDate &&
    firstEndDate >=
      secondStartDate;

  const hasOverlappingRequest =
    () => {
      if (
        !formData.startDate ||
        !formData.endDate
      ) {
        return false;
      }

      return roleRequests.some(
        (request) => {
          if (
            isEditMode &&
            Number(
              request.id,
            ) ===
              Number(
                editRequestId,
              )
          ) {
            return false;
          }

          const status =
            String(
              request.status ||
                '',
            ).toLowerCase();

          if (
            ![
              'pending',
              'approved',
            ].includes(status)
          ) {
            return false;
          }

          if (
            !request.startDate ||
            !request.endDate
          ) {
            return false;
          }

          return dateRangesOverlap(
            formData.startDate,
            formData.endDate,
            request.startDate,
            request.endDate,
          );
        },
      );
    };

  const handleAttachmentChange =
    (event) => {
      const selectedFiles =
        Array.from(
          event.target.files ||
            [],
        );

      if (
        selectedFiles.length ===
        0
      ) {
        return;
      }

      const invalidTypeFile =
        selectedFiles.find(
          (file) =>
            !allowedMimeTypes.includes(
              file.type,
            ),
        );

      if (invalidTypeFile) {
        setErrors(
          (
            previousErrors,
          ) => ({
            ...previousErrors,

            attachments:
              'Only PDF, JPG, JPEG and PNG files are allowed',
          }),
        );

        event.target.value =
          '';

        return;
      }

      const oversizedFile =
        selectedFiles.find(
          (file) =>
            file.size >
            maximumFileSize,
        );

      if (oversizedFile) {
        setErrors(
          (
            previousErrors,
          ) => ({
            ...previousErrors,

            attachments:
              'Each attachment must not exceed 10 MB',
          }),
        );

        event.target.value =
          '';

        return;
      }

      setAttachments(
        (
          previousAttachments,
        ) => {
          const combinedFiles =
            [
              ...previousAttachments,
              ...selectedFiles,
            ];

          return combinedFiles.filter(
            (
              file,
              index,
              allFiles,
            ) =>
              allFiles.findIndex(
                (
                  comparedFile,
                ) =>
                  comparedFile.name ===
                    file.name &&
                  Number(
                    comparedFile.size,
                  ) ===
                    Number(
                      file.size,
                    ),
              ) === index,
          );
        },
      );

      setErrors(
        (
          previousErrors,
        ) => ({
          ...previousErrors,

          attachments: '',
        }),
      );

      setMessage(null);

      event.target.value =
        '';
    };

  const handleRemoveAttachment =
    (
      selectedAttachment,
    ) => {
      setAttachments(
        (
          previousAttachments,
        ) =>
          previousAttachments.filter(
            (attachment) => {
              if (
                selectedAttachment.id &&
                attachment.id
              ) {
                return (
                  attachment.id !==
                  selectedAttachment.id
                );
              }

              return !(
                attachment.name ===
                  selectedAttachment.name &&
                Number(
                  attachment.size,
                ) ===
                  Number(
                    selectedAttachment.size,
                  )
              );
            },
          ),
      );

      setErrors(
        (
          previousErrors,
        ) => ({
          ...previousErrors,

          attachments: '',
        }),
      );

      setMessage(null);
    };

  const validateSubmit =
    () => {
      const validationErrors =
        {};

      if (
        !formData.leaveTypeId
      ) {
        validationErrors.leaveTypeId =
          'Please select a leave type';
      } else if (
        !selectedLeaveType
      ) {
        validationErrors.leaveTypeId =
          'The selected leave type is no longer available';
      } else if (
        selectedLeaveType.status !==
        'Active'
      ) {
        validationErrors.leaveTypeId =
          'This leave type is inactive. Please select an active leave type';
      }

      if (
        !formData.startDate
      ) {
        validationErrors.startDate =
          'Please select the start date';
      }

      if (!formData.endDate) {
        validationErrors.endDate =
          'Please select the end date';
      }

      if (
        formData.startDate &&
        formData.endDate &&
        formData.startDate >
          formData.endDate
      ) {
        validationErrors.dateRange =
          'The end date must be on or after the start date';
      }

      const startYear =
        getYearFromDate(
          formData.startDate,
        );

      const endYear =
        getYearFromDate(
          formData.endDate,
        );

      if (
        startYear &&
        endYear &&
        startYear !== endYear
      ) {
        validationErrors.dateRange =
          'The MVP system does not support leave requests across different years';
      }

      if (
        formData.startDate &&
        formData.endDate &&
        formData.startDate <=
          formData.endDate &&
        requestedDays === 0
      ) {
        validationErrors.dateRange =
          'The selected period contains no working days';
      }

      if (
        selectedLeaveType &&
        requestedDays > 0
      ) {
        if (
          requestedDays <
          Number(
            selectedLeaveType
              .minimumDays,
          )
        ) {
          validationErrors.policy =
            `${selectedLeaveType.name} requires at least ${formatDays(
              selectedLeaveType.minimumDays,
            )} working day(s) per request`;
        } else if (
          requestedDays >
          Number(
            selectedLeaveType
              .maximumDaysPerRequest,
          )
        ) {
          validationErrors.policy =
            `${selectedLeaveType.name} allows no more than ${formatDays(
              selectedLeaveType.maximumDaysPerRequest,
            )} working day(s) per request`;
        }
      }

      if (
        selectedLeaveType &&
        !selectedLeaveType
          .hasEntitlement
      ) {
        validationErrors.balance =
          `No leave entitlement was found for ${entitlementYear}`;
      } else if (
        selectedLeaveType &&
        requestedDays >
          selectedLeaveType
            .availableDays
      ) {
        validationErrors.balance =
          `Insufficient leave balance. Available: ${formatDays(
            selectedLeaveType.availableDays,
          )} day(s)`;
      }

      if (
        hasOverlappingRequest()
      ) {
        validationErrors.overlap =
          'The selected dates overlap an existing Pending or Approved leave request';
      }

      const normalizedReason =
        formData.reason.trim();

      if (!normalizedReason) {
        validationErrors.reason =
          'Please enter the reason for leave';
      } else if (
        normalizedReason.length <
        5
      ) {
        validationErrors.reason =
          'The reason must contain at least 5 characters';
      } else if (
        normalizedReason.length >
        500
      ) {
        validationErrors.reason =
          'The reason must not exceed 500 characters';
      }

      if (
        attachmentRequired &&
        attachments.length === 0
      ) {
        validationErrors.attachments =
          'An attachment is required for this leave request';
      }

      setErrors(
        validationErrors,
      );

      return (
        Object.keys(
          validationErrors,
        ).length === 0
      );
    };

  const createStorageData =
    () => ({
      requestId:
        isEditMode &&
        loadedDraft
          ? loadedDraft.id
          : null,

      role:
        currentRole,

      leaveTypeId:
        Number(
          formData.leaveTypeId,
        ),

      leaveType:
        selectedLeaveType
          ?.name ||
        'Not selected',

      startDate:
        formData.startDate,

      endDate:
        formData.endDate,

      leaveDays:
        requestedDays,

      reason:
        formData.reason.trim(),

      attachments:
        attachments.map(
          (attachment) => ({
            id:
              attachment.id ||
              null,

            name:
              attachment.name ||
              attachment.fileName,

            size:
              Number(
                attachment.size ||
                  attachment.fileSize,
              ) || 0,

            type:
              attachment.type ||
              attachment.fileType ||
              '',
          }),
        ),
    });

  const handleSaveDraft =
    async () => {
      const hasEnteredData =
        formData.leaveTypeId ||
        formData.startDate ||
        formData.endDate ||
        formData.reason.trim() ||
        attachments.length > 0;

      if (!hasEnteredData) {
        setMessage({
          severity:
            'warning',

          text:
            'Enter at least one leave request detail before saving a draft.',
        });

        window.scrollTo({
          top: 0,
          behavior:
            'smooth',
        });

        return;
      }

      if (
        isEditMode &&
        !loadedDraft
      ) {
        setMessage({
          severity:
            'error',

          text:
            `Draft #${editRequestId} cannot be updated because it was not found.`,
        });

        window.scrollTo({
          top: 0,
          behavior:
            'smooth',
        });

        return;
      }

      try {
      const payload = createStorageData();
      const savedDraft = isEditMode ? await updateLeaveDraft(editRequestId, payload, attachments) : await saveLeaveDraft(payload, attachments);

      if (!savedDraft) {
        setMessage({
          severity:
            'error',

          text:
            'The draft could not be saved.',
        });

        window.scrollTo({
          top: 0,
          behavior:
            'smooth',
        });

        return;
      }

      navigate(
        `/${currentRole}/my-requests`,
      );
      } catch (error) { setMessage({ severity: 'error', text: error.response?.data?.message || 'The draft could not be saved.' }); }
    };

  const handleSubmit = (
    event,
  ) => {
    event.preventDefault();

    setMessage(null);

    if (
      isEditMode &&
      !loadedDraft
    ) {
      setMessage({
        severity:
          'error',

        text:
          `Draft #${editRequestId} cannot be submitted because it was not found.`,
      });

      window.scrollTo({
        top: 0,
        behavior:
          'smooth',
      });

      return;
    }

    if (!validateSubmit()) {
      setMessage({
        severity:
          'error',

        text:
          'Please correct the highlighted information before submitting.',
      });

      window.scrollTo({
        top: 0,
        behavior:
          'smooth',
      });

      return;
    }

    const submitAsync = async () => { try {
    const payload = createStorageData();
    const submittedRequest = isEditMode ? await submitLeaveDraft(editRequestId, payload, attachments) : await submitLeaveRequestApi(payload, attachments);

    if (!submittedRequest) {
      setMessage({
        severity:
          'error',

        text:
          'The leave request could not be submitted. Please check the available balance and selected dates.',
      });

      window.scrollTo({
        top: 0,
        behavior:
          'smooth',
      });

      return;
    }

    navigate(
      `/${currentRole}/my-requests`,
    );
    } catch (error) { setMessage({ severity: 'error', text: error.response?.data?.message || 'The leave request could not be submitted.' }); } };
    submitAsync();
  };

  const handleReset =
    () => {
      setErrors({});

      if (
        isEditMode &&
        loadedDraft
      ) {
        setFormData({
          leaveTypeId:
            loadedDraft
              .leaveTypeId ||
            '',

          startDate:
            loadedDraft
              .startDate ||
            '',

          endDate:
            loadedDraft
              .endDate || '',

          reason:
            loadedDraft.reason ||
            '',
        });

        setAttachments(
          Array.isArray(
            loadedDraft
              .attachments,
          )
            ? loadedDraft
                .attachments
            : [],
        );

        setMessage({
          severity:
            'info',

          text:
            `Draft #${loadedDraft.id} was reset to its saved information.`,
        });

        return;
      }

      setFormData({
        ...emptyFormData,
      });

      setAttachments([]);

      setMessage(null);
    };

  const summaryItems = [
    [
      'Leave Type',

      selectedLeaveType
        ?.name ||
        'Not selected',
    ],
    [
      'Entitlement Year',

      entitlementYear,
    ],
    [
      'Minimum per Request',

      selectedLeaveType
        ? `${formatDays(
            selectedLeaveType.minimumDays,
          )} day(s)`
        : 'Not available',
    ],
    [
      'Maximum per Request',

      selectedLeaveType
        ? `${formatDays(
            selectedLeaveType.maximumDaysPerRequest,
          )} day(s)`
        : 'Not available',
    ],
    [
      'Attachment Rule',

      getAttachmentRuleText(
        selectedLeaveType,
      ),
    ],
    [
      'Total Entitlement',

      selectedLeaveType
        ? `${formatDays(
            selectedLeaveType.totalDays,
          )} day(s)`
        : 'Not available',
    ],
    [
      'Used Days',

      selectedLeaveType
        ? `${formatDays(
            selectedLeaveType.usedDays,
          )} day(s)`
        : 'Not available',
    ],
    [
      'Pending Days',

      selectedLeaveType
        ? `${formatDays(
            selectedLeaveType.pendingDays,
          )} day(s)`
        : 'Not available',
    ],
    [
      'Available Balance',

      selectedLeaveType
        ? `${formatDays(
            selectedLeaveType.availableDays,
          )} day(s)`
        : 'Not available',
    ],
    [
      'Requested Working Days',

      `${formatDays(
        requestedDays,
      )} day(s)`,
    ],
    [
      'Excluded Weekends',

      `${workingDaySummary.weekendDays} day(s)`,
    ],
    [
      'Excluded Holidays',

      `${workingDaySummary.holidayDays} day(s)`,
    ],
    [
      'Date Range',

      formData.startDate &&
      formData.endDate
        ? `${formData.startDate} to ${formData.endDate}`
        : 'Not selected',
    ],
    [
      'Attachments',

      `${attachments.length} file(s)`,
    ],
  ];

  const policyErrors = [
    errors.dateRange,
    errors.balance,
    errors.overlap,
    errors.policy,
  ].filter(Boolean);

  return (
    <LayoutComponent
      activeMenu="Leave Request"
    >
      <Box
        sx={{
          marginBottom:
            '28px',
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
          {isEditMode
            ? 'Edit Leave Request Draft'
            : 'Create Leave Request'}
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
          {isEditMode
            ? `Update Draft #${editRequestId} or submit it for approval.`
            : 'Create a draft or submit a new leave request.'}
        </Typography>
      </Box>

      {message && (
        <Alert
          severity={
            message.severity
          }
          onClose={() =>
            setMessage(null)
          }
          sx={{
            marginBottom:
              '24px',

            borderRadius:
              '8px',
          }}
        >
          {message.text}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={
          handleSubmit
        }
        noValidate
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            xl:
              'minmax(0, 1.7fr) minmax(320px, 1fr)',
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
                xs:
                  '20px',

                sm:
                  '24px',
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
              Leave Information
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
              Only leave types currently activated by HR can
              be submitted.
            </Typography>
          </Box>

          <Box
            sx={{
              padding: {
                xs:
                  '20px',

                sm:
                  '28px',
              },

              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'repeat(2, minmax(0, 1fr))',
              },

              gap:
                '22px',
            }}
          >
            <FormControl
              fullWidth
              required
              error={
                Boolean(
                  errors.leaveTypeId,
                )
              }
              sx={{
                gridColumn: {
                  xs:
                    'auto',

                  md:
                    '1 / -1',
                },
              }}
            >
              <InputLabel id="leave-type-label">
                Leave Type
              </InputLabel>

              <Select
                labelId="leave-type-label"
                value={
                  formData.leaveTypeId
                }
                label="Leave Type"
                onChange={(
                  event,
                ) =>
                  handleInputChange(
                    'leaveTypeId',

                    event.target
                      .value,
                  )
                }
                sx={{
                  borderRadius:
                    '8px',
                }}
              >
                {calculatedLeaveTypes.length >
                0 ? (
                  calculatedLeaveTypes.map(
                    (leaveType) => (
                      <MenuItem
                        key={
                          leaveType.id
                        }
                        value={
                          leaveType.id
                        }
                        disabled={
                          !leaveType
                            .isSelectable
                        }
                      >
                        {leaveType.name}{' '}

                        {leaveType.isSelectable
                          ? `— ${formatDays(
                              leaveType.availableDays,
                            )} day(s) available`
                          : '— Inactive (select another type)'}
                      </MenuItem>
                    ),
                  )
                ) : (
                  <MenuItem
                    disabled
                    value=""
                  >
                    No active leave types available
                  </MenuItem>
                )}
              </Select>

              <FormHelperText>
                {errors.leaveTypeId ||
                  (activeLeaveTypes.length >
                  0
                    ? `Available balance for ${entitlementYear}`
                    : 'HR has not enabled any leave types')}
              </FormHelperText>
            </FormControl>

            <TextField
              fullWidth
              required
              type="date"
              label="Start Date"
              value={
                formData.startDate
              }
              onChange={(
                event,
              ) =>
                handleInputChange(
                  'startDate',

                  event.target
                    .value,
                )
              }
              error={
                Boolean(
                  errors.startDate,
                )
              }
              helperText={
                errors.startDate
              }
              slotProps={{
                inputLabel: {
                  shrink:
                    true,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '8px',
                  },
              }}
            />

            <TextField
              fullWidth
              required
              type="date"
              label="End Date"
              value={
                formData.endDate
              }
              onChange={(
                event,
              ) =>
                handleInputChange(
                  'endDate',

                  event.target
                    .value,
                )
              }
              error={
                Boolean(
                  errors.endDate,
                )
              }
              helperText={
                errors.endDate
              }
              slotProps={{
                inputLabel: {
                  shrink:
                    true,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '8px',
                  },
              }}
            />

            {policyErrors.length >
              0 && (
              <Alert
                severity="error"
                sx={{
                  gridColumn: {
                    xs:
                      'auto',

                    md:
                      '1 / -1',
                  },

                  borderRadius:
                    '8px',
                }}
              >
                {policyErrors.map(
                  (
                    errorMessage,
                  ) => (
                    <Typography
                      key={
                        errorMessage
                      }
                      sx={{
                        fontSize:
                          '13px',

                        lineHeight:
                          1.7,
                      }}
                    >
                      •{' '}
                      {errorMessage}
                    </Typography>
                  ),
                )}
              </Alert>
            )}

            <Box
              sx={{
                gridColumn: {
                  xs:
                    'auto',

                  md:
                    '1 / -1',
                },

                display:
                  'grid',

                gridTemplateColumns: {
                  xs:
                    '1fr',

                  sm:
                    'repeat(3, 1fr)',
                },

                gap:
                  '12px',
              }}
            >
              {[
                [
                  'Working Days',
                  requestedDays,
                ],
                [
                  'Weekend Days',
                  workingDaySummary.weekendDays,
                ],
                [
                  'Holiday Days',
                  workingDaySummary.holidayDays,
                ],
              ].map(
                ([
                  label,
                  value,
                ]) => (
                  <Box
                    key={
                      label
                    }
                    sx={{
                      padding:
                        '14px 16px',

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
                          '#6B7280',

                        fontSize:
                          '11px',

                        fontWeight:
                          700,
                      }}
                    >
                      {label}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#111827',

                        fontSize:
                          '22px',

                        fontWeight:
                          800,

                        marginTop:
                          '4px',
                      }}
                    >
                      {formatDays(
                        value,
                      )}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>

            {workingDaySummary
              .excludedDates
              .length > 0 && (
              <Alert
                severity="info"
                sx={{
                  gridColumn: {
                    xs:
                      'auto',

                    md:
                      '1 / -1',
                  },

                  borderRadius:
                    '8px',
                }}
              >
                <Typography
                  sx={{
                    fontSize:
                      '13px',

                    fontWeight:
                      700,
                  }}
                >
                  Excluded from leave calculation
                </Typography>

                <Typography
                  sx={{
                    fontSize:
                      '12px',

                    lineHeight:
                      1.7,

                    marginTop:
                      '4px',
                  }}
                >
                  {workingDaySummary
                    .excludedDates
                    .map(
                      (
                        item,
                      ) =>
                        `${item.date} (${item.reason})`,
                    )
                    .join(', ')}
                </Typography>
              </Alert>
            )}

            <TextField
              fullWidth
              required
              multiline
              minRows={5}
              maxRows={8}
              label="Reason for Leave"
              placeholder="Enter the reason for your leave request"
              value={
                formData.reason
              }
              onChange={(
                event,
              ) =>
                handleInputChange(
                  'reason',

                  event.target
                    .value,
                )
              }
              error={
                Boolean(
                  errors.reason,
                )
              }
              helperText={
                errors.reason ||
                `${formData.reason.length}/500 characters`
              }
              slotProps={{
                htmlInput: {
                  maxLength:
                    500,
                },
              }}
              sx={{
                gridColumn: {
                  xs:
                    'auto',

                  md:
                    '1 / -1',
                },

                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '8px',
                  },
              }}
            />

            <Box
              sx={{
                gridColumn: {
                  xs:
                    'auto',

                  md:
                    '1 / -1',
                },
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
                Attachments
                {attachmentRequired
                  ? ' *'
                  : ''}
              </Typography>

              <Typography
                sx={{
                  color:
                    '#6B7280',

                  fontSize:
                    '12px',

                  lineHeight:
                    1.6,

                  marginTop:
                    '4px',
                }}
              >
                {getAttachmentRuleText(
                  selectedLeaveType,
                )}
                . PDF, JPG, JPEG or PNG; maximum 10 MB per
                file.
              </Typography>

              <Button
                component="label"
                variant="outlined"
                sx={{
                  height:
                    '42px',

                  marginTop:
                    '14px',

                  padding:
                    '0 18px',

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
                }}
              >
                + Select Files

                <input
                  hidden
                  multiple
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={
                    handleAttachmentChange
                  }
                />
              </Button>

              {errors.attachments && (
                <Typography
                  sx={{
                    color:
                      '#D32F2F',

                    fontSize:
                      '12px',

                    marginTop:
                      '8px',
                  }}
                >
                  {
                    errors.attachments
                  }
                </Typography>
              )}

              {attachments.length >
                0 && (
                <Box
                  sx={{
                    display:
                      'flex',

                    flexDirection:
                      'column',

                    gap:
                      '10px',

                    marginTop:
                      '16px',
                  }}
                >
                  {attachments.map(
                    (
                      attachment,
                      index,
                    ) => (
                      <Box
                        key={
                          attachment.id ||
                          `${attachment.name || attachment.fileName}-${attachment.size || attachment.fileSize}-${index}`
                        }
                        sx={{
                          padding:
                            '12px 14px',

                          display:
                            'flex',

                          alignItems:
                            'center',

                          justifyContent:
                            'space-between',

                          gap:
                            '14px',

                          backgroundColor:
                            '#F9FAFB',

                          border:
                            '1px solid #E5E7EB',

                          borderRadius:
                            '8px',
                        }}
                      >
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
                                '13px',

                              fontWeight:
                                700,

                              overflow:
                                'hidden',

                              textOverflow:
                                'ellipsis',

                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {attachment.name ||
                              attachment.fileName}
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#9CA3AF',

                              fontSize:
                                '11px',

                              marginTop:
                                '3px',
                            }}
                          >
                            {formatFileSize(
                              attachment.size ||
                                attachment.fileSize,
                            )}
                          </Typography>
                        </Box>

                        <Button
                          type="button"
                          onClick={() =>
                            handleRemoveAttachment(
                              attachment,
                            )
                          }
                          sx={{
                            color:
                              '#DC2626',

                            fontSize:
                              '12px',

                            fontWeight:
                              700,

                            textTransform:
                              'none',
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                    ),
                  )}
                </Box>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              padding: {
                xs:
                  '20px',

                sm:
                  '22px 28px',
              },

              display:
                'flex',

              justifyContent:
                'flex-end',

              flexDirection: {
                xs:
                  'column-reverse',

                sm:
                  'row',
              },

              gap:
                '12px',

              backgroundColor:
                '#F9FAFB',

              borderTop:
                '1px solid #E5E7EB',
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={() =>
                navigate(
                  `/${currentRole}/my-requests`,
                )
              }
              sx={{
                minWidth:
                  '100px',

                height:
                  '44px',

                color:
                  '#374151',

                borderColor:
                  '#D1D5DB',

                borderRadius:
                  '8px',

                fontWeight:
                  700,

                textTransform:
                  'none',
              }}
            >
              ← Back
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleReset
              }
              sx={{
                minWidth:
                  '100px',

                height:
                  '44px',

                color:
                  '#374151',

                borderColor:
                  '#D1D5DB',

                borderRadius:
                  '8px',

                fontWeight:
                  700,

                textTransform:
                  'none',
              }}
            >
              {isEditMode
                ? 'Reset Draft'
                : 'Clear'}
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleSaveDraft
              }
              sx={{
                minWidth:
                  '120px',

                height:
                  '44px',

                color:
                  theme.primary,

                borderColor:
                  theme.primary,

                borderRadius:
                  '8px',

                fontWeight:
                  700,

                textTransform:
                  'none',
              }}
            >
              {isEditMode
                ? 'Update Draft'
                : 'Save Draft'}
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{
                minWidth:
                  '145px',

                height:
                  '44px',

                backgroundColor:
                  theme.primary,

                color:
                  '#FFFFFF',

                borderRadius:
                  '8px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                boxShadow:
                  'none',

                '&:hover': {
                  backgroundColor:
                    theme.dark,

                  boxShadow:
                    'none',
                },
              }}
            >
              {isEditMode
                ? 'Submit Edited Draft'
                : 'Submit Request'}
            </Button>
          </Box>
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
                  '20px',

                sm:
                  '24px',
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
                  '17px',

                fontWeight:
                  800,
              }}
            >
              Request Summary
            </Typography>

            <Box
              sx={{
                display:
                  'flex',

                flexDirection:
                  'column',

                gap:
                  '18px',

                marginTop:
                  '22px',
              }}
            >
              {summaryItems.map(
                ([
                  label,
                  value,
                ]) => (
                  <Box
                    key={
                      label
                    }
                  >
                    <Typography
                      sx={{
                        color:
                          '#9CA3AF',

                        fontSize:
                          '11px',

                        fontWeight:
                          700,

                        textTransform:
                          'uppercase',

                        letterSpacing:
                          '0.5px',
                      }}
                    >
                      {label}
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
                          '4px',
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>

            <Box
              sx={{
                paddingTop:
                  '20px',

                marginTop:
                  '20px',

                borderTop:
                  '1px solid #E5E7EB',
              }}
            >
              <Chip
                label={
                  attachmentRequired
                    ? 'Attachment Required'
                    : 'Attachment Optional'
                }
                size="small"
                sx={{
                  backgroundColor:
                    attachmentRequired
                      ? '#FEF2F2'
                      : '#ECFDF5',

                  color:
                    attachmentRequired
                      ? '#B91C1C'
                      : '#047857',

                  borderRadius:
                    '999px',

                  fontSize:
                    '11px',

                  fontWeight:
                    700,
                }}
              />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              padding: {
                xs:
                  '20px',

                sm:
                  '24px',
              },

              backgroundColor:
                theme.soft,

              border:
                `1px solid ${
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
              Leave Request Rules
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
              Only active leave types configured by HR can be
              selected. Minimum and maximum working days,
              attachment rules, entitlement balance,
              overlapping requests, weekends and active
              organization holidays are checked before
              submission.
            </Typography>

            <Typography
              sx={{
                color:
                  theme.text ||
                  '#4B5563',

                fontSize:
                  '12px',

                lineHeight:
                  1.7,

                marginTop:
                  '12px',
              }}
            >
              Active leave types:{' '}
              {
                activeLeaveTypes.length
              }
              {' • '}
              Active holidays:{' '}
              {
                activeHolidayDates.length
              }
            </Typography>

            {selectedLeaveType && (
              <Typography
                sx={{
                  color:
                    theme.text ||
                    '#4B5563',

                  fontSize:
                    '12px',

                  lineHeight:
                    1.7,

                  marginTop:
                    '8px',
                }}
              >
                Selected rule: minimum{' '}
                {formatDays(
                  selectedLeaveType.minimumDays,
                )}{' '}
                day(s), maximum{' '}
                {formatDays(
                  selectedLeaveType.maximumDaysPerRequest,
                )}{' '}
                day(s) per request;{' '}
                {getAttachmentRuleText(
                  selectedLeaveType,
                ).toLowerCase()}
                .
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </LayoutComponent>
  );
}

export default RoleCreateLeaveRequestPage;
