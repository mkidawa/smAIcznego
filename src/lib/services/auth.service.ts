import type { SupabaseClient } from "@supabase/supabase-js";
import { Logger } from "../logger";
import { UnauthorizedError, ServerError, ApiError } from "../errors/api-error";
import {
  updatePasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type UpdatePasswordInput,
} from "@/modules/auth/types/auth.schema";
import type { Database } from "@/db/database.types";
import type { AstroCookies } from "astro";
import { createSupabaseAdminInstance } from "@/db/supabase.client";

interface RegisterPayload extends RegisterInput {
  cookies: AstroCookies;
  request: Request;
}

export class AuthService {
  private readonly logger = Logger.getInstance();

  constructor(private supabase: SupabaseClient<Database>) {}

  async login({ email, password }: LoginInput) {
    this.logger.info("Attempting user login", { email });

    const { data: authData, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      this.logger.error("Login failed", error, { email });
      throw new UnauthorizedError("Invalid email or password");
    }

    this.logger.info("User logged in successfully", { email });
    return { user: authData.user };
  }

  async register({ email, password, cookies, request }: RegisterPayload) {
    this.logger.info("Attempting user registration", { email });

    const { data: authData, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      this.logger.error("Registration failed", error, { email });
      throw new ServerError("Registration failed", error.message);
    }

    this.logger.info("User registered successfully", { email });

    // Additional admin instance to bypass RLS
    const supabaseAdmin = createSupabaseAdminInstance({
      cookies: cookies,
      headers: request.headers,
    });

    if (authData.user) {
      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        user_id: authData.user.id,
        terms_accepted: false,
        allergies: [],
      });

      if (profileError) {
        this.logger.error("Profile creation failed", profileError, { email });
        throw new ServerError("Profile creation failed", profileError.message);
      } else {
        this.logger.info("Profile created successfully", { email });
      }
    }

    return { user: authData.user };
  }

  async resetPassword({ email, url }: ResetPasswordInput & { url: URL }) {
    this.logger.info("Attempting password reset", { email });

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${url.origin}/new-password`,
    });

    if (error) {
      this.logger.error("Password reset failed", error, { email });
      throw new ServerError("Password reset failed", error.message);
    }

    this.logger.info("Password reset email sent successfully", { email });
    return { message: "Password reset email sent" };
  }

  async verifyResetToken(tokenHash: string) {
    this.logger.info("Verifying reset token");

    if (!tokenHash) {
      this.logger.error("Token hash is missing");
      throw new ApiError("Token hash is required", 400);
    }

    const {
      error,
      data: { user },
    } = await this.supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });

    if (error) {
      this.logger.error("Error verifying reset token", error);
      throw new ApiError("Invalid or expired token", 400, error.message);
    }

    this.logger.info("Reset token verified successfully", { userId: user?.id });
    return { user };
  }

  async updatePassword(input: UpdatePasswordInput) {
    this.logger.info("Attempting to update password");

    // Validate input
    const result = updatePasswordSchema.safeParse(input);
    if (!result.success) {
      throw result.error;
    }

    const { error } = await this.supabase.auth.updateUser({
      password: result.data.password,
    });

    if (error) {
      this.logger.error("Password update failed", error);
      throw new ApiError("Password update failed", 500, error.message);
    }

    this.logger.info("Password updated successfully");
    return { message: "Password updated successfully" };
  }

  async logout() {
    this.logger.info("Attempting user logout");

    const { error } = await this.supabase.auth.signOut();

    if (error) {
      this.logger.error("Logout failed", error);
      throw new ServerError("Logout failed", error.message);
    }

    this.logger.info("User logged out successfully");
    return { success: true };
  }
}
