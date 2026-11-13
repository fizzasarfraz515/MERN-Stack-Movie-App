import api from './api';

const unwrap = (response) => response.data;

export const register = (payload) => api.post('/auth/register', payload).then(unwrap);
export const login = (payload) => api.post('/auth/login', payload).then(unwrap);
export const getCurrentUser = () => api.get('/auth/me').then(unwrap);
