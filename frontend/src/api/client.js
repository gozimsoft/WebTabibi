// src/api/client.js
const BASE = (() => {
  if (typeof window === "undefined") return "https://tabibi.dz/api";

  const { hostname, port, protocol, origin } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    if (port === "5173") return "http://localhost:8000/api";
    return `${origin}/api`;
  }
  return "https://tabibi.dz/api";
})();

const getToken = () => localStorage.getItem("tabibi_token");

async function req(method, path, body, auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
  try {
    const r = await fetch(`${BASE}${path}`, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json();
    if (!d.success) throw new Error(d.message || (method === "GET" ? "Error loading data" : "Action failed"));
    return d.data ?? d;
  } catch (e) {
    if (e instanceof TypeError) throw new Error("Network error: cannot reach server");
    throw e;
  }
}

export const api = {
  auth: {
    register: b => req("POST", "/auth/register", b, false),
    login: b => req("POST", "/auth/login", b, false),
    logout: () => req("POST", "/auth/logout"),
    me: () => req("GET", "/auth/me"),
  },
  patient: {
    profile: () => req("GET", "/patients/profile"),
    update: b => req("PUT", "/patients/profile", b),
    appointments: () => req("GET", "/patients/appointments"),
    family: () => req("GET", "/patients/family"),
  },
  clinics: {
    search: p => req("GET", `/clinics?${new URLSearchParams(p)}`),
    one: id => req("GET", `/clinics/${id}`),
    doctor: (c, d) => req("GET", `/clinics/${c}/doctors/${d}`),
  },
  specialties: () => req("GET", "/specialties"),
  appointments: {
    slots: p => req("GET", `/appointments/available-slots?${new URLSearchParams(p)}`, null, false),
    book: b => req("POST", "/appointments", b),
    cancel: id => req("DELETE", `/appointments/${id}`),
  },
  verify: {
    send: b => req("POST", "/verify/send", b),
    confirm: b => req("POST", "/verify/confirm", b),
    status: () => req("GET", "/verify/status"),
  },
  chat: {
    threads: () => req("GET", "/chat/threads"),
    create: b => req("POST", "/chat/threads", b),
    messages: id => req("GET", `/chat/threads/${id}`),
    send: (id, b) => req("POST", `/chat/threads/${id}/messages`, b),
  },
  ratings: {
    add: b => req("POST", "/ratings", b),
    doctor: id => req("GET", `/ratings/doctor/${id}`),
  },
};
