import type { APIRoute } from "astro";
import { AuthService } from "@/lib/services/auth.service";
import { errorHandler } from "@/middleware/error-handler";
import { ValidationError } from "@/lib/errors/api-error";
import { resetPasswordSchema } from "@/modules/auth/types/auth.schema";
import { createSupabaseAdminInstance } from "@/db/supabase.client";

export const POST: APIRoute = errorHandler(async ({ request, cookies, url }) => {
  const rawData = await request.json();
  const result = resetPasswordSchema.safeParse(rawData);

  if (!result.success) {
    throw new ValidationError("Invalid email address", result.error.errors);
  }
  const supabaseAdmin = createSupabaseAdminInstance({
    cookies: cookies,
    headers: request.headers,
  });

  const authService = new AuthService(supabaseAdmin);
  const response = await authService.resetPassword({
    ...result.data,
    url,
  });

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
});
