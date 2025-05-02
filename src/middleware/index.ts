import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../api/db/supabase.client";

export const onRequest = defineMiddleware((context, next) => {
  context.locals.supabase = supabaseClient;
  return next();
});
