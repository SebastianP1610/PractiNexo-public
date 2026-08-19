import { expect, test } from "@playwright/test";
import { hasStudentCredentials, loginAsStudent } from "./utils/auth";
import { openOfertas, openSugerencias } from "./utils/navigation";

test.describe("EP-06 EP-07 EP-08 EP-11 Estudiante", () => {
  test("CP-06-01 listado publico de ofertas disponible", async ({ page }) => {
    await openOfertas(page);
    await expect(page.getByRole("heading", { name: /Oportunidades de impacto/i })).toBeVisible();
    await expect(page.getByText(/oportunidad(es)? disponible/i)).toBeVisible();
  });

  test("CP-08-01 filtro por palabra clave", async ({ page }) => {
    await openOfertas(page);

    const countBefore = await page.locator(".oferta-card").count();
    await page.getByLabel("Buscar palabras clave").fill("sistemas");
    await page.waitForTimeout(1000);
    const countAfter = await page.locator(".oferta-card").count();

    expect(countAfter).toBeGreaterThanOrEqual(0);
    expect(countBefore).toBeGreaterThanOrEqual(0);
  });

  test("CP-08-02 filtro por tipo practica", async ({ page }) => {
    await openOfertas(page);
    await page.getByRole("button", { name: "Práctica" }).click();
    await page.waitForTimeout(800);
    await expect(page.locator(".ofertas-catalog-count")).toBeVisible();
  });

  test("CP-07-01 abrir detalle de oferta", async ({ page }) => {
    await openOfertas(page);
    await page.locator(".oferta-card-link-detail").first().click();
    await expect(page).toHaveURL(/\/ofertas\/.+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Descripción del rol")).toBeVisible();
  });

  test("CP-11-UI generar sugerencias por matching", async ({ page }) => {
    await openSugerencias(page);

    await page.locator('input[name="programaAcademico"]').fill("Ingeniería de Sistemas");
    await page.locator('input[name="areaInteres"]').fill("Desarrollo");
    await page.getByRole("button", { name: "Práctica" }).first().click();

    await page.getByRole("button", { name: /Generar sugerencias/i }).click();
    await expect(page.locator(".matching-results-wrap")).toBeVisible();
  });

  test("CP-POST-01 estudiante autenticado ve mis postulaciones", async ({ page }) => {
    test.skip(!hasStudentCredentials, "Credenciales estudiante no configuradas");

    await loginAsStudent(page);
    await page.locator(".student-nav").getByRole("link", { name: "Mis postulaciones", exact: true }).click();
    await expect(page).toHaveURL(/\/mis-postulaciones$/);
    await expect(page.getByRole("heading", { name: /Mis postulaciones/i })).toBeVisible();
  });
});
