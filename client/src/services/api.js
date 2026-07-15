import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // Only redirect if in admin routes
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Profile ──────────────────────────────────────────────────────────
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  uploadPhoto: (formData) =>
    api.post('/profile/upload-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadHero: (formData) =>
    api.post('/profile/upload-hero', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadResume: (formData) =>
    api.post('/profile/upload-resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteResume: () => api.delete('/profile/resume'),
};

// ── Skills ───────────────────────────────────────────────────────────
export const skillsAPI = {
  getAll: () => api.get('/skills'),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
  reorder: (skills) => api.put('/skills/reorder', { skills }),
};

// ── Projects ──────────────────────────────────────────────────────────
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (formData) =>
    api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    api.put(`/projects/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/projects/${id}`),
};

// ── Education ─────────────────────────────────────────────────────────
export const educationAPI = {
  getAll: () => api.get('/education'),
  create: (formData) => api.post('/education', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/education/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/education/${id}`),
};

// ── Certifications ────────────────────────────────────────────────────
export const certificationsAPI = {
  getAll: () => api.get('/certifications'),
  create: (formData) =>
    api.post('/certifications', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    api.put(`/certifications/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/certifications/${id}`),
};

// ── Social Links ──────────────────────────────────────────────────────
export const socialLinksAPI = {
  getAll: () => api.get('/social-links'),
  getAllAdmin: () => api.get('/social-links/all'),
  create: (data) => api.post('/social-links', data),
  update: (id, data) => api.put(`/social-links/${id}`, data),
  delete: (id) => api.delete(`/social-links/${id}`),
};

// ── Contact ───────────────────────────────────────────────────────────
export const contactAPI = {
  send: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  getStats: () => api.get('/contact/stats'),
  markRead: (id) => api.put(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`),
  reply: (id, data) => api.post(`/contact/${id}/reply`, data),
};

// ── Admin ─────────────────────────────────────────────────────────────
export const adminAPI = {
  login: (data) => api.post('/admin/login', data),
  getMe: () => api.get('/admin/me'),
  changePassword: (data) => api.put('/admin/change-password', data),
};

// ── Settings ──────────────────────────────────────────────────────────
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  uploadFavicon: (formData) =>
    api.post('/settings/upload-favicon', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── History ───────────────────────────────────────────────────────────
export const historyAPI = {
  getLogs: () => api.get('/history'),
  clearLogs: (ids) => api.delete('/history', { data: { ids } }),
};

export default api;
