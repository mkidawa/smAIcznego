import { ShoppingListService } from "@/lib/services/shopping-list.service";
import type { APIRoute } from "astro";
import { errorHandler } from "@/middleware/error-handler";

export const POST: APIRoute = errorHandler(async ({ params, request, locals }) => {
  const dietId = Number(params.id);
  const data = await request.json();

  const shoppingListService = new ShoppingListService(locals.supabase);
  return await shoppingListService.createShoppingList(dietId, data);
});

export const GET: APIRoute = errorHandler(async ({ params, locals }) => {
  const dietId = Number(params.id);
  const shoppingListService = new ShoppingListService(locals.supabase);
  return await shoppingListService.getShoppingList(dietId);
});
