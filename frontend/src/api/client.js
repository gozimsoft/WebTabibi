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
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!data.success) {
      const err = new Error(data.message || 'حدث خطأ في الخادم.');
      if (data.data) {
        Object.assign(err, data.data);
      }
      throw err;
    }
    return data.data ?? data;
  } catch (e) {
    if (e instanceof TypeError) throw new Error("تعذّر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
    throw e;
  }
}

// Broadcast helper for real-time cross-tab and in-app synchronization
export const notifyAppointmentSync = (detail = {}) => {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tabibi:appointment_sync', { detail }));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('tabibi_sync');
        bc.postMessage({ type: 'appointment_updated', detail, timestamp: Date.now() });
        bc.close();
      }
      try {
        localStorage.setItem('tabibi_sync_tick', Date.now().toString());
      } catch (e) {}
    }
  } catch (e) {
    console.error('Error broadcasting appointment sync:', e);
  }
};

// Auth
export const api = {
  auth: {
    register: (body) => request('POST', '/auth/register', body, false),
    login: (body) => request('POST', '/auth/login', body, false),
    logout: () => request('POST', '/auth/logout'),
    me: () => request('GET', '/auth/me'),
    forgotPassword: (body) => request('POST', '/auth/forgot-password', body, false),
    verifyOtp: (body) => request('POST', '/auth/verify-otp', body, false),
    verifyAccountEmail: (body) => request('POST', '/auth/verify-account-email', body, false),
    resetPassword: (body) => request('POST', '/auth/reset-password', body, false),
  },
  patient: {
    getProfile: () => request('GET', '/patients/profile'),
    updateProfile: (body) => request('PUT', '/patients/profile', body),
    // تغيير اسم المستخدم أو كلمة المرور — يتطلب كلمة المرور الحالية للتحقق من الهوية
    updateCredentials: (body) => request('PUT', '/patients/credentials', body),
    getAppointments: () => request('GET', '/patients/appointments'),
    getAttendingDoctor: () => request('GET', '/patients/attending-doctor'),
    setAttendingDoctor: (doctorId) => request('POST', '/patients/attending-doctor', { doctor_id: doctorId }),
    removeAttendingDoctor: () => request('DELETE', '/patients/attending-doctor'),
    getAttendingDoctorHistory: () => request('GET', '/patients/attending-doctor/history'),
    searchDoctors: (query = '') => request('GET', `/patients/attending-doctor/search?q=${encodeURIComponent(query)}`),
  },
  doctor: {
    getProfile: () => request('GET', '/doctors/profile'),
    getReasons: () => request('GET', '/doctors/reasons'),
    addReason: (body) => request('POST', '/doctors/reasons', body),
    deleteReason: (id) => request('DELETE', `/doctors/reasons/${id}`),
    getAppointments: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/doctor/appointments${qs ? '?' + qs : ''}`);
    },
    // Alias to prevent broken calls
    appointments: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/doctor/appointments${qs ? '?' + qs : ''}`);
    },
    getForManager: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/appointments/manager${qs ? '?' + qs : ''}`);
    },
    syncCheck: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/appointments/sync-check${qs ? '?' + qs : ''}`);
    },
    addAppointment: async (body) => {
      const res = await request('POST', '/appointments/manager/add', body);
      notifyAppointmentSync({ action: 'add' });
      return res;
    },
    updateAppointmentStatus: async (id, status) => {
      const res = await request('PUT', `/appointments/${id}/status`, { status });
      notifyAppointmentSync({ action: 'status_update', id, status });
      return res;
    },
    getAppointmentSettings: () => request('GET', '/doctors/appointment-settings'),
    createAppointmentSetting: (body) => request('POST', '/doctors/appointment-settings', body),
    updateAppointmentSetting: (id, body) => request('PUT', `/doctors/appointment-settings/${id}`, body),
    deleteAppointmentSetting: (id) => request('DELETE', `/doctors/appointment-settings/${id}`),
    getOffHours: () => request('GET', '/doctors/off-hours'),
    createOffHour: (body) => request('POST', '/doctors/off-hours', body),
    updateOffHour: (id, body) => request('PUT', `/doctors/off-hours/${id}`, body),
    deleteOffHour: (id) => request('DELETE', `/doctors/off-hours/${id}`),
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
    book: async (body) => {
      const res = await request('POST', '/appointments', body);
      notifyAppointmentSync({ action: 'book', body });
      return res;
    },
    getOne: (id) => request('GET', `/appointments/${id}`),
    cancel: async (id) => {
      const res = await request('DELETE', `/appointments/${id}`);
      notifyAppointmentSync({ action: 'cancel', id });
      return res;
    },
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
  superadmin: {
    listAccounts: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/superadmin/accounts${qs ? '?' + qs : ''}`);
    },
    getAccount: (id) => request('GET', `/superadmin/accounts/${id}`),
    updateAccount: (id, body) => request('PUT', `/superadmin/accounts/${id}`, body),
    toggleStatus: (id, body) => request('PUT', `/superadmin/accounts/${id}/status`, body),
    invalidateSessions: (id) => request('POST', `/superadmin/accounts/${id}/invalidate-sessions`, {}),
    resetPassword: (id) => request('POST', `/superadmin/accounts/${id}/reset-password`, {}),
    anonymize: (id) => request('DELETE', `/superadmin/accounts/${id}`),
    getStats: () => request('GET', '/superadmin/accounts/stats'),
  },
  clinicAppointments: {
    getDoctors: () => request('GET', '/clinic/doctors'),
    getAppointments: (params = {}) => {
      const q = new URLSearchParams();
      if (params.doctor_id) q.set('doctor_id', params.doctor_id);
      if (params.from) q.set('from', params.from);
      if (params.to) q.set('to', params.to);
      if (params.status !== undefined && params.status !== '') q.set('status', params.status);
      if (params.q) q.set('q', params.q);
      const qs = q.toString();
      return request('GET', `/clinic/appointments${qs ? `?${qs}` : ''}`);
    },
    book: (body) => request('POST', '/clinic/appointments/book', body),
    updateStatus: (id, body) => request('PUT', `/clinic/appointments/${id}/status`, body),
  },
};
