import { getDiet } from "@/api/services/dietService";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const dietId = Number(params.id);
    if (!dietId || isNaN(dietId)) {
      return new Response(JSON.stringify({ error: "VALIDATION_FAILED", details: "Nieprawidłowe ID diety" }), {
        status: 400,
      });
    }

    return await getDiet(dietId, locals);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "SERVER_ERROR", details: err instanceof Error ? err.message : String(err) }),
      { status: 500 }
    );
  }
};
