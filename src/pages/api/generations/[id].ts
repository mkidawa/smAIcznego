import { getGeneration } from "@/api/services/generationService";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const generationId = params.id;

    if (!generationId || isNaN(parseInt(generationId))) {
      return new Response(
        JSON.stringify({ error: "VALIDATION_FAILED", details: "Parametr 'id' jest wymagany i musi być liczbą" }),
        { status: 400 }
      );
    }

    const generation = await getGeneration(parseInt(generationId), locals);

    if (!generation) {
      return new Response(JSON.stringify({ error: "NOT_FOUND", details: "Nie znaleziono generacji o podanym ID" }), {
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
