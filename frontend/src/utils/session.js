import { TOKEN_KEY, ESTUDIANTE_KEY, ADMIN_KEY } from "../api/client";

function readStudentSession() {
  try {
    return Boolean(sessionStorage.getItem(TOKEN_KEY) && sessionStorage.getItem(ESTUDIANTE_KEY));
  } catch {
    return false;
  }
}

function readAdminSession() {
  try {
    return Boolean(sessionStorage.getItem(TOKEN_KEY) && sessionStorage.getItem(ADMIN_KEY));
  } catch {
    return false;
  }
}

function getAdmin() {
  try {
    const raw = sessionStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export { readStudentSession, readAdminSession, getAdmin };
