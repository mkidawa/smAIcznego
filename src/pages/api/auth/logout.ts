import type { APIRoute } from "astro";
import { AuthService } from "@/lib/services/auth.service";

export const POST: APIRoute = async ({ locals }) => {
  try {
    const authService = new AuthService(locals.supabase);

    await authService.logout();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    console.error("Logout error:", error);
    return new Response(JSON.stringify({ error: "Failed to logout" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
