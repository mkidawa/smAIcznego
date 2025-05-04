import { test, expect } from "@playwright/test";
import { DietGenerationPage } from "./page-objects/diet-generation.page";

test.describe("Diet Generation", () => {
  let dietGenerationPage: DietGenerationPage;

  test.beforeEach(async ({ page }) => {
    dietGenerationPage = new DietGenerationPage(page);
    await dietGenerationPage.goto();
  });

  test("should display diet generation form", async () => {
    await expect(dietGenerationPage.title).toBeVisible();
    await expect(dietGenerationPage.form).toBeVisible();
  });

  test("should handle diet generation process", async ({ page }) => {
    test.setTimeout(120000); // 2 minutes

    // Wypełnij formularz
    await page.getByTestId("days-input").fill("1");
    await page.getByTestId("calories-input").fill("2200");
    await page.getByTestId("meals-input").fill("2");

    // Sprawdź czy formularz jest widoczny
    const submitButton = page.getByTestId("submit-button");
    await expect(submitButton).toBeVisible();

    // Kliknij przycisk generowania
    await submitButton.click();

    // Poczekaj chwilę na aktualizację stanu
    await page.waitForTimeout(1000);

    // Sprawdź czy pojawił się tekst "Generowanie..."
    await expect(submitButton).toHaveText("Generowanie...");

    // Poczekaj na pojawienie się komponentu DietApproval (maksymalnie 120 sekund)
    await expect(page.getByTestId("diet-generate-approval")).toBeVisible({
      timeout: 120000,
    });

    // Sprawdź czy przyciski zatwierdzania/odrzucania są widoczne
    await expect(page.getByTestId("approve-button")).toBeVisible();
    await expect(page.getByTestId("reject-button")).toBeVisible();
  });
});
