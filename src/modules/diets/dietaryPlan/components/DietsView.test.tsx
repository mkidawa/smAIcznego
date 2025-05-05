import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DietsView } from "./DietsView";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { navigate } from "astro:transitions/client";
import { server } from "@/test/msw-server";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("DietsView", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  it("displays list of diets after loading", async () => {
    render(<DietsView />);

    // Check if loading state is displayed
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();

    // Wait for diets to load
    await waitFor(() => {
      expect(screen.getByTestId("diets-list")).toBeInTheDocument();
    });

    // Check if all diets are displayed
    const dietCards = screen.getAllByTestId("diet-card");
    expect(dietCards).toHaveLength(2);

    // Check first diet details
    expect(screen.getByText("Plan 7-dniowy")).toBeInTheDocument();
    expect(screen.getByText("2000 kcal dziennie")).toBeInTheDocument();
    expect(screen.getByText("Gotowa")).toBeInTheDocument();
  });

  it("displays empty state when there are no diets", async () => {
    // Override handler before rendering
    server.use(
      http.get("/api/diets", () => {
        return HttpResponse.json({
          data: [],
          page: 1,
          per_page: 10,
          total: 0,
        });
      })
    );

    render(<DietsView />);

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    // Check empty state
    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    const emptyState = screen.getByTestId("empty-state");
    expect(emptyState).toHaveTextContent("Brak Diet");
    expect(emptyState).toHaveTextContent("Nie masz jeszcze żadnych wygenerowanych diet");
    expect(screen.getByText("Wygeneruj Pierwszą Dietę")).toBeInTheDocument();
  });

  it("handles errors during diet loading", async () => {
    // Override handler before rendering
    server.use(
      http.get("/api/diets", () => {
        return new HttpResponse(null, {
          status: 500,
          statusText: "Internal Server Error",
        });
      })
    );

    render(<DietsView />);

    // Wait for toast.error call
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("redirects to new diet generation after button click", async () => {
    const user = userEvent.setup();
    render(<DietsView />);

    await waitFor(() => {
      expect(screen.getByText("Wygeneruj Nową Dietę")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Wygeneruj Nową Dietę"));

    expect(navigate).toHaveBeenCalledWith("/diets/generate");
  });

  it("displays appropriate diet status", async () => {
    render(<DietsView />);

    await waitFor(() => {
      expect(screen.getByTestId("diets-list")).toBeInTheDocument();
    });

    // Check if statuses are displayed correctly
    expect(screen.getByText("Gotowa")).toBeInTheDocument();
    expect(screen.getByText("W przygotowaniu")).toBeInTheDocument();
  });

  it("displays preferred cuisines", async () => {
    render(<DietsView />);

    await waitFor(() => {
      expect(screen.getByTestId("diets-list")).toBeInTheDocument();
    });

    // Check if cuisines are displayed
    expect(screen.getByText("Włoska")).toBeInTheDocument();
    expect(screen.getByText("Polska")).toBeInTheDocument();
    expect(screen.getByText("Azjatycka")).toBeInTheDocument();
  });
});
