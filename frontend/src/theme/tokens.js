export const colorTokens = {
  text: {
    primary: '#0F172A',
    secondary: '#334155',
    muted: '#475569',
    disabled: '#94A3B8',
    inverse: '#FFFFFF',
  },

  background: '#EEF2F7',

  surface: '#FFFFFF',

  surfaceSubtle: '#F1F5F9',

  border: '#CBD5E1',

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


export const roleAccentTokens = {
  /*
   * =========================
   * EMPLOYEE — BLUE
   * =========================
   */
  employee: {
    primary: '#2563EB',

    dark: '#1D4ED8',

    soft: '#DBEAFE',

    border: '#93C5FD',

    text: '#1E3A8A',

    /*
     * พื้นหลัง Main Content
     * อ่อนลงจากเวอร์ชันก่อน
     */
    pageBackground:
      'linear-gradient(135deg, #E7EFFA 0%, #F2F6FB 50%, #E2ECF8 100%)',

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

    soft: '#EDE9FE',

    border: '#C4B5FD',

    text: '#5B21B6',

    /*
     * พื้นหลัง Main Content
     */
    pageBackground:
      'linear-gradient(135deg, #F0EBF9 0%, #F7F5FB 50%, #EBE4F7 100%)',

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

    soft: '#D1FAE5',

    border: '#6EE7B7',

    text: '#065F46',

    /*
     * พื้นหลัง Main Content
     */
    pageBackground:
      'linear-gradient(135deg, #E7F3ED 0%, #F2F7F4 50%, #E1F0E8 100%)',

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

    soft: '#FFEDD5',

    border: '#FDBA74',

    text: '#9A3412',

    /*
     * พื้นหลัง Main Content
     */
    pageBackground:
      'linear-gradient(135deg, #F8EEE6 0%, #FBF7F3 50%, #F5E9DF 100%)',

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
  control: 8,

  surface: 10,

  dialog: 12,

  pill: 999,
});


export const shadowTokens = Object.freeze({
  none:
    'none',

  subtle:
    '0 1px 3px rgba(15, 23, 42, 0.08)',

  floating:
    '0 10px 28px rgba(15, 23, 42, 0.14)',
});