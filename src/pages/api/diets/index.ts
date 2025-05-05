import type { APIRoute } from "astro";
import { DietService } from "@/lib/services/diet.service";
import { errorHandler } from "@/middleware/error-handler";
import { ValidationError } from "@/lib/errors/api-error";

export const POST: APIRoute = errorHandler(async ({ request, locals }) => {
  const body = await request.json();
  const dietService = new DietService(locals.supabase);
  return await dietService.createDiet(body);
});

export const GET: APIRoute = errorHandler(async ({ request, locals }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const perPage = parseInt(url.searchParams.get("per_page") ?? "10", 10);

  if (isNaN(page) || page < 1) {
    throw new ValidationError("Page number must be a positive integer");
  }

  if (isNaN(perPage) || perPage < 1 || perPage > 50) {
    throw new ValidationError("Items per page must be between 1 and 50");
  }

  const dietService = new DietService(locals.supabase);
  return await dietService.getDiets({ page, per_page: perPage });
});
