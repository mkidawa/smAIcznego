import type { APIRoute } from "astro";
import { AuthService } from "@/lib/services/auth.service";
import { errorHandler } from "@/middleware/error-handler";

export const POST: APIRoute = errorHandler(async ({ locals }) => {
  const authService = new AuthService(locals.supabase);
  const response = await authService.logout();

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
});
