import type { APIRoute } from "astro";
import { AuthService, loginSchema } from "@/lib/services/auth.service";
import { z } from "zod";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const authService = new AuthService(locals.supabase);
    const data = await authService.login(email, password);

    return new Response(
      JSON.stringify({
        user: data.user,
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
          error: "Invalid login data",
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
        error: "An error occurred during login",
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
