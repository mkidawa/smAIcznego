import type { CreateGenerationCommand, CreateGenerationResponse } from "@/types";

export const createGeneration = async (data: CreateGenerationCommand, locals: App.Locals) => {
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

  return responsePayload;
};
