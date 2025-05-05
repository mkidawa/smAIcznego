import type { APIRoute } from "astro";
import { AuthService } from "@/lib/services/auth.service";
import { errorHandler } from "@/middleware/error-handler";
import { createSupabaseServerInstance } from "@/db/supabase.client";
export const POST: APIRoute = errorHandler(async ({ request, cookies }) => {
  const supabaseClient = createSupabaseServerInstance({
    cookies: cookies,
    headers: request.headers,
  });

  const authService = new AuthService(supabaseClient);
  const data = await request.json();
  const result = await authService.updatePassword(data);

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
