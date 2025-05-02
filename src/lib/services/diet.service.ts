import type { CreateDietCommand, CreateDietResponse } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

export class DietService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createDiet(data: CreateDietCommand) {
    const { data: generationData, error: generationError } = await this.supabase
      .from("generation")
      .select("*")
      .eq("id", data.generation_id)
      .eq("user_id", "3a405225-034c-4eb8-80d0-1cd2b79327a6")
      .single();
    if (generationError || !generationData) {
      return new Response(
        JSON.stringify({
          error: "GENERATION_NOT_FOUND",
          details: generationError ? generationError.message : "Nie znaleziono generacji",
        }),
        { status: 404 }
      );
    }

    // Sprawdzenie czy dieta dla danej generacji już nie istnieje
    const { data: existingDiet } = await this.supabase
      .from("diet")
      .select("*")
      .eq("generation_id", data.generation_id)
      .maybeSingle();
    if (existingDiet) {
      return new Response(JSON.stringify({ error: "DIET_ALREADY_EXISTS" }), { status: 409 });
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + data.number_of_days * 24 * 60 * 60 * 1000);

    // Wstawienie nowego rekordu diety z statusem 'draft'
    const { data: insertedDiet, error: insertError } = await this.supabase
      .from("diet")
      .insert({
        number_of_days: data.number_of_days,
        calories_per_day: data.calories_per_day,
        preferred_cuisines: data.preferred_cuisines,
        generation_id: data.generation_id,
        status: "draft",
        user_id: "3a405225-034c-4eb8-80d0-1cd2b79327a6",
        end_date: endDate.toISOString(),
        created_at: now.toISOString(),
      })
      .select("*")
      .single();
    if (insertError || !insertedDiet) {
      return new Response(
        JSON.stringify({
          error: "SERVER_ERROR",
          details: insertError ? insertError.message : "Błąd podczas tworzenia diety",
        }),
        { status: 500 }
      );
    }

    // Przygotowanie i zwrócenie odpowiedzi
    const responsePayload: CreateDietResponse = {
      id: insertedDiet.id,
      status: insertedDiet.status,
      generation_id: insertedDiet.generation_id,
    };

    return new Response(JSON.stringify(responsePayload), { status: 201 });
  }

  async getDiet(dietId: number) {
    const { data: diet, error } = await this.supabase
      .from("diet")
      .select(
        `
        *,
        meals (
          *,
          recipe (*)
        )
      `
      )
      .eq("id", dietId)
      .eq("user_id", "3a405225-034c-4eb8-80d0-1cd2b79327a6")
      .single();

    if (error || !diet) {
      return new Response(
        JSON.stringify({
          error: "DIET_NOT_FOUND",
          details: error ? error.message : "Nie znaleziono diety",
        }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(diet), { status: 200 });
  }
}
