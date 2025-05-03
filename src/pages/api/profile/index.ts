import type { APIRoute } from "astro";
import { ProfileService, createProfileSchema, updateProfileSchema } from "@/lib/services/profile.service";
import { errorHandler } from "@/middleware/error-handler";
import { UnauthorizedError, ValidationError } from "@/lib/errors/api-error";

export const GET: APIRoute = errorHandler(async ({ locals }) => {
  if (!locals.user) {
    throw new UnauthorizedError();
  }

  const profileService = new ProfileService(locals.supabase);
  return new Response(JSON.stringify(await profileService.getProfile(locals.user.id)), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

export const POST: APIRoute = errorHandler(async ({ request, locals }) => {
  if (!locals.user) {
    throw new UnauthorizedError();
  }

  const rawData = await request.json();
  const result = createProfileSchema.safeParse(rawData);

  if (!result.success) {
    throw new ValidationError("Invalid profile data", result.error.errors);
  }

  const profileService = new ProfileService(locals.supabase);
  return new Response(JSON.stringify(await profileService.createProfile(locals.user.id, result.data)), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
});

export const PATCH: APIRoute = errorHandler(async ({ request, locals }) => {
  if (!locals.user) {
    throw new UnauthorizedError();
  }

  const rawData = await request.json();
  const result = updateProfileSchema.safeParse(rawData);

  if (!result.success) {
    throw new ValidationError("Invalid profile data", result.error.errors);
  }

  const profileService = new ProfileService(locals.supabase);
  return new Response(JSON.stringify(await profileService.updateProfile(locals.user.id, result.data)), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
