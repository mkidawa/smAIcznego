import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Rozszerzone opcje renderowania
 */
type CustomRenderOptions = Omit<RenderOptions, "wrapper">;

/**
 * Renderuje komponent do testów z potrzebnymi providerami
 */
function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      // Można dodać tutaj providery, np. ThemeProvider, jeśli są potrzebne
      ...options,
    }),
  };
}

// Re-eksportujemy wszystko
export * from "@testing-library/react";

// Nadpisujemy render naszą własną implementacją
export { customRender as render };
