import { useState } from "react";
import { z } from "zod";
import type { updatePasswordSchema } from "../types/auth.schema";

type FormData = z.infer<typeof updatePasswordSchema>;

export const useNewPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updatePassword = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "An error occurred while changing the password");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas zmiany hasła");
    } finally {
      setIsLoading(false);
    }
  };

  return { updatePassword, isLoading, error, success };
};
