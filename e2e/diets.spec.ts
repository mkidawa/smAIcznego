import { test } from "@playwright/test";
import { DietsPage } from "./page-objects/diets-page";
import { DietDetailsPage } from "./page-objects/diet-details-page";

test.describe("Diety - przepływ użytkownika", () => {
  let dietsPage: DietsPage;
  let dietDetailsPage: DietDetailsPage;

  test.beforeEach(async ({ page }) => {
    dietsPage = new DietsPage(page);
    dietDetailsPage = new DietDetailsPage(page);
  });

  test("powinien wyświetlić listę diet i przejść do szczegółów", async () => {
    await dietsPage.goto();
    await dietsPage.waitForLoaded();
    await dietsPage.expectDietsListVisible();

    // Kliknij w pierwszą dietę
    await dietsPage.clickOnDiet(0);

    // Sprawdź widok szczegółów
    await dietDetailsPage.waitForLoaded();

    // Sprawdź czy pierwszy dzień jest widoczny
    await dietDetailsPage.expectDayMealsVisible(1);

    // Przełącz na listę zakupów
    await dietDetailsPage.switchToShoppingList();

    // Wróć do planu posiłków
    await dietDetailsPage.switchToPlanTab();
  });
});
