import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateDietCommand } from "../../types";
import { createDiet } from "@/lib/api/dietService";

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

    const responsePayload = await createDiet(data, locals);

    return responsePayload;
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "SERVER_ERROR", details: err instanceof Error ? err.message : String(err) }),
      { status: 500 }
    );
  }
};
