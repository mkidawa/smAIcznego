import type { CreateDietResponse } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import { Logger } from "../logger";
import { z } from "zod";
import { NotFoundError, ConflictError, ServerError } from "../errors/api-error";

export const createDietSchema = z.object({
  number_of_days: z.number().int().min(1).max(14),
  calories_per_day: z.number().positive(),
  preferred_cuisines: z.array(
    z.enum(["polish", "italian", "indian", "asian", "vegan", "vegetarian", "gluten-free", "keto", "paleo"])
  ),
  generation_id: z.number().positive(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  per_page: z.number().int().min(1).max(50),
});

export type CreateDietInput = z.infer<typeof createDietSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

export class DietService {
  private readonly logger = Logger.getInstance();

  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createDiet(data: CreateDietInput) {
    this.logger.info("Starting diet creation", { generationId: data.generation_id });

    const { data: generationData, error: generationError } = await this.supabase
      .from("generation")
      .select("*")
      .eq("id", data.generation_id)
      .eq("user_id", import.meta.env.MOCK_USER_ID)
      .single();

    if (generationError || !generationData) {
      this.logger.warn("Generation not found", { generationId: data.generation_id, error: generationError });
      throw new NotFoundError("Generation not found");
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
      throw new ConflictError("Diet already exists for this generation");
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
      throw new ServerError("Failed to create diet", insertError?.message);
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
      .select("*")
      .eq("id", dietId)
      .eq("user_id", import.meta.env.MOCK_USER_ID)
      .single();

    if (error || !diet) {
      this.logger.warn("Diet not found", { dietId, error });
      throw new NotFoundError("Diet not found");
    }

    this.logger.info("Diet retrieved successfully", { dietId });
    return new Response(JSON.stringify(diet), { status: 200 });
  }

  async getDietByGenerationId(generationId: number) {
    this.logger.info("Starting diet retrieval by generation ID", { generationId });

    const { data: diet, error } = await this.supabase
      .from("diet")
      .select("*")
      .eq("generation_id", generationId)
      .eq("user_id", import.meta.env.MOCK_USER_ID)
      .single();

    if (error || !diet) {
      this.logger.warn("Diet not found for generation", { generationId, error });
      throw new NotFoundError("Diet not found for this generation");
    }

    this.logger.info("Diet retrieved successfully by generation ID", { generationId });
    return new Response(JSON.stringify(diet), { status: 200 });
  }

  async getDiets({ page, per_page }: PaginationInput) {
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
      throw new ServerError("Failed to get total count of diets");
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
      throw new ServerError("Failed to retrieve diets");
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
