import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateGenerationCommand } from "../../../types";
import { createGeneration } from "@/lib/api/generationService";

export const prerender = false;

const createGenerationSchema = z.object({
  number_of_days: z.number().min(1).max(14),
  calories_per_day: z.number().positive(),
  meals_per_day: z.number().int().positive(),
  preferred_cuisines: z.array(
    z.enum(["polish", "italian", "indian", "asian", "vegan", "vegetarian", "gluten-free", "keto", "paleo"])
  ),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parsowanie i walidacja danych wejściowych
    const body = await request.json();

    const parsed = createGenerationSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "VALIDATION_FAILED", details: parsed.error.flatten() }), {
        status: 400,
      });
    }
    const data: CreateGenerationCommand = parsed.data;

    const responsePayload = await createGeneration(data, locals);

    return new Response(JSON.stringify(responsePayload), { status: 202 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "SERVER_ERROR", details: err instanceof Error ? err.message : String(err) }),
      { status: 500 }
    );
  }
};
