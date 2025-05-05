import { useState } from "react";
import type { CreateDietCommand, CreateDietResponse } from "@/types";
import { toast } from "sonner";

interface UseCreateDietOptions {
  onSuccess?: (data: CreateDietResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateDiet = (options?: UseCreateDietOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createDiet = async (command: CreateDietCommand) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/diets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Wystąpił błąd podczas tworzenia diety");
      }

      const data: CreateDietResponse = await response.json();

      toast.success("Dieta została pomyślnie utworzona");

      options?.onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Wystąpił nieznany błąd");
      setError(error);

      toast.error(error.message);

      options?.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createDiet,
    isLoading,
    error,
  };
};
