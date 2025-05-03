import type { APIRoute } from "astro";
import { z } from "zod";
import { GenerationService } from "@/lib/services/generation.service";
import { errorHandler } from "@/middleware/error-handler";

export const prerender = false;

const createGenerationSchema = z.object({
  number_of_days: z.number().min(1).max(14),
  calories_per_day: z.number().positive(),
  meals_per_day: z.number().int().positive(),
  preferred_cuisines: z.array(
    z.enum(["polish", "italian", "indian", "asian", "vegan", "vegetarian", "gluten-free", "keto", "paleo"])
  ),
});

export const POST: APIRoute = errorHandler(async ({ request, locals }) => {
  const body = await request.json();
  const data = createGenerationSchema.parse(body);

  const generationService = new GenerationService(locals.supabase);
  const responsePayload = await generationService.createGeneration(data);

  return new Response(JSON.stringify(responsePayload), { status: 202 });
});
