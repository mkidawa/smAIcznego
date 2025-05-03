import { GenerationService } from "@/lib/services/generation.service";
import type { APIRoute } from "astro";
import { errorHandler } from "@/middleware/error-handler";
import { ValidationError } from "@/lib/errors/api-error";

export const GET: APIRoute = errorHandler(async ({ params, locals }) => {
  const generationId = params.id;

  if (!generationId || isNaN(parseInt(generationId))) {
    throw new ValidationError("Parameter 'id' is required and must be a number");
  }

  const generationService = new GenerationService(locals.supabase);
  const generation = await generationService.getGeneration(parseInt(generationId));

  return new Response(JSON.stringify(generation), { status: 200 });
});
