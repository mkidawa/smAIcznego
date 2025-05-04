import type { CreateGenerationCommand, CreateGenerationResponse, GenerationResponse, GenerationStatus } from "@/types";
import { OpenRouterService } from "./openRouter.service";
import type { DietPlanResponse, OpenRouterResponse } from "@/modules/openRouter/openRouter.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import { Logger } from "../logger";
import { NotFoundError, ServerError, UnauthorizedError } from "../errors/api-error";

export class GenerationService {
  private readonly logger = Logger.getInstance();
  private userId: string | undefined;

  constructor(private readonly supabase: SupabaseClient<Database>) {}

  private async initializeUserId() {
    if (!this.userId) {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();
      if (error || !user) {
        throw new UnauthorizedError("Unauthorized access");
      }
      this.userId = user.id;
    }
    return this.userId;
  }

  async createGeneration(data: CreateGenerationCommand): Promise<CreateGenerationResponse> {
    const userId = await this.initializeUserId();
    this.logger.info("Starting generation creation", { userId });

    // Insert record into generation table
    const now = new Date();
    const { data: generation, error: genError } = await this.supabase
      .from("generations")
      .insert({
        user_id: userId,
        source_text: JSON.stringify(data),
        status: "pending",
        created_at: now.toISOString(),
      })
      .select("*")
      .single();

    if (genError || !generation) {
      this.logger.error("Failed to create generation record", genError, { userId });
      throw new ServerError("Failed to create generation record", genError);
    }

    // Log event in generation_log table
    const logPayload = {
      generation_id: generation.id,
      event_type: "request",
      message: "Generation record created",
      created_at: now.toISOString(),
    };
    const { error: logError } = await this.supabase.from("generation_logs").insert(logPayload);
    if (logError) {
      this.logger.error("Failed to create generation log", logError, { generationId: generation.id });
      throw new ServerError("Failed to create generation log", logError);
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
            .from("generations")
            .update({
              status: "completed",
              metadata: response,
            })
            .eq("id", generation.id);

          if (updateError) {
            this.logger.error("Failed to update generation status", updateError, {
              generationId: generation.id,
            });
            return;
          }

          // Log success
          await this.supabase.from("generation_logs").insert({
            generation_id: generation.id,
            event_type: "response",
            message: "Diet generation completed successfully",
            created_at: new Date().toISOString(),
          });

          this.logger.info("Diet generation completed successfully", { generationId: generation.id });
        })
        .catch(async (error) => {
          // Log error
          await this.supabase.from("generation_logs").insert({
            generation_id: generation.id,
            event_type: "error",
            message: `Diet generation error: ${error.message}`,
            created_at: new Date().toISOString(),
          });

          this.logger.error("Diet generation failed", error, { generationId: generation.id });
        });
    } catch (error) {
      // Log initialization error
      await this.supabase.from("generation_logs").insert({
        generation_id: generation.id,
        event_type: "error",
        message: `OpenRouter initialization error: ${error instanceof Error ? error.message : String(error)}`,
        created_at: new Date().toISOString(),
      });

      this.logger.error("OpenRouter initialization failed", error as Error, { generationId: generation.id });
      throw new ServerError("Failed to initialize OpenRouter service", error);
    }

    return {
      generation_id: generation.id,
      status: "pending",
    };
  }

  async getGeneration(id: number): Promise<GenerationResponse> {
    const userId = await this.initializeUserId();
    this.logger.info("Starting generation retrieval", { generationId: id, userId });

    const { data: generation, error } = await this.supabase
      .from("generations")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      this.logger.error("Failed to retrieve generation", error, { generationId: id, userId });
      throw new ServerError("Failed to retrieve generation", error);
    }

    if (!generation) {
      this.logger.warn("Generation not found", { generationId: id, userId });
      throw new NotFoundError("Generation not found");
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
      userId,
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
