// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tabibi_token');
    if (token) {
      api.auth.me()
        .then(data => { setUser(data); setProfile(data.profile); })
        .catch(() => localStorage.removeItem('tabibi_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await api.auth.login({ username, password });
    localStorage.setItem('tabibi_token', data.token);
    setUser(data);
    setProfile(data.profile);
    return data;
  };

  const register = async (body) => {
    const data = await api.auth.register(body);
    localStorage.setItem('tabibi_token', data.token);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await api.auth.logout(); } catch {}
    localStorage.removeItem('tabibi_token');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
