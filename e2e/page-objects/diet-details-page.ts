import { type Page, type Locator, expect } from "@playwright/test";

export class DietDetailsPage {
  readonly page: Page;
  readonly detailsContainer: Locator;
  readonly loadingState: Locator;
  readonly planTab: Locator;
  readonly shoppingListTab: Locator;
  readonly generateNewDietButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.detailsContainer = page.getByTestId("diet-details");
    this.loadingState = page.getByTestId("loading-state");
    this.planTab = page.getByRole("tab", { name: "Plan Posiłków" });
    this.shoppingListTab = page.getByRole("tab", { name: "Lista Zakupów" });
    this.generateNewDietButton = page.getByRole("button", { name: "Nowa Dieta" });
  }

  async goto(dietId: number) {
    await this.page.goto(`/diets/${dietId}`);
  }

  async waitForLoaded() {
    await this.detailsContainer.waitFor({ state: "visible" });
    await this.loadingState.waitFor({ state: "hidden", timeout: 10000 });
  }

  async switchToShoppingList() {
    await this.shoppingListTab.click();
  }

  async switchToPlanTab() {
    await this.planTab.click();
  }

  async getDayMeals(dayNumber: number) {
    return this.page.getByTestId(`day-${dayNumber}-meals`);
  }

  async expectDayMealsVisible(dayNumber: number) {
    const dayMeals = await this.getDayMeals(dayNumber);
    await expect(dayMeals).toBeVisible();
  }
}
