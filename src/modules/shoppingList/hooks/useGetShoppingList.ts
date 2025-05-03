import { useState, useEffect } from "react";
import type { GetShoppingListResponse } from "../shopping-list.types";

interface UseGetShoppingListProps {
  dietId: number;
}

interface UseGetShoppingListReturn {
  shoppingList: string[];
  isLoading: boolean;
  error: string | null;
}

export const useGetShoppingList = ({ dietId }: UseGetShoppingListProps): UseGetShoppingListReturn => {
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/diets/${dietId}/shopping-list`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Nie udało się pobrać listy zakupów");
        }

        const data: GetShoppingListResponse = await response.json();
        setShoppingList(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
      } finally {
        setIsLoading(false);
      }
    };

    if (dietId) {
      fetchShoppingList();
    }
  }, [dietId]);

  return {
    shoppingList,
    isLoading,
    error,
  };
};
