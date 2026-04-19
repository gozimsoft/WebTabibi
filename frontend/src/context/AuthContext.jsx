// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("tabibi_token")) {
      setLoading(false);
      return;
    }
    api.auth.me()
      .then(d => setUser(d.user || d))
      .catch(() => localStorage.removeItem("tabibi_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (un, pw) => {
    const d = await api.auth.login({ username: un, password: pw });
    localStorage.setItem("tabibi_token", d.token);
    setUser(d.user || d);
    return d;
  };

  const register = async b => {
    const d = await api.auth.register(b);
    localStorage.setItem("tabibi_token", d.token);
    setUser(d.user || d);
    return d;
  };

  const logout = async () => {
    try { await api.auth.logout(); } catch { }
    localStorage.removeItem("tabibi_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
