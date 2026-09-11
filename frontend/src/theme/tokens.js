export const colorTokens = {
  text: {
    primary: '#0F172A',
    secondary: '#334155',
    muted: '#475569',
    disabled: '#94A3B8',
    inverse: '#FFFFFF',
  },

  background: '#F2F5F9',

  surface: '#FFFFFF',

  surfaceSubtle: '#F1F5F9',

  border: '#D8E0EA',

  borderStrong: '#94A3B8',

  status: {
    success: {
      main: '#15803D',
      soft: '#DCFCE7',
      border: '#86EFAC',
    },

    warning: {
      main: '#A16207',
      soft: '#FEF3C7',
      border: '#FCD34D',
    },

    error: {
      main: '#B42318',
      soft: '#FEE2E2',
      border: '#FCA5A5',
    },

    info: {
      main: '#1D4ED8',
      soft: '#DBEAFE',
      border: '#93C5FD',
    },
  },
};

export const appPageBackground = `
  radial-gradient(circle at 12% 18%, rgba(96, 165, 250, 0.22), transparent 34%),
  radial-gradient(circle at 86% 14%, rgba(167, 139, 250, 0.20), transparent 32%),
  radial-gradient(circle at 16% 88%, rgba(52, 211, 153, 0.18), transparent 32%),
  radial-gradient(circle at 88% 86%, rgba(251, 191, 36, 0.18), transparent 34%),
  #F6F8FC
`;


export const roleAccentTokens = {
  /*
   * =========================
   * EMPLOYEE — BLUE
   * =========================
   */
  employee: {
    primary: '#2563EB',

    dark: '#1D4ED8',

    secondary: '#4F46E5',

    soft: '#DBEAFE',

    border: '#93C5FD',

    text: '#1E3A8A',

    /*
     * พื้นหลัง Main Content
     * อ่อนลงจากเวอร์ชันก่อน
     */
    pageBackground:
      'radial-gradient(circle at 86% 6%, rgba(79, 70, 229, 0.09), transparent 28%), radial-gradient(circle at 12% 88%, rgba(6, 182, 212, 0.08), transparent 30%), linear-gradient(145deg, #F7FAFF 0%, #F3F7FC 55%, #F7F9FD 100%)',

    /*
     * Sidebar
     */
    sidebarBackground:
      'linear-gradient(180deg, #F8FBFF 0%, #F1F6FD 100%)',

    /*
     * ส่วนหัว Sidebar
     */
    brandGradient:
      'linear-gradient(145deg, #3B82F6 0%, #2563EB 48%, #1D4ED8 100%)',

    /*
     * Profile Card
     */
    profileBackground:
      'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',

    /*
     * Menu Hover
     */
    hoverBackground:
      '#E8F1FF',
  },


  /*
   * =========================
   * SUPERVISOR — PURPLE
   * =========================
   */
  supervisor: {
    primary: '#7C3AED',

    dark: '#6D28D9',

    secondary: '#4F46E5',

    soft: '#EDE9FE',

    border: '#C4B5FD',

    text: '#5B21B6',

    /*
     * พื้นหลัง Main Content
     */
    pageBackground:
      'radial-gradient(circle at 86% 6%, rgba(124, 58, 237, 0.10), transparent 28%), radial-gradient(circle at 12% 88%, rgba(79, 70, 229, 0.07), transparent 30%), linear-gradient(145deg, #FBF9FF 0%, #F6F5FC 55%, #FAF9FD 100%)',

    /*
     * Sidebar
     */
    sidebarBackground:
      'linear-gradient(180deg, #FCFAFF 0%, #F6F2FC 100%)',

    /*
     * ส่วนหัว Sidebar
     */
    brandGradient:
      'linear-gradient(145deg, #8B5CF6 0%, #7C3AED 48%, #6D28D9 100%)',

    /*
     * Profile Card
     */
    profileBackground:
      'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',

    /*
     * Menu Hover
     */
    hoverBackground:
      '#F1ECFF',
  },


  /*
   * =========================
   * HR — GREEN
   * =========================
   */
  hr: {
    primary: '#059669',

    dark: '#047857',

    secondary: '#0F766E',

    soft: '#D1FAE5',

    border: '#6EE7B7',

    text: '#065F46',

    /*
     * พื้นหลัง Main Content
     */
    pageBackground:
      'radial-gradient(circle at 86% 6%, rgba(5, 150, 105, 0.09), transparent 28%), radial-gradient(circle at 12% 88%, rgba(13, 148, 136, 0.07), transparent 30%), linear-gradient(145deg, #F7FCFA 0%, #F3F9F6 55%, #F8FBFA 100%)',

    /*
     * Sidebar
     */
    sidebarBackground:
      'linear-gradient(180deg, #F8FCFA 0%, #EFF8F4 100%)',

    /*
     * ส่วนหัว Sidebar
     */
    brandGradient:
      'linear-gradient(145deg, #10B981 0%, #059669 48%, #047857 100%)',

    /*
     * Profile Card
     */
    profileBackground:
      'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',

    /*
     * Menu Hover
     */
    hoverBackground:
      '#E3F8EE',
  },


  /*
   * =========================
   * ADMIN — ORANGE
   * =========================
   */
  admin: {
    primary: '#EA580C',

    dark: '#C2410C',

    secondary: '#D97706',

    soft: '#FFEDD5',

    border: '#FDBA74',

    text: '#9A3412',

    /*
     * พื้นหลัง Main Content
     */
    pageBackground:
      'radial-gradient(circle at 86% 6%, rgba(234, 88, 12, 0.09), transparent 28%), radial-gradient(circle at 12% 88%, rgba(217, 119, 6, 0.07), transparent 30%), linear-gradient(145deg, #FFFBF7 0%, #FAF7F3 55%, #FCFAF8 100%)',

    /*
     * Sidebar
     */
    sidebarBackground:
      'linear-gradient(180deg, #FFFBF8 0%, #FCF4ED 100%)',

    /*
     * ส่วนหัว Sidebar
     */
    brandGradient:
      'linear-gradient(145deg, #F97316 0%, #EA580C 48%, #C2410C 100%)',

    /*
     * Profile Card
     */
    profileBackground:
      'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',

    /*
     * Menu Hover
     */
    hoverBackground:
      '#FFF0E2',
  },
};


export const spacingTokens = Object.freeze({
  xs: 4,

  sm: 8,

  md: 12,

  lg: 16,

  xl: 20,

  '2xl': 24,

  '3xl': 32,

  '4xl': 40,
});


export const radiusTokens = Object.freeze({
  control: 11,

  surface: 16,

  dialog: 18,

  pill: 999,
});


export const shadowTokens = Object.freeze({
  none:
    'none',

  subtle:
    '0 1px 2px rgba(15, 23, 42, 0.035), 0 8px 24px rgba(15, 23, 42, 0.045)',

  floating:
    '0 18px 44px rgba(15, 23, 42, 0.10)',
});
