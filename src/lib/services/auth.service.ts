import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Logger } from "../logger";

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

export class AuthService {
  private readonly logger = Logger.getInstance();

  constructor(private supabase: SupabaseClient) {}

  async login(email: string, password: string) {
    this.logger.info("Attempting user login", { email });

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      this.logger.error("Login failed", error, { email });
      throw new Error("Invalid email or password");
    }

    this.logger.info("User logged in successfully", { email });
    return data;
  }

  async register(email: string, password: string) {
    this.logger.info("Attempting user registration", { email });

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      this.logger.error("Registration failed", error, { email });
      throw new Error("Registration failed");
    }

    this.logger.info("User registered successfully", { email });
    return data;
  }

  async resetPassword(email: string) {
    this.logger.info("Attempting password reset", { email });

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      this.logger.error("Password reset failed", error, { email });
      throw new Error("Password reset failed");
    }

    this.logger.info("Password reset email sent successfully", { email });
    return true;
  }
}
