import { ShoppingListService } from "@/lib/services/shopping-list.service";
import type { APIRoute } from "astro";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";

export const prerender = false;

const createShoppingListSchema = z.object({
  items: z
    .array(
      z
        .string({
          required_error: "Each list item must be a text",
          invalid_type_error: "Each list item must be a text",
        })
        .min(1, "List item cannot be empty")
        .max(200, "List item cannot be longer than 200 characters")
    )
    .min(1, "Shopping list must contain at least one item")
    .max(100, "Shopping list cannot contain more than 100 items"),
});

export type CreateShoppingListSchema = typeof createShoppingListSchema;

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const dietId = Number(params.id);
    if (!dietId || isNaN(dietId)) {
      return new Response(
        JSON.stringify({
          error: "VALIDATION_FAILED",
          details: "Invalid diet ID",
        }),
        { status: 400 }
      );
    }

    const rawData = await request.json();
    const validationResult = createShoppingListSchema.safeParse(rawData);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "VALIDATION_FAILED",
          details: fromZodError(validationResult.error).message,
        }),
        { status: 400 }
      );
    }

    const shoppingListService = new ShoppingListService(locals.supabase);
    return await shoppingListService.createShoppingList(dietId, validationResult.data);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "SERVER_ERROR",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500 }
    );
  }
};

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const dietId = Number(params.id);
    if (!dietId || isNaN(dietId)) {
      return new Response(
        JSON.stringify({
          error: "VALIDATION_FAILED",
          details: "Invalid diet ID",
        }),
        { status: 400 }
      );
    }

    const shoppingListService = new ShoppingListService(locals.supabase);
    return await shoppingListService.getShoppingList(dietId);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "SERVER_ERROR",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500 }
    );
  }
};
