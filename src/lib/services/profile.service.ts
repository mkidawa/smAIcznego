import type { Database } from "@/db/database.types";
import type { CreateProfileCommand, ProfileResponse, UpdateProfileCommand } from "../../types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Logger } from "../logger";

export class ProfileService {
  private readonly logger = Logger.getInstance();

  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getProfile(userId: string): Promise<ProfileResponse | null> {
    try {
      this.logger.info("Fetching user profile", { userId });

      const { data, error } = await this.supabase.from("profile").select("*").eq("user_id", userId).single();

      if (error) {
        this.logger.error("Failed to fetch profile", error, { userId });
        throw new Error(`Error while fetching profile: ${error.message}`);
      }

      if (!data) {
        this.logger.info("Profile not found", { userId });
        return null;
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
      this.logger.error("Unexpected error while fetching profile", error as Error, { userId });
      throw error;
    }
  }

  async createProfile(userId: string, command: CreateProfileCommand): Promise<ProfileResponse> {
    try {
      this.logger.info("Creating new profile", { userId, command });

      const { data, error } = await this.supabase
        .from("profile")
        .insert([{ user_id: userId, ...command }])
        .select()
        .single();

      if (error) {
        this.logger.error("Failed to create profile", error, { userId, command });
        throw new Error(`Error while creating profile: ${error.message}`);
      }

      if (!data) {
        const noDataError = new Error("Profile creation returned no data");
        this.logger.error("Profile creation returned no data", noDataError, { userId, command });
        throw noDataError;
      }

      this.logger.info("Profile created successfully", { userId });
      return {
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        allergies: data.allergies,
        terms_accepted: data.terms_accepted,
      };
    } catch (error) {
      this.logger.error("Unexpected error while creating profile", error as Error, { userId, command });
      throw error;
    }
  }

  async updateProfile(userId: string, command: UpdateProfileCommand): Promise<ProfileResponse> {
    try {
      this.logger.info("Updating profile", { userId, command });

      const { data, error } = await this.supabase
        .from("profile")
        .update(command)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        this.logger.error("Failed to update profile", error, { userId, command });
        throw new Error(`Error while updating profile: ${error.message}`);
      }

      if (!data) {
        const noDataError = new Error("Profile update returned no data");
        this.logger.error("Profile update returned no data", noDataError, { userId, command });
        throw noDataError;
      }

      this.logger.info("Profile updated successfully", { userId });
      return {
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        allergies: data.allergies,
        terms_accepted: data.terms_accepted,
      };
    } catch (error) {
      this.logger.error("Unexpected error while updating profile", error as Error, { userId, command });
      throw error;
    }
  }
}
