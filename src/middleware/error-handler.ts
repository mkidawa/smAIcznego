import type { APIRoute } from "astro";
import { ApiError } from "../lib/errors/api-error";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

type RouteHandler = (context: Parameters<APIRoute>[0]) => Promise<Response> | Response;

export const errorHandler = (handler: RouteHandler): APIRoute => {
  return async (context) => {
    try {
      return await handler(context);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof ApiError) {
        return new Response(
          JSON.stringify({
            error: error.message,
            details: error.details,
          }),
          {
            status: error.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: "Validation failed",
            details: fromZodError(error).message,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Internal server error",
          details: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
};
