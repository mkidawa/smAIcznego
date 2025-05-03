import type { APIRoute } from "astro";
import { ProfileService } from "../../../lib/services/profile.service";
import type { CreateProfileCommand, UpdateProfileCommand } from "../../../types";

export const GET: APIRoute = async ({ locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized access" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const profileService = new ProfileService(locals.supabase);
    const profile = await profileService.getProfile(locals.user.id);

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error while fetching profile:", error);
    return new Response(JSON.stringify({ error: "An error occurred while fetching profile" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized access" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const command = (await request.json()) as CreateProfileCommand;

    // Check if profile already exists
    const profileService = new ProfileService(locals.supabase);
    const existingProfile = await profileService.getProfile(locals.user.id);

    if (existingProfile) {
      return new Response(JSON.stringify({ error: "Profile already exists" }), {
        status: 409,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const profile = await profileService.createProfile(locals.user.id, command);

    return new Response(JSON.stringify(profile), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error while creating profile:", error);
    return new Response(JSON.stringify({ error: "An error occurred while creating profile" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized access" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const command = (await request.json()) as UpdateProfileCommand;

    const profileService = new ProfileService(locals.supabase);
    const existingProfile = await profileService.getProfile(locals.user.id);

    if (!existingProfile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const profile = await profileService.updateProfile(locals.user.id, command);

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error while updating profile:", error);
    return new Response(JSON.stringify({ error: "An error occurred while updating profile" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
