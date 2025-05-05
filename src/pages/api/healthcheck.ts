import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { errorHandler } from "@/middleware/error-handler";
import { ServiceUnavailableError } from "@/lib/errors/api-error";
import { Logger } from "@/lib/logger";

const logger = Logger.getInstance();

export const GET: APIRoute = errorHandler(async ({ request, cookies }) => {
  // Simple query to check database connectivity using the profile table
  const supabaseClient = createSupabaseServerInstance({
    cookies: cookies,
    headers: request.headers,
  });

  const { error } = await supabaseClient.from("profiles").select("user_id").limit(1);

  if (error) {
    logger.error("Healthcheck failed:", error);
    throw new ServiceUnavailableError("Database connection failed", error.message);
  }

  return new Response(
    JSON.stringify({
      status: "healthy",
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
});
