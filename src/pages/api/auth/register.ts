import type { APIRoute } from "astro";
import { AuthService } from "@/lib/services/auth.service";
import { errorHandler } from "@/middleware/error-handler";
import { ValidationError } from "@/lib/errors/api-error";
import { registerSchema } from "@/modules/auth/types/auth.schema";
export const POST: APIRoute = errorHandler(async ({ request, locals }) => {
  const rawData = await request.json();
  const result = registerSchema.safeParse(rawData);

  if (!result.success) {
    throw new ValidationError("Invalid registration data", result.error.errors);
  }

  const authService = new AuthService(locals.supabase);
  const response = await authService.register(result.data);

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
});
