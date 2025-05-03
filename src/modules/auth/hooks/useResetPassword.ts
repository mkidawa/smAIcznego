import { useState } from "react";
import { z } from "zod";

export const resetPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

interface UseResetPasswordOptions {
  redirectUrl?: string;
}

export const useResetPassword = ({ redirectUrl = "/login" }: UseResetPasswordOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Wystąpił nieoczekiwany błąd");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resetPassword,
    isLoading,
    error,
    success,
  };
};
