import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('accessToken');
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
