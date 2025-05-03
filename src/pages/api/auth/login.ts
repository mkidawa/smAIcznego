import type { APIRoute } from "astro";
import { AuthService, loginSchema } from "@/lib/services/auth.service";
import { errorHandler } from "@/middleware/error-handler";
import { ValidationError } from "@/lib/errors/api-error";

export const POST: APIRoute = errorHandler(async ({ request, locals }) => {
  const rawData = await request.json();
  const result = loginSchema.safeParse(rawData);

  if (!result.success) {
    throw new ValidationError("Invalid login data", result.error.errors);
  }

  const authService = new AuthService(locals.supabase);
  return await authService.login(result.data);
});
