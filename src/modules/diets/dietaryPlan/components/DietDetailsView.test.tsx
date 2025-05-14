import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DietDetailsView } from "./DietDetailsView";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { navigate } from "astro:transitions/client";
import { server } from "@/test/msw-server";
import { beforeEach } from "node:test";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock dla astro:transitions/client
vi.mock("astro:transitions/client", () => ({
  navigate: vi.fn(),
}));

describe("DietDetailsView", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  it("displays loading state when isLoading is true", () => {
    render(<DietDetailsView dietId={1} />);
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  it("displays diet details after data is loaded", async () => {
    render(<DietDetailsView dietId={1} />);

    await waitFor(() => {
      expect(screen.getByText("Twój Plan Diety")).toBeInTheDocument();
    });

    expect(screen.getByText(/Plan na 7 dni, 2000 kalorii dziennie/)).toBeInTheDocument();
    expect(screen.getByText(/Data rozpoczęcia:/)).toBeInTheDocument();
    expect(screen.getByText(/Data zakończenia:/)).toBeInTheDocument();
  });

  it("displays meal plan and shopping list in tabs", async () => {
    render(<DietDetailsView dietId={1} />);

    await waitFor(() => {
      expect(screen.getByText("Plan Posiłków")).toBeInTheDocument();
    });

    expect(screen.getByText("Lista Zakupów")).toBeInTheDocument();

    // Sprawdź zawartość zakładki z planem posiłków
    expect(screen.getByText("Dzień 1")).toBeInTheDocument();
    const mealElement = screen.getAllByText(/Śniadanie/)[0];
    expect(mealElement).toBeInTheDocument();
    expect(mealElement.closest('[data-testid="day-1-meals"]')).toBeInTheDocument();

    // Przełącz na zakładkę z listą zakupów
    const shoppingListTab = screen.getByText("Lista Zakupów");
    await userEvent.click(shoppingListTab);

    expect(screen.getByText("Produkty potrzebne do przygotowania wszystkich posiłków")).toBeInTheDocument();
    expect(screen.getByText("mąka")).toBeInTheDocument();
  });

  it("handles API errors and displays error toast", async () => {
    server.use(
      http.get("/api/diets/:id", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<DietDetailsView dietId={1} />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("redirects to diets page when no data is available", async () => {
    server.use(
      http.get("/api/diets/:id", () => {
        return HttpResponse.json(null);
      })
    );

    render(<DietDetailsView dietId={1} />);

    await waitFor(() => {
      expect(vi.mocked(navigate)).toHaveBeenCalledWith("/diets");
    });
  });

  it("handles 'New Diet' button click", async () => {
    render(<DietDetailsView dietId={1} />);

    await waitFor(() => {
      expect(screen.getByText("Nowa Dieta")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Nowa Dieta"));
    expect(vi.mocked(navigate)).toHaveBeenCalledWith("/diets/generate");
  });

  describe("Diet Archival", () => {
    beforeEach(() => {
      const portalRoot = document.createElement("div");
      portalRoot.setAttribute("id", "portal-root");
      document.body.appendChild(portalRoot);
    });

    afterEach(() => {
      // Clean up the portal root after each test
      document.body.querySelector("#portal-root")?.remove();
      cleanup();
    });

    it("displays archive button and opens confirmation dialog", async () => {
      render(<DietDetailsView dietId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId("archive-diet-button")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId("archive-diet-button"));

      expect(screen.getByText("Czy na pewno chcesz zarchiwizować tę dietę?")).toBeInTheDocument();
      expect(screen.getByTestId("cancel-archive-button")).toBeInTheDocument();
      expect(screen.getByTestId("confirm-archive-button")).toBeInTheDocument();
    });

    it("closes dialog when cancel button is clicked", async () => {
      render(<DietDetailsView dietId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId("archive-diet-button")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId("archive-diet-button"));
      await userEvent.click(screen.getByTestId("cancel-archive-button"));

      expect(screen.queryByText("Czy na pewno chcesz zarchiwizować tę dietę?")).not.toBeInTheDocument();
    });

    it("archives diet successfully and redirects to diets page", async () => {
      server.use(
        http.delete("/api/diets/:id", () => {
          return new HttpResponse(null, { status: 200 });
        })
      );

      render(<DietDetailsView dietId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId("archive-diet-button")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId("archive-diet-button"));
      await userEvent.click(screen.getByTestId("confirm-archive-button"));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Dieta została zarchiwizowana");
        expect(vi.mocked(navigate)).toHaveBeenCalledWith("/diets");
      });
    });

    it("handles archive error and displays error toast", async () => {
      server.use(
        http.delete("/api/diets/:id", () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      render(<DietDetailsView dietId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId("archive-diet-button")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId("archive-diet-button"));
      await userEvent.click(screen.getByTestId("confirm-archive-button"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Nie udało się zarchiwizować diety");
      });
    });

    it("disables confirm button during archiving process", async () => {
      let resolveArchive!: () => void;
      const archivePromise = new Promise<void>((resolve) => {
        resolveArchive = resolve;
      });

      server.use(
        http.delete("/api/diets/:id", async () => {
          await archivePromise;
          return new HttpResponse(null, { status: 200 });
        })
      );

      render(<DietDetailsView dietId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId("archive-diet-button")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId("archive-diet-button"));

      const confirmButton = screen.getByTestId("confirm-archive-button");
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
        expect(confirmButton).toHaveTextContent("Archiwizowanie...");
      });

      resolveArchive();
    });
  });
});
