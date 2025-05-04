import { type Page, type Locator } from "@playwright/test";

export interface DietFormData {
  caloriesPerDay: number;
  numberOfDays: number;
  preferredCuisines: string[];
}

export class DietGenerationPage {
  readonly page: Page;
  readonly title: Locator;
  readonly form: Locator;
  readonly progressBar: Locator;
  readonly approvalView: Locator;
  readonly errorAlert: Locator;
  readonly caloriesInput: Locator;
  readonly daysInput: Locator;
  readonly cuisinesInput: Locator;
  readonly submitButton: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("diet-generate-title");
    this.form = page.getByTestId("diet-generate-form");
    this.progressBar = page.getByTestId("diet-generate-progress");
    this.approvalView = page.getByTestId("diet-generate-approval");
    this.errorAlert = page.getByTestId("diet-generate-error");

    // Zakładamy, że te selektory zostaną dodane do formularza
    this.caloriesInput = page.getByTestId("calories-input");
    this.daysInput = page.getByTestId("days-input");
    this.cuisinesInput = page.getByTestId("cuisines-input");
    this.submitButton = page.getByTestId("submit-button");
    this.approveButton = page.getByTestId("approve-button");
    this.rejectButton = page.getByTestId("reject-button");
  }

  async goto() {
    await this.page.goto("/diets/generate");
  }

  async fillForm(data: DietFormData) {
    await this.caloriesInput.fill(data.caloriesPerDay.toString());
    await this.daysInput.fill(data.numberOfDays.toString());

    for (const cuisine of data.preferredCuisines) {
      await this.cuisinesInput.click();
      await this.page.getByText(cuisine).click();
    }
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async approveDiet() {
    await this.approveButton.click();
  }

  async rejectDiet() {
    await this.rejectButton.click();
  }
}
