import type { APIRoute } from "astro";
import { MealService } from "../../../../../lib/services/meal.service";
import { errorHandler } from "../../../../../middleware/error-handler";

export const POST: APIRoute = errorHandler(async ({ params, request, locals }) => {
  const dietId = Number(params.id);
  const data = await request.json();

  const mealService = new MealService(locals.supabase);
  const mealIds = await mealService.createMeals(dietId, data);

  return new Response(JSON.stringify({ meal_ids: mealIds }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
});

export const GET: APIRoute = errorHandler(async ({ params, locals }) => {
  const dietId = Number(params.id);
  const mealService = new MealService(locals.supabase);
  const meals = await mealService.getMealsByDietId(dietId);

  return new Response(JSON.stringify(meals), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
