import type { APIRoute } from "astro";
import { supabaseClient } from "../../db/supabase.client";

export const GET: APIRoute = async () => {
  try {
    // Simple query to check database connectivity using the profile table
    const { error } = await supabaseClient.from("profile").select("user_id").limit(1);

    if (error) {
      console.error("Healthcheck failed:", error.message);
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Database connection failed",
          error: error.message,
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
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
  } catch (error) {
    console.error("Healthcheck failed:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Internal server error during healthcheck",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
