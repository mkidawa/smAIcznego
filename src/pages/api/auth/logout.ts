import type { APIRoute } from "astro";
import { AuthService } from "@/lib/services/auth.service";
import { errorHandler } from "@/middleware/error-handler";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const POST: APIRoute = errorHandler(async ({ cookies, request }) => {
  const supabaseClient = createSupabaseServerInstance({
    cookies: cookies,
    headers: request.headers,
  });

  const authService = new AuthService(supabaseClient);
  const response = await authService.logout();

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
});
