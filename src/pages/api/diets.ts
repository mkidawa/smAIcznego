import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateDietCommand, CreateDietResponse } from "../../types";

export const post: APIRoute = async ({ request, locals }) => {
  try {
    // Parsowanie i walidacja danych wejściowych
    const body = await request.json();
    const createDietSchema = z.object({
      number_of_days: z.number().min(1).max(14),
      calories_per_day: z.number().positive(),
      preferred_cuisines: z.array(
        z.enum(["polish", "italian", "indian", "asian", "vegan", "vegetarian", "gluten-free", "keto", "paleo"])
      ),
      generation_id: z.number(),
    });
    const parsed = createDietSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "VALIDATION_FAILED", details: parsed.error.flatten() }), {
        status: 400,
      });
    }
    const data: CreateDietCommand = parsed.data;

    // Sprawdzenie autoryzacji
    const session = await locals.supabase.auth.getSession();

    if (!session.data.session) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401 });
    }

    const user = session.data.session.user;

    // Weryfikacja istnienia rekordu generacji, który należy do użytkownika
    const { data: generationData, error: generationError } = await locals.supabase
      .from("generation")
      .select("*")
      .eq("id", data.generation_id)
      .eq("user_id", user.id)
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
    const { data: existingDiet } = await locals.supabase
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
    const { data: insertedDiet, error: insertError } = await locals.supabase
      .from("diet")
      .insert({
        number_of_days: data.number_of_days,
        calories_per_day: data.calories_per_day,
        preferred_cuisines: data.preferred_cuisines,
        generation_id: data.generation_id,
        status: "draft",
        user_id: user.id,
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
      diet_id: insertedDiet.id,
      status: insertedDiet.status,
      generation_id: insertedDiet.generation_id,
    };
    return new Response(JSON.stringify(responsePayload), { status: 201 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "SERVER_ERROR", details: err instanceof Error ? err.message : String(err) }),
      { status: 500 }
    );
  }
};
