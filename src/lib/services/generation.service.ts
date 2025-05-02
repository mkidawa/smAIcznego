import type { CreateGenerationCommand, CreateGenerationResponse, GenerationResponse, GenerationStatus } from "@/types";
import { OpenRouterService } from "./openRouter.service";
import type { DietPlanResponse, OpenRouterResponse } from "@/modules/openRouter/openRouter.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

export class GenerationService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createGeneration(data: CreateGenerationCommand): Promise<CreateGenerationResponse> {
    // Wstawienie rekordu do tabeli generation
    const now = new Date();
    const { data: generation, error: genError } = await this.supabase
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
      throw new Error(genError ? genError.message : "Nie udało się utworzyć rekordu generacji");
    }

    // Logowanie zdarzenia w tabeli generation_log
    const logPayload = {
      generation_id: generation.id,
      event_type: "request",
      message: "Utworzenie rekordu generacji",
      created_at: now.toISOString(),
    };
    const { error: logError } = await this.supabase.from("generation_log").insert(logPayload);
    if (logError) {
      throw new Error(logError.message);
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
          const { error: updateError } = await this.supabase
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
          await this.supabase.from("generation_log").insert({
            generation_id: generation.id,
            event_type: "response",
            message: "Generacja diety zakończona sukcesem",
            created_at: new Date().toISOString(),
          });
        })
        .catch(async (error) => {
          // Logowanie błędu
          await this.supabase.from("generation_log").insert({
            generation_id: generation.id,
            event_type: "error",
            message: `Błąd podczas generacji diety: ${error.message}`,
            created_at: new Date().toISOString(),
          });
        });
    } catch (error) {
      // Logowanie błędu inicjalizacji
      await this.supabase.from("generation_log").insert({
        generation_id: generation.id,
        event_type: "error",
        message: `Błąd inicjalizacji OpenRouter: ${error instanceof Error ? error.message : String(error)}`,
        created_at: new Date().toISOString(),
      });
    }

    return {
      generation_id: generation.id,
      status: "pending",
    };
  }

  async getGeneration(id: number): Promise<GenerationResponse | null> {
    const { data: generation, error } = await this.supabase.from("generation").select("*").eq("id", id).single();

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
      source_text: JSON.parse(generation.source_text),
    };
  }
}
