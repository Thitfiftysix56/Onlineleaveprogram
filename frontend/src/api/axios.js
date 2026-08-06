import axios from 'axios';
import { translateThai } from '../i18n/thai.js';

const ACCESS_TOKEN_KEY =
  'online_leave_approval_access_token';

const AUTH_SESSION_KEY =
  'online_leave_approval_auth_session';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    '/api',

  timeout: 15000,

  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken =
      window.localStorage.getItem(
        ACCESS_TOKEN_KEY,
      );

    if (accessToken) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    if (typeof response.data?.message === 'string') {
      response.data.message = translateThai(response.data.message);
    }
    return response;
  },

  (error) => {
    if (typeof error.response?.data?.message === 'string') {
      error.response.data.message = translateThai(error.response.data.message);
    }
    const status =
      error.response?.status;

    if (status === 401) {
      window.localStorage.removeItem(
        ACCESS_TOKEN_KEY,
      );

      window.localStorage.removeItem(
        AUTH_SESSION_KEY,
      );

      if (
        window.location.pathname !==
        '/login'
      ) {
        window.location.replace(
          '/login',
        );
      }
    }

    return Promise.reject(error);
  },
);

export default api;
