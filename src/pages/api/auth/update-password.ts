import type { APIRoute } from "astro";
import { AuthService } from "@/lib/services/auth.service";
import { supabaseClient } from "@/db/supabase.client";
import { errorHandler } from "@/middleware/error-handler";

export const POST: APIRoute = errorHandler(async ({ request }) => {
  const authService = new AuthService(supabaseClient);
  const data = await request.json();
  const result = await authService.updatePassword(data);

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

export const prerender = false;
