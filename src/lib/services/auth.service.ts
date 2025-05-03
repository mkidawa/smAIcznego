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

export class AuthService {
  private readonly logger = Logger.getInstance();

  constructor(private supabase: SupabaseClient) {}

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

  async register({ email, password }: RegisterInput) {
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
    return { user: authData.user };
  }

  async resetPassword({ email }: ResetPasswordInput) {
    this.logger.info("Attempting password reset", { email });

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      // TODO: change to production url
      redirectTo: `http://localhost:3000/new-password`,
    });

    if (error) {
      this.logger.error("Password reset failed", error, { email });
      throw new ServerError("Password reset failed", error.message);
    }

    this.logger.info("Password reset email sent successfully", { email });
    return { message: "Password reset email sent" };
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
