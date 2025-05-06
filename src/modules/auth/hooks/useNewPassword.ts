import { useState, useEffect } from "react";
import { z } from "zod";
import type { updatePasswordSchema } from "../types/auth.schema";

type FormData = z.infer<typeof updatePasswordSchema>;

export const useNewPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenHash, setTokenHash] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isTokenChecking, setIsTokenChecking] = useState(false);

  useEffect(() => {
    const getTokenFromUrl = () => {
      if (typeof window === "undefined") return null;
      const tokenHash = new URLSearchParams(window.location.search).get("token_hash");
      return tokenHash;
    };

    const verifyToken = async (tokenHash: string) => {
      setIsTokenChecking(true);
      try {
        const response = await fetch("/api/auth/verify-reset-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token_hash: tokenHash }),
        });

        if (!response.ok) {
          setIsTokenValid(false);
          throw new Error("Nieprawidłowy lub wygasły token");
        }

        setIsTokenValid(true);
        setTokenHash(tokenHash);
      } catch (err) {
        setIsTokenValid(false);
        setError(err instanceof Error ? err.message : "Wystąpił błąd podczas weryfikacji tokenu");
      } finally {
        setIsTokenChecking(false);
      }
    };

    const token = getTokenFromUrl();
    if (token) {
      verifyToken(token);
    } else {
      setIsTokenValid(false);
      setError("Brak tokenu resetowania hasła w URL");
    }
  }, []);

  const updatePassword = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      if (!tokenHash) {
        throw new Error("Brak tokenu resetowania hasła");
      }

      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          token_hash: tokenHash,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Wystąpił błąd podczas zmiany hasła");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas zmiany hasła");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updatePassword,
    isLoading,
    error,
    success,
    isTokenValid,
    isTokenChecking,
  };
};
