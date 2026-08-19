export async function openLogin(page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Iniciar sesión", exact: true }).click();
}

export async function openOfertas(page) {
  await page.goto("/");
  await page.locator(".student-nav").getByRole("link", { name: "Ofertas", exact: true }).click();
}

export async function openSugerencias(page) {
  await page.goto("/");
  await page.locator(".student-nav").getByRole("link", { name: "Sugerencias", exact: true }).click();
}
