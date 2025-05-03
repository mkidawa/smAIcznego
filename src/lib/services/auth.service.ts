import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Logger } from "../logger";
import { UnauthorizedError, ServerError } from "../errors/api-error";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

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
    return new Response(JSON.stringify({ user: authData.user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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
    return new Response(JSON.stringify({ user: authData.user }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }

  async resetPassword({ email }: ResetPasswordInput) {
    this.logger.info("Attempting password reset", { email });

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      this.logger.error("Password reset failed", error, { email });
      throw new ServerError("Password reset failed", error.message);
    }

    this.logger.info("Password reset email sent successfully", { email });
    return new Response(JSON.stringify({ message: "Password reset email sent" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async logout() {
    this.logger.info("Attempting user logout");

    const { error } = await this.supabase.auth.signOut();

    if (error) {
      this.logger.error("Logout failed", error);
      throw new ServerError("Logout failed", error.message);
    }

    this.logger.info("User logged out successfully");
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
