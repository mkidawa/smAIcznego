import { GenerationService } from "@/lib/services/generation.service";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const generationId = params.id;

    if (!generationId || isNaN(parseInt(generationId))) {
      return new Response(
        JSON.stringify({ error: "VALIDATION_FAILED", details: "Parameter 'id' is required and must be a number" }),
        { status: 400 }
      );
    }

    const generationService = new GenerationService(locals.supabase);
    const generation = await generationService.getGeneration(parseInt(generationId));

    if (!generation) {
      return new Response(JSON.stringify({ error: "NOT_FOUND", details: "Generation with provided ID not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(generation), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "SERVER_ERROR", details: err instanceof Error ? err.message : String(err) }),
      { status: 500 }
    );
  }
};
