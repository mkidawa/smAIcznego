import type { APIRoute } from "astro";
import { AuthService, resetPasswordSchema } from "@/lib/services/auth.service";
import { z } from "zod";
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { email } = resetPasswordSchema.parse(body);

    const authService = new AuthService(locals.supabase);
    await authService.resetPassword(email);

    return new Response(
      JSON.stringify({
        message: "Password reset email sent",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid email address",
          details: error.errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "An error occurred during password reset",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
