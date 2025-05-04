import { type Page, type Locator, expect } from "@playwright/test";

export class DietsPage {
  readonly page: Page;
  readonly dietsViewContainer: Locator;
  readonly generateDietButton: Locator;
  readonly dietsList: Locator;
  readonly loadingState: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dietsViewContainer = page.getByTestId("diets-view");
    this.generateDietButton = page.getByRole("button", { name: "Wygeneruj Nową Dietę" });
    this.dietsList = page.getByTestId("diets-list");
    this.loadingState = page.getByTestId("loading-state");
    this.emptyState = page.getByTestId("empty-state");
  }

  async goto() {
    await this.page.goto("/diets");
  }

  async waitForLoaded() {
    await this.dietsViewContainer.waitFor({ state: "visible" });
    await this.loadingState.waitFor({ state: "hidden", timeout: 10000 });
  }

  async clickOnDiet(dietId: number) {
    await this.dietsList.getByTestId("diet-card").nth(dietId).click();
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  async expectDietsListVisible() {
    await expect(this.dietsList).toBeVisible();
  }
}
