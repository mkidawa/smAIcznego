import { useState, useEffect, useCallback } from "react";
import type { Diet } from "../../diet.types";

interface UseGetDietProps {
  dietId?: number;
  generationId?: number;
}

interface UseGetDietReturn {
  diet: Diet | null;
  isLoading: boolean;
  error: string | null;
  trigger: () => Promise<void>;
}

/**
 * Hook for fetching diet data either by dietId or generationId
 * @param props - Object containing either dietId or generationId
 * @returns Object containing diet data, loading state and error message
 */
export const useGetDiet = ({ dietId, generationId }: UseGetDietProps): UseGetDietReturn => {
  const [diet, setDiet] = useState<Diet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiet = useCallback(async () => {
    if (!dietId && !generationId) {
      setError("Either dietId or generationId must be provided");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = dietId ? `/api/diets/${dietId}` : `/api/diets/${generationId}?fetchByGeneration=true`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch diet");
      }

      const data = await response.json();
      setDiet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [dietId, generationId]);

  useEffect(() => {
    fetchDiet();
  }, [dietId, fetchDiet, generationId]);

  return { diet, isLoading, error, trigger: fetchDiet };
};
