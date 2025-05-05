import { useState } from "react";
import type { CreateShoppingListCommand, CreateShoppingListResponse } from "@/types";

interface UseCreateShoppingListResult {
  createShoppingList: (dietId: number, data: CreateShoppingListCommand) => Promise<CreateShoppingListResponse>;
  isLoading: boolean;
  error: Error | null;
}

export const useCreateShoppingList = (): UseCreateShoppingListResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createShoppingList = async (
    dietId: number,
    data: CreateShoppingListCommand
  ): Promise<CreateShoppingListResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/diets/${dietId}/shopping-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CreateShoppingListResponse = await response.json();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create shopping list");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createShoppingList,
    isLoading,
    error,
  };
};
