import { expect, test } from "@playwright/test";
import { hasAdminCredentials, loginAsAdmin } from "./utils/auth";

const timeSuffix = Date.now();

test.describe("EP-02 EP-03 EP-04 EP-05 Admin Ofertas", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasAdminCredentials, "Credenciales admin no configuradas");
    await loginAsAdmin(page);
  });

  test("CP-02-02 navega entre panel, ofertas, crear oferta y maestras", async ({ page }) => {
    await page.locator(".admin-sidebar-nav").getByRole("link", { name: "Maestras" }).click();
    await expect(page).toHaveURL(/\/admin\/maestras$/);
    await expect(page.getByText(/Maestras:/)).toBeVisible();

    await page.locator(".admin-sidebar-nav").getByRole("link", { name: "Ofertas" }).click();
    await expect(page).toHaveURL(/\/admin\/ofertas$/);
    await expect(page.getByRole("heading", { name: /Gestionar ofertas/i })).toBeVisible();

    await page.locator(".admin-sidebar-nav").getByRole("link", { name: "Crear oferta" }).click();
    await expect(page).toHaveURL(/\/admin\/crear-oferta$/);
    await expect(page.getByRole("heading", { name: /Crear oferta/i })).toBeVisible();

    await page.locator(".admin-sidebar-nav").getByRole("link", { name: "Postulaciones" }).click();
    await expect(page).toHaveURL(/\/admin\/postulaciones$/);
    await expect(page.getByRole("heading", { name: /Postulaciones/i })).toBeVisible();

    await page.locator(".admin-sidebar-nav").getByRole("link", { name: "Panel" }).click();
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("CP-03-01 crear oferta y CP-04-01 editar titulo", async ({ page }) => {
    const baseTitle = `QA Oferta E2E ${timeSuffix}`;
    const updatedTitle = `${baseTitle} EDIT`;

    await page.locator(".admin-sidebar-nav").getByRole("link", { name: "Crear oferta" }).click();
    await expect(page).toHaveURL(/\/admin\/crear-oferta$/);

    await page.locator('input[name="titulo"]').fill(baseTitle);
    await page.locator('select[name="tipoOportunidad"]').selectOption("PRACTICA");
    await page.locator('textarea[name="descripcion"]').fill(
      "Descripcion de prueba automatizada para validar creacion de oferta con minimo de caracteres.",
    );

    const depSelect = page.locator('select[name="dependenciaId"]');
    const depValue = await depSelect.locator("option").nth(1).getAttribute("value");
    await depSelect.selectOption(depValue || "");

    const catSelect = page.locator('select[name="categoriaId"]');
    const catValue = await catSelect.locator("option").nth(1).getAttribute("value");
    await catSelect.selectOption(catValue || "");

    await page.locator('input[name="contacto"]').fill("qa.practinexo@practinexo.edu.co");
    await page.locator('input[name="programaAcademico"]').fill("Ingeniería de Sistemas");
    await page.locator('input[name="areaInteres"]').fill("Desarrollo Web");
    await page.locator('input[name="disponibilidad"]').fill("Remoto");
    await page.locator('input[name="palabrasClave"]').fill("qa,e2e,playwright");

    await page.getByRole("button", { name: "Publicar oferta" }).click();
    await expect(page.getByText(/Oferta creada correctamente/i)).toBeVisible();

    await page.getByRole("listitem").filter({ hasText: baseTitle }).getByRole("button", { name: "Editar" }).click();
    await expect(page.getByRole("heading", { name: /Editar oferta/i })).toBeVisible();
    await page.locator('input[name="titulo"]').fill(updatedTitle);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText(/Oferta actualizada correctamente/i)).toBeVisible();
  });

  test("CP-05-02 eliminar oferta desde listado admin", async ({ page }) => {
    const deleteTitle = `QA Oferta Delete ${timeSuffix}`;

    await page.locator(".admin-sidebar-nav").getByRole("link", { name: "Crear oferta" }).click();
    await expect(page).toHaveURL(/\/admin\/crear-oferta$/);
    await page.locator('input[name="titulo"]').fill(deleteTitle);
    await page.locator('select[name="tipoOportunidad"]').selectOption("SERVICIO_SOCIAL");
    await page.locator('textarea[name="descripcion"]').fill(
      "Descripcion de prueba automatizada para validar eliminacion en flujo administrativo.",
    );

    const depSelect = page.locator('select[name="dependenciaId"]');
    const depValue = await depSelect.locator("option").nth(1).getAttribute("value");
    await depSelect.selectOption(depValue || "");

    const catSelect = page.locator('select[name="categoriaId"]');
    const catValue = await catSelect.locator("option").nth(1).getAttribute("value");
    await catSelect.selectOption(catValue || "");

    await page.locator('input[name="contacto"]').fill("qa.delete@practinexo.edu.co");
    await page.getByRole("button", { name: "Publicar oferta" }).click();
    await expect(page.getByText(/Oferta creada correctamente/i)).toBeVisible();

    const deleteRow = page.getByRole("listitem").filter({ hasText: deleteTitle });
    await deleteRow.getByRole("button", { name: "Eliminar" }).click();
    await deleteRow.getByRole("button", { name: "¿Confirmar?" }).click();
    await expect(page.getByText(/Oferta eliminada correctamente/i)).toBeVisible();
  });

  test("CP-03-02 crear oferta con fecha pasada muestra error visible", async ({ page }) => {
    await page.locator(".admin-sidebar-nav").getByRole("link", { name: "Crear oferta" }).click();
    await expect(page).toHaveURL(/\/admin\/crear-oferta$/);

    await page.locator('input[name="titulo"]').fill(`QA Fecha Pasada ${timeSuffix}`);
    await page.locator('select[name="tipoOportunidad"]').selectOption("PRACTICA");
    await page.locator('textarea[name="descripcion"]').fill(
      "Descripcion de prueba para validar el error visible cuando la fecha de cierre esta en el pasado.",
    );

    const depSelect = page.locator('select[name="dependenciaId"]');
    const depValue = await depSelect.locator("option").nth(1).getAttribute("value");
    await depSelect.selectOption(depValue || "");

    const catSelect = page.locator('select[name="categoriaId"]');
    const catValue = await catSelect.locator("option").nth(1).getAttribute("value");
    await catSelect.selectOption(catValue || "");

    await page.locator('input[name="contacto"]').fill("qa.fecha@practinexo.edu.co");

    const ayer = new Date(Date.now() - 86400000);
    const pad = (n) => String(n).padStart(2, "0");
    const valorPasado = `${ayer.getFullYear()}-${pad(ayer.getMonth() + 1)}-${pad(ayer.getDate())}T10:00`;
    await page.locator('input[name="fechaCierre"]').fill(valorPasado);

    await page.getByRole("button", { name: "Publicar oferta" }).click();
    await expect(
      page.getByText(/La fecha de cierre no puede ser anterior a la fecha actual/i),
    ).toBeVisible();
  });
});
