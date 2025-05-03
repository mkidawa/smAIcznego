import { DietService } from "@/lib/services/diet.service";
import type { APIRoute } from "astro";
import { errorHandler } from "@/middleware/error-handler";
import { ValidationError } from "@/lib/errors/api-error";

export const prerender = false;

export const GET: APIRoute = errorHandler(async ({ params, locals, url }) => {
  const id = Number(params.id);
  if (!id || isNaN(id)) {
    throw new ValidationError("Invalid ID provided");
  }

  const fetchByGeneration = url.searchParams.get("fetchByGeneration") === "true";
  const dietService = new DietService(locals.supabase);

  if (fetchByGeneration) {
    return await dietService.getDietByGenerationId(id);
  }
  return await dietService.getDiet(id);
});
