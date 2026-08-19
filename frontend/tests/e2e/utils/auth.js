export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
export const STUDENT_EMAIL = process.env.E2E_STUDENT_EMAIL;
export const STUDENT_PASSWORD = process.env.E2E_STUDENT_PASSWORD;

export const hasAdminCredentials = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);
export const hasStudentCredentials = Boolean(STUDENT_EMAIL && STUDENT_PASSWORD);

import { openLogin } from "./navigation";

export async function loginAsAdmin(page) {
  if (!hasAdminCredentials) {
    throw new Error("Faltan E2E_ADMIN_EMAIL o E2E_ADMIN_PASSWORD en .env.e2e");
  }

  await openLogin(page);
  await page.getByRole("tab", { name: "Administrador" }).click();
  await page.getByLabel("Correo institucional").fill(ADMIN_EMAIL);
  await page.getByLabel("Contraseña", { exact: true }).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /Acceder al portal/i }).click();
  await page.waitForURL("**/admin");
}

export async function loginAsStudent(page) {
  if (!hasStudentCredentials) {
    throw new Error("Faltan E2E_STUDENT_EMAIL o E2E_STUDENT_PASSWORD en .env.e2e");
  }

  await openLogin(page);
  await page.getByRole("tab", { name: "Estudiante" }).click();
  await page.getByLabel("Correo").fill(STUDENT_EMAIL);
  await page.getByLabel("Contraseña", { exact: true }).fill(STUDENT_PASSWORD);
  await page.getByRole("button", { name: /Ingresar como estudiante/i }).click();
  await page.waitForURL("**/inicio-estudiante");
}
