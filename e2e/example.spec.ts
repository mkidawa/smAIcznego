import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home-page";

test.describe("Przykładowy test strony głównej", () => {
  test("powinien wyświetlić stronę główną poprawnie", async ({ page }) => {
    const homePage = new HomePage(page);

    // Wejdź na stronę główną
    await homePage.goto();

    // Sprawdź czy tytuł strony jest poprawny
    await expect(page).toHaveTitle(/smAIcznego/);

    // Zrób zrzut ekranu do porównania wizualnego
    await expect(page).toHaveScreenshot("home-page.png");
  });
});
