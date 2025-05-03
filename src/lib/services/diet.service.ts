import type { CreateDietCommand, CreateDietResponse } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import { Logger } from "../logger";

export class DietService {
  private readonly logger = Logger.getInstance();

  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createDiet(data: CreateDietCommand) {
    this.logger.info("Starting diet creation", { generationId: data.generation_id });

    const { data: generationData, error: generationError } = await this.supabase
      .from("generation")
      .select("*")
      .eq("id", data.generation_id)
      .eq("user_id", import.meta.env.MOCK_USER_ID)
      .single();
    if (generationError || !generationData) {
      this.logger.warn("Generation not found", { generationId: data.generation_id, error: generationError });
      return new Response(
        JSON.stringify({
          error: "GENERATION_NOT_FOUND",
          details: generationError ? generationError.message : "Generation not found",
        }),
        { status: 404 }
      );
    }

    // Check if diet for this generation already exists
    const { data: existingDiet } = await this.supabase
      .from("diet")
      .select("*")
      .eq("generation_id", data.generation_id)
      .eq("user_id", import.meta.env.MOCK_USER_ID)
      .maybeSingle();
    if (existingDiet) {
      this.logger.warn("Diet already exists", { generationId: data.generation_id });
      return new Response(JSON.stringify({ error: "DIET_ALREADY_EXISTS" }), { status: 409 });
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + data.number_of_days * 24 * 60 * 60 * 1000);

    // Insert new diet record with 'draft' status
    const { data: insertedDiet, error: insertError } = await this.supabase
      .from("diet")
      .insert({
        number_of_days: data.number_of_days,
        calories_per_day: data.calories_per_day,
        preferred_cuisines: data.preferred_cuisines,
        generation_id: data.generation_id,
        status: "draft",
        user_id: import.meta.env.MOCK_USER_ID,
        end_date: endDate.toISOString(),
        created_at: now.toISOString(),
      })
      .select("*")
      .single();
    if (insertError || !insertedDiet) {
      this.logger.error("Failed to create diet", insertError, { generationId: data.generation_id });
      return new Response(
        JSON.stringify({
          error: "SERVER_ERROR",
          details: insertError ? insertError.message : "Error while creating diet",
        }),
        { status: 500 }
      );
    }

    // Prepare and return response
    const responsePayload: CreateDietResponse = {
      id: insertedDiet.id,
      status: insertedDiet.status,
      generation_id: insertedDiet.generation_id,
    };

    this.logger.info("Diet created successfully", { dietId: insertedDiet.id, generationId: data.generation_id });
    return new Response(JSON.stringify(responsePayload), { status: 201 });
  }

  async getDiet(dietId: number) {
    this.logger.info("Starting diet retrieval", { dietId });

    const { data: diet, error } = await this.supabase
      .from("diet")
      .select(
        `
        *
      `
      )
      .eq("id", dietId)
      .eq("user_id", import.meta.env.MOCK_USER_ID)
      .single();

    if (error || !diet) {
      this.logger.warn("Diet not found", { dietId, error });
      return new Response(
        JSON.stringify({
          error: "DIET_NOT_FOUND",
          details: error ? error.message : "Diet not found",
        }),
        { status: 404 }
      );
    }

    this.logger.info("Diet retrieved successfully", { dietId });
    return new Response(JSON.stringify(diet), { status: 200 });
  }

  async getDietByGenerationId(generationId: number) {
    this.logger.info("Starting diet retrieval by generation ID", { generationId });

    const { data: diet, error } = await this.supabase
      .from("diet")
      .select(
        `
        *
      `
      )
      .eq("generation_id", generationId)
      .eq("user_id", import.meta.env.MOCK_USER_ID)
      .single();

    if (error || !diet) {
      this.logger.warn("Diet not found for generation", { generationId, error });
      return new Response(
        JSON.stringify({
          error: "DIET_NOT_FOUND",
          details: error ? error.message : "Diet not found for this generation",
        }),
        { status: 404 }
      );
    }

    this.logger.info("Diet retrieved successfully by generation ID", { generationId });
    return new Response(JSON.stringify(diet), { status: 200 });
  }

  async getDiets(page = 1, per_page = 10) {
    this.logger.info("Starting diets retrieval", { page, per_page });

    // Calculate offset for pagination
    const offset = (page - 1) * per_page;

    // Get total count of diets for pagination
    const { count, error: countError } = await this.supabase
      .from("diet")
      .select("*", { count: "exact", head: true })
      .eq("user_id", import.meta.env.MOCK_USER_ID);

    if (countError) {
      this.logger.error("Failed to get total count of diets", countError);
      return new Response(
        JSON.stringify({
          error: "SERVER_ERROR",
          details: "Failed to get total count of diets",
        }),
        { status: 500 }
      );
    }

    // Get paginated diets
    const { data: diets, error: dietsError } = await this.supabase
      .from("diet")
      .select("*")
      .eq("user_id", import.meta.env.MOCK_USER_ID)
      .order("created_at", { ascending: false })
      .range(offset, offset + per_page - 1);

    if (dietsError) {
      this.logger.error("Failed to retrieve diets", dietsError);
      return new Response(
        JSON.stringify({
          error: "SERVER_ERROR",
          details: "Failed to retrieve diets",
        }),
        { status: 500 }
      );
    }

    const response = {
      data: diets,
      page,
      per_page,
      total: count || 0,
    };

    this.logger.info("Diets retrieved successfully", { page, per_page, total: count });
    return new Response(JSON.stringify(response), { status: 200 });
  }
}
