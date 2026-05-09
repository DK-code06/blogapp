import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data: { username: string; email: string; password: string }) => API.post('/auth/register', data),
  login: (data: { email: string; password: string }) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

export const postAPI = {
  getAll: (params?: { page?: number; limit?: number; feed?: boolean }) => API.get('/posts', { params }),
  getOne: (id: string) => API.get(`/posts/${id}`),
  create: (data: FormData) => API.post('/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => API.put(`/posts/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => API.delete(`/posts/${id}`),
  like: (id: string) => API.post(`/posts/${id}/like`),
  getUserPosts: (userId: string) => API.get(`/posts/user/${userId}`),
};

export const userAPI = {
  getOne: (id: string) => API.get(`/users/${id}`),
  update: (data: FormData) => API.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  follow: (id: string) => API.post(`/users/${id}/follow`),
  search: (q: string) => API.get('/users/search', { params: { q } }),
};

export const commentAPI = {
  getAll: (postId: string) => API.get(`/comments/post/${postId}`),
  create: (postId: string, data: { content: string; parentComment?: string }) => API.post(`/comments/post/${postId}`, data),
  like: (id: string) => API.post(`/comments/${id}/like`),
  delete: (id: string) => API.delete(`/comments/${id}`),
};

export default API;
