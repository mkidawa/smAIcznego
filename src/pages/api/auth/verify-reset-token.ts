import type { APIRoute } from "astro";
import { createSupabaseAdminInstance } from "@/db/supabase.client";
import { AuthService } from "@/lib/services/auth.service";
import { errorHandler } from "@/middleware/error-handler";
import { ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";

const verifyTokenSchema = z.object({
  token_hash: z.string().min(1, "Token hash is required"),
});

export const POST: APIRoute = errorHandler(async ({ request, cookies }) => {
  const rawData = await request.json();
  const result = verifyTokenSchema.safeParse(rawData);

  if (!result.success) {
    throw new ValidationError("Invalid token data", result.error.errors);
  }

  const supabase = createSupabaseAdminInstance({ cookies, headers: request.headers });
  const authService = new AuthService(supabase);

  const response = await authService.verifyResetToken(result.data.token_hash);

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
});
