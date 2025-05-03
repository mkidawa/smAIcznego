import { useState, useEffect } from "react";
import type { MealItem } from "../../diet/diet.types";

interface UseGetMealsProps {
  dietId: number;
}

interface UseGetMealsReturn {
  meals: MealItem[];
  isLoading: boolean;
  error: string | null;
}

export const useGetMeals = ({ dietId }: UseGetMealsProps): UseGetMealsReturn => {
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/diets/${dietId}/meals`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Nie udało się pobrać posiłków");
        }

        const data: MealItem[] = await response.json();
        setMeals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
      } finally {
        setIsLoading(false);
      }
    };

    if (dietId) {
      fetchMeals();
    }
  }, [dietId]);

  return {
    meals,
    isLoading,
    error,
  };
};
