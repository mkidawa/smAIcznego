import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "../db/supabase.client";
import { Logger } from "../lib/logger";

const logger = Logger.getInstance();

// Ścieżki publiczne - dostępne bez logowania
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Dodaj supabase do kontekstu
  context.locals.supabase = supabaseClient;

  // Sprawdź czy ścieżka jest publiczna
  if (PUBLIC_PATHS.includes(context.url.pathname)) {
    return next();
  }

  // Sprawdź sesję użytkownika
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    logger.info("Unauthorized access attempt", {
      requestId,
      path: context.url.pathname,
    });
    return context.redirect("/login");
  }

  // Dodaj dane użytkownika do kontekstu
  context.locals.user = {
    id: user.id,
    email: user.email ?? null,
  };

  // Log request start
  logger.info("Started processing HTTP request", {
    requestId,
    method: context.request.method,
    url: context.url.pathname,
    query: Object.fromEntries(context.url.searchParams),
    headers: {
      "content-type": context.request.headers.get("content-type"),
      "user-agent": context.request.headers.get("user-agent"),
    },
  });

  try {
    // Process request
    const response = await next();
    const duration = Date.now() - startTime;

    // Log success
    logger.info("Completed processing HTTP request", {
      requestId,
      status: response.status,
      duration: `${duration}ms`,
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error
    logger.error("Error while processing HTTP request", error as Error, {
      requestId,
      duration: `${duration}ms`,
    });

    // Return 500 error if not handled earlier
    return new Response(
      JSON.stringify({
        error: "SERVER_ERROR",
        details: error instanceof Error ? error.message : "Unexpected server error",
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
