import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateGenerationCommand, CreateGenerationResponse } from "../../../types";

export const prerender = false;

const createGenerationSchema = z.object({
  number_of_days: z.number().min(1).max(14),
  calories_per_day: z.number().positive(),
  meals_per_day: z.number().int().positive(),
  preferred_cuisines: z.array(
    z.enum(["polish", "italian", "indian", "asian", "vegan", "vegetarian", "gluten-free", "keto", "paleo"])
  ),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parsowanie i walidacja danych wejściowych
    const body = await request.json();

    const parsed = createGenerationSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "VALIDATION_FAILED", details: parsed.error.flatten() }), {
        status: 400,
      });
    }
    const data: CreateGenerationCommand = parsed.data;

    // Wstawienie rekordu do tabeli generation
    const now = new Date();
    const { data: generation, error: genError } = await locals.supabase
      .from("generation")
      .insert({
        user_id: "3a405225-034c-4eb8-80d0-1cd2b79327a6",
        source_text: JSON.stringify(data),
        status: "pending",
        created_at: now.toISOString(),
      })
      .select("*")
      .single();

    if (genError || !generation) {
      return new Response(
        JSON.stringify({
          error: "SERVER_ERROR",
          details: genError ? genError.message : "Nie udało się utworzyć rekordu generacji",
        }),
        { status: 500 }
      );
    }

    // Logowanie zdarzenia w tabeli generation_log
    const logPayload = {
      generation_id: generation.id,
      event_type: "request",
      message: "Utworzenie rekordu generacji",
      created_at: now.toISOString(),
    };
    const { error: logError } = await locals.supabase.from("generation_log").insert(logPayload);
    if (logError) {
      return new Response(JSON.stringify({ error: "SERVER_ERROR", details: logError.message }), { status: 500 });
    }

    // Enqueue background worker (symulacja, rzeczywista implementacja w przyszłości)
    // TODO: enqueue background job for AI processing

    const responsePayload: CreateGenerationResponse = {
      generation_id: generation.id,
      status: "pending",
    };

    return new Response(JSON.stringify(responsePayload), { status: 202 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "SERVER_ERROR", details: err instanceof Error ? err.message : String(err) }),
      { status: 500 }
    );
  }
};
