import type { CreateGenerationCommand, CreateGenerationResponse, GenerationResponse, GenerationStatus } from "@/types";
import { OpenRouterService } from "./openRouter.service";
import type { DietPlanResponse, OpenRouterResponse } from "@/modules/openRouter/openRouter.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import { Logger } from "../logger";
import { NotFoundError, ServerError, UnauthorizedError } from "../errors/api-error";

type CreateGenerationWithRequestUrl = CreateGenerationCommand & {
  requestUrl: URL;
  headers: Headers;
};

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

  private async getUserAllergies(): Promise<{ allergies: string[]; dietary_preferences?: string }> {
    const userId = await this.initializeUserId();
    this.logger.info("Fetching user allergies", { userId });

    const { data: profile, error } = await this.supabase
      .from("profiles")
      .select("allergies, dietary_preferences")
      .eq("user_id", userId)
      .single();

    if (error) {
      this.logger.error("Failed to fetch user allergies", error, { userId });
      throw new ServerError("Failed to fetch user allergies", error);
    }

    return {
      allergies: profile?.allergies || [],
      dietary_preferences: profile?.dietary_preferences || undefined,
    };
  }

  async createGeneration(data: CreateGenerationWithRequestUrl): Promise<CreateGenerationResponse> {
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

    // Process the generation synchronously
    try {
      await this.processGeneration(generation.id, {
        calories_per_day: data.calories_per_day,
        number_of_days: data.number_of_days,
        preferences: data.preferred_cuisines,
        meals_per_day: data.meals_per_day,
      });
    } catch (error) {
      this.logger.error("Failed to process generation", error as Error, { generationId: generation.id });
      // Update generation status to error
      await this.supabase
        .from("generations")
        .update({
          status: "error",
          metadata: { error: error instanceof Error ? error.message : String(error) },
        })
        .eq("id", generation.id);

      // Log error
      await this.supabase.from("generation_logs").insert({
        generation_id: generation.id,
        event_type: "error",
        message: `Processing error: ${error instanceof Error ? error.message : String(error)}`,
        created_at: new Date().toISOString(),
      });
    }

    return {
      id: generation.id,
      status: "completed",
    };
  }

  async processGeneration(
    generationId: number,
    params: {
      calories_per_day: number;
      number_of_days: number;
      preferences?: string[];
      meals_per_day: number;
    }
  ): Promise<void> {
    this.logger.info("Starting generation processing", { generationId });

    try {
      // Fetch user allergies and preferences
      const { allergies, dietary_preferences } = await this.getUserAllergies();
      this.logger.info("Retrieved user allergies and preferences", {
        generationId,
        allergiesCount: allergies.length,
        hasPreferences: !!dietary_preferences,
      });

      // Initialize OpenRouterService
      const openRouter = new OpenRouterService();
      await openRouter.initialize();

      this.logger.info("Starting diet generation", {
        generationId,
        params,
        allergiesCount: allergies.length,
        hasPreferences: !!dietary_preferences,
      });

      // Execute the diet plan generation with allergies and preferences
      try {
        const response = await openRouter.generateDietPlan({
          ...params,
          allergies,
          dietary_preferences,
        });

        // Update generation status to completed and save response in metadata
        const { error: updateError } = await this.supabase
          .from("generations")
          .update({
            status: "completed",
            metadata: response,
          })
          .eq("id", generationId);

        if (updateError) {
          this.logger.error("Failed to update generation status", updateError, {
            generationId,
          });
          throw updateError;
        }

        // Log success
        await this.supabase.from("generation_logs").insert({
          generation_id: generationId,
          event_type: "response",
          message: "Diet generation completed successfully",
          created_at: new Date().toISOString(),
        });

        this.logger.info("Diet generation completed successfully", { generationId });
      } catch (error) {
        // Update generation status to error
        await this.supabase
          .from("generations")
          .update({
            status: "error",
            metadata: { error: error instanceof Error ? error.message : String(error) },
          })
          .eq("id", generationId);

        // Log error
        await this.supabase.from("generation_logs").insert({
          generation_id: generationId,
          event_type: "error",
          message: `Diet generation error: ${error instanceof Error ? error.message : String(error)}`,
          created_at: new Date().toISOString(),
        });

        this.logger.error("Diet generation failed", error instanceof Error ? error : new Error(String(error)), {
          generationId,
        });
      }
    } catch (error) {
      // Log initialization error
      await this.supabase.from("generation_logs").insert({
        generation_id: generationId,
        event_type: "error",
        message: `OpenRouter initialization error: ${error instanceof Error ? error.message : String(error)}`,
        created_at: new Date().toISOString(),
      });

      this.logger.error("OpenRouter initialization failed", error instanceof Error ? error : new Error(String(error)), {
        generationId,
      });
      throw new ServerError("Failed to initialize OpenRouter service", error);
    }
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
