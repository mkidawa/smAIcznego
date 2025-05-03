import type { CreateGenerationCommand, CreateGenerationResponse, GenerationResponse, GenerationStatus } from "@/types";
import { OpenRouterService } from "./openRouter.service";
import type { DietPlanResponse, OpenRouterResponse } from "@/modules/openRouter/openRouter.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import { Logger } from "../logger";

export class GenerationService {
  private readonly logger = Logger.getInstance();

  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createGeneration(data: CreateGenerationCommand): Promise<CreateGenerationResponse> {
    this.logger.info("Starting generation creation");

    // Insert record into generation table
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
      this.logger.error("Failed to create generation record", genError as Error);
      throw new Error(genError ? genError.message : "Failed to create generation record");
    }

    // Log event in generation_log table
    const logPayload = {
      generation_id: generation.id,
      event_type: "request",
      message: "Generation record created",
      created_at: now.toISOString(),
    };
    const { error: logError } = await this.supabase.from("generation_log").insert(logPayload);
    if (logError) {
      this.logger.error("Failed to create generation log", logError as Error, { generationId: generation.id });
      throw new Error(logError.message);
    }

    try {
      // Initialize OpenRouterService
      const openRouter = new OpenRouterService();
      await openRouter.initialize();

      // Prepare parameters for diet generation
      const dietParams = {
        calories_per_day: data.calories_per_day,
        number_of_days: data.number_of_days,
        preferences: data.preferred_cuisines,
        meals_per_day: data.meals_per_day,
      };

      this.logger.info("Starting asynchronous diet generation", {
        generationId: generation.id,
        params: dietParams,
      });

      // Asynchronous diet generation call
      openRouter
        .generateDietPlan(dietParams)
        .then(async (response) => {
          // Update generation status to completed and save response in metadata
          const { error: updateError } = await this.supabase
            .from("generation")
            .update({
              status: "completed",
              metadata: response,
            })
            .eq("id", generation.id);

          if (updateError) {
            this.logger.error("Failed to update generation status", updateError as Error, {
              generationId: generation.id,
            });
            return;
          }

          // Log success
          await this.supabase.from("generation_log").insert({
            generation_id: generation.id,
            event_type: "response",
            message: "Diet generation completed successfully",
            created_at: new Date().toISOString(),
          });

          this.logger.info("Diet generation completed successfully", { generationId: generation.id });
        })
        .catch(async (error) => {
          // Log error
          await this.supabase.from("generation_log").insert({
            generation_id: generation.id,
            event_type: "error",
            message: `Diet generation error: ${error.message}`,
            created_at: new Date().toISOString(),
          });

          this.logger.error("Diet generation failed", error as Error, { generationId: generation.id });
        });
    } catch (error) {
      // Log initialization error
      await this.supabase.from("generation_log").insert({
        generation_id: generation.id,
        event_type: "error",
        message: `OpenRouter initialization error: ${error instanceof Error ? error.message : String(error)}`,
        created_at: new Date().toISOString(),
      });

      this.logger.error("OpenRouter initialization failed", error as Error, { generationId: generation.id });
    }

    return {
      generation_id: generation.id,
      status: "pending",
    };
  }

  async getGeneration(id: number): Promise<GenerationResponse | null> {
    this.logger.info("Starting generation retrieval", { generationId: id });

    const { data: generation, error } = await this.supabase.from("generation").select("*").eq("id", id).single();

    if (error || !generation) {
      this.logger.warn("Generation not found", { generationId: id, error });
      return null;
    }

    let preview;

    const metadata = generation.metadata as OpenRouterResponse;
    if (metadata && generation.status === "completed") {
      preview = metadata.choices[0].message.content
        ? (JSON.parse(metadata.choices[0].message.content) as DietPlanResponse)
        : undefined;
    }

    this.logger.info("Generation retrieved successfully", {
      generationId: id,
      status: generation.status,
      hasPreview: !!preview,
    });

    return {
      id: generation.id,
      status: generation.status as GenerationStatus,
      created_at: generation.created_at,
      preview,
      source_text: JSON.parse(generation.source_text),
    };
  }
}
