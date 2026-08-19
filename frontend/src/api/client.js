import axios from "axios";

export const TOKEN_KEY = "token";
export const ADMIN_KEY = "admin";
export const ESTUDIANTE_KEY = "estudiante";

const baseURL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4500/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiBaseURL = baseURL;
export const apiOrigin = baseURL.replace(/\/api\/?$/, "");

// Construye una URL absoluta para recursos servidos por el backend (p. ej. /uploads/...).
export function uploadsUrl(relativePath) {
  if (!relativePath) return "";
  const path = String(relativePath);
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
}

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_KEY);
      sessionStorage.removeItem(ESTUDIANTE_KEY);
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_KEY);
  sessionStorage.removeItem(ESTUDIANTE_KEY);
}
