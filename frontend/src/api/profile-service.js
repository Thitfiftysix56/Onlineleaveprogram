import api from './axios.js';

export const getProfile = async () =>
  (await api.get('/profile')).data?.profile;

export const updateProfile = async (formData) =>
  (
    await api.put(
      '/profile',
      formData,
      {
        headers: {
          'Content-Type':
            'multipart/form-data',
        },
      },
    )
  ).data;
