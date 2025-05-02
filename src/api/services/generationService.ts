import type { CreateGenerationCommand, CreateGenerationResponse, GenerationResponse, GenerationStatus } from "@/types";
import { OpenRouterService } from "./openRouterService";
import type { DietPlanResponse, OpenRouterResponse } from "@/types/openRouter";

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

  try {
    // Inicjalizacja OpenRouterService
    const openRouter = new OpenRouterService();
    await openRouter.initialize();

    // Przygotowanie parametrów dla generacji diety
    const dietParams = {
      calories_per_day: data.calories_per_day,
      number_of_days: data.number_of_days,
      preferences: data.preferred_cuisines,
      meals_per_day: data.meals_per_day,
    };

    // Asynchroniczne wywołanie generacji diety
    openRouter
      .generateDietPlan(dietParams)
      .then(async (response) => {
        // Aktualizacja statusu generacji na completed i zapisanie odpowiedzi w metadata
        const { error: updateError } = await locals.supabase
          .from("generation")
          .update({
            status: "completed",
            metadata: response,
          })
          .eq("id", generation.id);

        if (updateError) {
          console.error("Błąd podczas aktualizacji statusu generacji:", updateError);
          return;
        }

        // Logowanie sukcesu
        await locals.supabase.from("generation_log").insert({
          generation_id: generation.id,
          event_type: "response",
          message: "Generacja diety zakończona sukcesem",
          created_at: new Date().toISOString(),
        });
      })
      .catch(async (error) => {
        // Logowanie błędu
        await locals.supabase.from("generation_log").insert({
          generation_id: generation.id,
          event_type: "error",
          message: `Błąd podczas generacji diety: ${error.message}`,
          created_at: new Date().toISOString(),
        });
      });
  } catch (error) {
    // Logowanie błędu inicjalizacji
    await locals.supabase.from("generation_log").insert({
      generation_id: generation.id,
      event_type: "error",
      message: `Błąd inicjalizacji OpenRouter: ${error instanceof Error ? error.message : String(error)}`,
      created_at: new Date().toISOString(),
    });
  }

  const responsePayload: CreateGenerationResponse = {
    generation_id: generation.id,
    status: "pending",
  };

  return responsePayload;
};

export const getGeneration = async (id: number, locals: App.Locals): Promise<GenerationResponse | null> => {
  const { data: generation, error } = await locals.supabase.from("generation").select("*").eq("id", id).single();

  if (error || !generation) {
    return null;
  }

  let preview;

  const metadata = generation.metadata as OpenRouterResponse;
  if (metadata && generation.status === "completed") {
    preview = metadata.choices[0].message.content
      ? (JSON.parse(metadata.choices[0].message.content) as DietPlanResponse)
      : undefined;
  }

  return {
    id: generation.id,
    status: generation.status as GenerationStatus,
    created_at: generation.created_at,
    preview,
  };
};
