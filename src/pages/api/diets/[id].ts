import { DietService } from "@/lib/services/diet.service";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, url }) => {
  try {
    const id = Number(params.id);
    if (!id || isNaN(id)) {
      return new Response(JSON.stringify({ error: "VALIDATION_FAILED", details: "Invalid ID provided" }), {
        status: 400,
      });
    }

    const fetchByGeneration = url.searchParams.get("fetchByGeneration") === "true";
    const dietService = new DietService(locals.supabase);

    if (fetchByGeneration) {
      return await dietService.getDietByGenerationId(id);
    }
    return await dietService.getDiet(id);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "SERVER_ERROR", details: err instanceof Error ? err.message : String(err) }),
      { status: 500 }
    );
  }
};
