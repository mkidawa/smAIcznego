import type { APIRoute } from "astro";
import { AuthService, registerSchema } from "@/lib/services/auth.service";
import { errorHandler } from "@/middleware/error-handler";
import { ValidationError } from "@/lib/errors/api-error";

export const POST: APIRoute = errorHandler(async ({ request, locals }) => {
  const rawData = await request.json();
  const result = registerSchema.safeParse(rawData);

  if (!result.success) {
    throw new ValidationError("Invalid registration data", result.error.errors);
  }

  const authService = new AuthService(locals.supabase);
  return await authService.register(result.data);
});
