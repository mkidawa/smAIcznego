import type { Database } from "@/db/database.types";
import type { ProfileResponse } from "../../types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Logger } from "../logger";
import { z } from "zod";
import { NotFoundError, ServerError, ConflictError } from "../errors/api-error";

export const createProfileSchema = z.object({
  age: z.number().int().min(13).max(120),
  gender: z.enum(["male", "female", "other"]),
  weight: z.number().positive().max(300),
  allergies: z.array(z.string()).optional(),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "Terms must be accepted",
  }),
});

export const updateProfileSchema = createProfileSchema.partial();

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export class ProfileService {
  private readonly logger = Logger.getInstance();

  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getProfile(userId: string): Promise<ProfileResponse> {
    try {
      this.logger.info("Fetching user profile", { userId });

      const { data, error } = await this.supabase.from("profile").select("*").eq("user_id", userId).single();

      if (error) {
        this.logger.error("Failed to fetch profile", error, { userId });
        throw new ServerError("Failed to fetch profile", error.message);
      }

      if (!data) {
        this.logger.info("Profile not found", { userId });
        throw new NotFoundError("Profile not found");
      }

      this.logger.info("Profile fetched successfully", { userId });
      return {
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        allergies: data.allergies,
        terms_accepted: data.terms_accepted,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ServerError) {
        throw error;
      }
      this.logger.error("Unexpected error while fetching profile", error as Error, { userId });
      throw new ServerError("Failed to fetch profile");
    }
  }

  async createProfile(userId: string, data: CreateProfileInput): Promise<ProfileResponse> {
    try {
      this.logger.info("Creating new profile", { userId });

      // Sprawdź czy profil już istnieje
      const { data: existingProfile } = await this.supabase
        .from("profile")
        .select("user_id")
        .eq("user_id", userId)
        .single();

      if (existingProfile) {
        throw new ConflictError("Profile already exists");
      }

      const { data: newProfile, error } = await this.supabase
        .from("profile")
        .insert([{ user_id: userId, ...data }])
        .select()
        .single();

      if (error) {
        this.logger.error("Failed to create profile", error, { userId });
        throw new ServerError("Failed to create profile", error.message);
      }

      if (!newProfile) {
        throw new ServerError("Profile creation returned no data");
      }

      this.logger.info("Profile created successfully", { userId });
      return {
        age: newProfile.age,
        gender: newProfile.gender,
        weight: newProfile.weight,
        allergies: newProfile.allergies,
        terms_accepted: newProfile.terms_accepted,
      };
    } catch (error) {
      if (error instanceof ConflictError || error instanceof ServerError) {
        throw error;
      }
      this.logger.error("Unexpected error while creating profile", error as Error, { userId });
      throw new ServerError("Failed to create profile");
    }
  }

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<ProfileResponse> {
    try {
      this.logger.info("Updating profile", { userId });

      // Sprawdź czy profil istnieje
      const { data: existingProfile } = await this.supabase
        .from("profile")
        .select("user_id")
        .eq("user_id", userId)
        .single();

      if (!existingProfile) {
        throw new NotFoundError("Profile not found");
      }

      const { data: updatedProfile, error } = await this.supabase
        .from("profile")
        .update(data)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        this.logger.error("Failed to update profile", error, { userId });
        throw new ServerError("Failed to update profile", error.message);
      }

      if (!updatedProfile) {
        throw new ServerError("Profile update returned no data");
      }

      this.logger.info("Profile updated successfully", { userId });
      return {
        age: updatedProfile.age,
        gender: updatedProfile.gender,
        weight: updatedProfile.weight,
        allergies: updatedProfile.allergies,
        terms_accepted: updatedProfile.terms_accepted,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ServerError) {
        throw error;
      }
      this.logger.error("Unexpected error while updating profile", error as Error, { userId });
      throw new ServerError("Failed to update profile");
    }
  }
}
