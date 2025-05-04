import type { Page, Locator } from "@playwright/test";

/**
 * Klasa reprezentująca stronę główną aplikacji
 * Implementuje wzorzec Page Object Model
 */
export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly navigationMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.navigationMenu = page.getByRole("navigation");
  }

  /**
   * Przejście na stronę główną
   */
  async goto() {
    await this.page.goto("/");
  }

  /**
   * Sprawdzenie czy strona została załadowana
   */
  async isLoaded() {
    await this.heading.waitFor({ state: "visible" });
    return true;
  }

  /**
   * Kliknięcie w element nawigacji
   */
  async clickNavItem(name: string) {
    await this.navigationMenu.getByRole("link", { name }).click();
  }
}
