import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { GenerationService } from "@/lib/services/generation.service";
import { errorHandler } from "@/middleware/error-handler";
import { Logger } from "@/lib/logger";
import { UnauthorizedError } from "@/lib/errors/api-error";

const logger = Logger.getInstance();

export const POST: APIRoute = errorHandler(async ({ request, cookies }) => {
  const supabaseClient = createSupabaseServerInstance({
    cookies: cookies,
    headers: request.headers,
  });

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    logger.warn("Unauthorized access attempt", {
      path: new URL(request.url).pathname,
    });
    throw new UnauthorizedError("Unauthorized access");
  }

  const generationService = new GenerationService(supabaseClient);
  const body = await request.json();
  const { generation_id, params } = body;

  // Verify the generation belongs to the authenticated user
  const { data: generation, error: genError } = await supabaseClient
    .from("generations")
    .select("user_id")
    .eq("id", generation_id)
    .single();

  if (genError || !generation) {
    logger.warn("Generation not found or access denied", {
      generationId: generation_id,
      userId: user.id,
    });
    throw new UnauthorizedError("Access denied");
  }

  if (generation.user_id !== user.id) {
    logger.warn("Unauthorized access to generation", {
      generationId: generation_id,
      userId: user.id,
      ownerUserId: generation.user_id,
    });
    throw new UnauthorizedError("Access denied");
  }

  try {
    // Process the generation
    await generationService.processGeneration(generation_id, params);

    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    logger.error("Failed to process generation", error instanceof Error ? error : new Error(String(error)), {
      generationId: generation_id,
    });

    return new Response(
      JSON.stringify({
        error: "PROCESSING_ERROR",
        message: error instanceof Error ? error.message : "Failed to process generation",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});
