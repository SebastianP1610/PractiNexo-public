import { expect, test } from "@playwright/test";
import {
  ADMIN_PASSWORD,
  STUDENT_PASSWORD,
  hasAdminCredentials,
  hasStudentCredentials,
  loginAsAdmin,
  loginAsStudent,
} from "./utils/auth";
import { openLogin } from "./utils/navigation";

test.describe("EP-01 Autenticacion", () => {
  test("CP-01-08 redirige a login cuando se entra a /admin sin sesion", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      window.history.pushState({}, "", "/admin");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Bienvenido de nuevo")).toBeVisible();
  });

  test("CP-01-01 login admin correcto", async ({ page }) => {
    test.skip(!hasAdminCredentials, "Credenciales admin no configuradas");

    await loginAsAdmin(page);
    await expect(page.getByText("Panel de administración")).toBeVisible();
    await expect(page.locator(".admin-sidebar-nav").getByRole("link", { name: "Maestras", exact: true })).toBeVisible();
    await expect(page.locator(".admin-sidebar-nav").getByRole("link", { name: "Ofertas", exact: true })).toBeVisible();
  });

  test("CP-01-02 login admin con contrasena incorrecta", async ({ page }) => {
    test.skip(!hasAdminCredentials, "Credenciales admin no configuradas");

    await openLogin(page);
    await page.getByRole("tab", { name: "Administrador" }).click();
    await page.getByLabel("Correo institucional").fill(process.env.E2E_ADMIN_EMAIL || "");
    await page.getByLabel("Contraseña", { exact: true }).fill(`${ADMIN_PASSWORD}_bad`);
    await page.getByRole("button", { name: /Acceder al portal/i }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(/Credenciales/i)).toBeVisible();
  });

  test("CP-01-STU login estudiante correcto", async ({ page }) => {
    test.skip(!hasStudentCredentials, "Credenciales estudiante no configuradas");

    await loginAsStudent(page);
    await expect(page.getByRole("link", { name: "Mis postulaciones" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
  });

  test("CP-01-STU login estudiante con contrasena incorrecta", async ({ page }) => {
    test.skip(!hasStudentCredentials, "Credenciales estudiante no configuradas");

    await openLogin(page);
    await page.getByRole("tab", { name: "Estudiante" }).click();
    await page.getByLabel("Correo").fill(process.env.E2E_STUDENT_EMAIL || "");
    await page.getByLabel("Contraseña", { exact: true }).fill(`${STUDENT_PASSWORD}_bad`);
    await page.getByRole("button", { name: /Ingresar como estudiante/i }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(/Credenciales/i)).toBeVisible();
  });
});
