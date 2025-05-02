import { useState } from "react";
import type { BulkCreateMealsCommand, BulkCreateMealsResponse, CreateMealCommand } from "@/types";

interface AddMealsInBulkParams {
  dietId: number;
  meals: CreateMealCommand[];
}

interface AddMealsInBulkState {
  isLoading: boolean;
  error: string | null;
  data: BulkCreateMealsResponse | null;
}

export const useAddMealsInBulk = () => {
  const [state, setState] = useState<AddMealsInBulkState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const addMeals = async ({ dietId, meals }: AddMealsInBulkParams) => {
    try {
      if (!dietId) {
        throw new Error("ID diety jest wymagane");
      }

      if (!meals.length) {
        throw new Error("Lista posiłków nie może być pusta");
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(`/api/diets/${dietId}/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meals } as BulkCreateMealsCommand),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Wystąpił błąd podczas dodawania posiłków");
      }

      const data = await response.json();
      setState((prev) => ({ ...prev, isLoading: false, data }));
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Wystąpił nieznany błąd";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  return {
    addMeals,
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
  };
};
