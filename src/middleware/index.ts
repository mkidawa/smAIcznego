import { defineMiddleware } from "astro:middleware";
import { Logger } from "../lib/logger";
import { createSupabaseServerInstance } from "@/db/supabase.client";

const logger = Logger.getInstance();

// Ścieżki publiczne - dostępne bez logowania
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/reset-password",
  "/new-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/update-password",
  "/api/healthcheck",
];

export const onRequest = defineMiddleware(async ({ locals, request, cookies, url, redirect }, next) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Attach supabase client to locals
  locals.supabase = supabase;

  // Sprawdź czy ścieżka jest publiczna
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // Sprawdź sesję użytkownika
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    logger.info("Unauthorized access attempt", {
      requestId,
      path: url.pathname,
    });
    return redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    logger.error("Error fetching profile", profileError);
  }

  // Dodaj dane użytkownika do kontekstu
  if (user) {
    locals.user = {
      id: user.id,
      email: user.email ?? null,
      profile,
    };
  }

  // Log request start
  logger.info("Started processing HTTP request", {
    requestId,
    method: request.method,
    url: url.pathname,
    query: Object.fromEntries(url.searchParams),
    headers: {
      "content-type": request.headers.get("content-type"),
      "user-agent": request.headers.get("user-agent"),
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
