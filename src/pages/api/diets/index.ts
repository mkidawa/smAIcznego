import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateDietCommand } from "../../../types";
import { DietService } from "@/lib/services/diet.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parsowanie i walidacja danych wejściowych
    const body = await request.json();
    const createDietSchema = z.object({
      number_of_days: z.number().min(1).max(14),
      calories_per_day: z.number().positive(),
      preferred_cuisines: z.array(
        z.enum(["polish", "italian", "indian", "asian", "vegan", "vegetarian", "gluten-free", "keto", "paleo"])
      ),
      generation_id: z.number(),
    });
    const parsed = createDietSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "VALIDATION_FAILED", details: parsed.error.flatten() }), {
        status: 400,
      });
    }
    const data: CreateDietCommand = parsed.data;

    const dietService = new DietService(locals.supabase);
    return await dietService.createDiet(data);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "SERVER_ERROR", details: err instanceof Error ? err.message : String(err) }),
      { status: 500 }
    );
  }
};

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const perPageParam = url.searchParams.get("per_page");

    // Validate and parse pagination parameters
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const perPage = perPageParam ? parseInt(perPageParam, 10) : 10;

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return new Response(
        JSON.stringify({
          error: "VALIDATION_FAILED",
          details: "Page number must be a positive integer",
        }),
        { status: 400 }
      );
    }

    if (isNaN(perPage) || perPage < 1 || perPage > 50) {
      return new Response(
        JSON.stringify({
          error: "VALIDATION_FAILED",
          details: "Items per page must be between 1 and 50",
        }),
        { status: 400 }
      );
    }

    const dietService = new DietService(locals.supabase);
    return await dietService.getDiets(page, perPage);
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
