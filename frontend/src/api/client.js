// src/api/client.js
const API_BASE = import.meta.env.VITE_API_URL || 'https://tabibi.dz';
const BASE_URL = import.meta.env.DEV ? '/api' : `${API_BASE}/api`;

const getToken = () => localStorage.getItem('tabibi_token');

async function request(method, path, body = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Erreur');
  return data.data ?? data;
}

// Auth
export const api = {
  auth: {
    register: (body) => request('POST', '/auth/register', body, false),
    login: (body) => request('POST', '/auth/login', body, false),
    logout: () => request('POST', '/auth/logout'),
    me: () => request('GET', '/auth/me'),
    forgotPassword: (body) => request('POST', '/auth/forgot-password', body, false),
    verifyOtp: (body) => request('POST', '/auth/verify-otp', body, false),
    resetPassword: (body) => request('POST', '/auth/reset-password', body, false),
  },
  patient: {
    getProfile: () => request('GET', '/patients/profile'),
    updateProfile: (body) => request('PUT', '/patients/profile', body),
    getAppointments: () => request('GET', '/patients/appointments'),
  },
  doctor: {
    getProfile: () => request('GET', '/doctors/profile'),
    getAppointments: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/doctor/appointments${qs ? '?' + qs : ''}`);
    },
    getForManager: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/appointments/manager${qs ? '?' + qs : ''}`);
    },
    addAppointment: (body) => request('POST', '/appointments/manager/add', body),
    updateAppointmentStatus: (id, status) => request('PUT', `/appointments/${id}/status`, { status }),
  },
  clinics: {
    search: (params) => request('GET', `/clinics?${new URLSearchParams(params)}`),
    getOne: (id) => request('GET', `/clinics/${id}`),
    getDoctorAtClinic: (cId, dId) => request('GET', `/clinics/${cId}/doctors/${dId}`),
  },
  specialties: () => request('GET', '/specialties'),
  wilayas: () => request('GET', '/wilayas'),
  appointments: {
    getSlots: (params) => request('GET', `/appointments/available-slots?${new URLSearchParams(params)}`),
    book: (body) => request('POST', '/appointments', body),
    getOne: (id) => request('GET', `/appointments/${id}`),
    cancel: (id) => request('DELETE', `/appointments/${id}`),
  },
  chat: {
    getThreads: () => request('GET', '/chat/threads'),
    createThread: (body) => request('POST', '/chat/threads', body),
    getMessages: (threadId) => request('GET', `/chat/threads/${threadId}`),
    sendMessage: (threadId, body) => request('POST', `/chat/threads/${threadId}/messages`, body),
  },
  ratings: {
    add: (body) => request('POST', '/ratings', body),
    getForDoctor: (id) => request('GET', `/ratings/doctor/${id}`),
  },
  notifications: {
    list: () => request('GET', '/notifications'),
    markAsRead: (id) => request('PUT', `/notifications/${id}/read`),
    markAllAsRead: () => request('PUT', '/notifications/read-all'),
    delete: (id) => request('DELETE', `/notifications/${id}`),
  },
};
