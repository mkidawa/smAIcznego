import { http, HttpResponse } from "msw";

// Przykładowa odpowiedź API
const exampleRecipes = [
  {
    id: 1,
    title: "Spaghetti Bolognese",
    description: "Klasyczne danie włoskie",
    ingredients: ["makaron", "mięso mielone", "pomidory", "cebula", "czosnek"],
  },
  {
    id: 2,
    title: "Pierogi ruskie",
    description: "Tradycyjne polskie danie",
    ingredients: ["mąka", "jajka", "ziemniaki", "twaróg", "cebula"],
  },
];

// Przykładowe diety
const exampleDiets = [
  {
    id: 1,
    number_of_days: 7,
    calories_per_day: 2000,
    created_at: "2024-03-20T12:00:00Z",
    end_date: "2024-03-27T12:00:00Z",
    status: "ready",
    preferred_cuisines: ["italian", "polish"],
  },
  {
    id: 2,
    number_of_days: 14,
    calories_per_day: 2500,
    created_at: "2024-03-21T12:00:00Z",
    end_date: "2024-04-04T12:00:00Z",
    status: "draft",
    preferred_cuisines: ["asian"],
  },
];

// Handlery dla MSW
export const handlers = [
  // GET - pobieranie listy diet
  http.get("/api/diets", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const perPage = Number(url.searchParams.get("per_page")) || 10;

    return HttpResponse.json({
      data: exampleDiets,
      page,
      per_page: perPage,
      total: exampleDiets.length,
    });
  }),

  // GET - pobieranie pojedynczej diety
  http.get("/api/diets/:id", ({ params }) => {
    const { id } = params;
    const diet = exampleDiets.find((diet) => diet.id === Number(id));

    if (!diet) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(diet);
  }),

  // GET - pobieranie listy przepisów
  http.get("/api/recipes", () => {
    return HttpResponse.json(exampleRecipes);
  }),

  // GET - pobieranie pojedynczego przepisu
  http.get("/api/recipes/:id", ({ params }) => {
    const { id } = params;
    const recipe = exampleRecipes.find((recipe) => recipe.id === Number(id));

    if (!recipe) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(recipe);
  }),

  // POST - dodawanie nowego przepisu
  http.post("/api/recipes", async ({ request }) => {
    const newRecipe = (await request.json()) as Record<string, unknown>;

    // Tutaj można dodać walidację

    return HttpResponse.json({ id: 3, ...newRecipe }, { status: 201 });
  }),
];
