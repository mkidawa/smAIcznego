import { useGetDiet } from "./useGetDiet";
import { useGetMeals } from "../../../meals/hooks/useGetMeals";
import { useGetShoppingList } from "@/modules/shoppingList/hooks/useGetShoppingList";
import type { DietDetailViewModel } from "../../diet.types";

interface UseGetDietDetailProps {
  dietId: number;
}

interface UseGetDietDetailReturn {
  dietDetails: DietDetailViewModel | null;
  isLoading: boolean;
  error: string | null;
}

export const useGetDietDetail = ({ dietId }: UseGetDietDetailProps): UseGetDietDetailReturn => {
  const { diet, isLoading: isDietLoading, error: dietError } = useGetDiet({ dietId });
  const { meals, isLoading: isMealsLoading, error: mealsError } = useGetMeals({ dietId });
  const { shoppingList, isLoading: isShoppingListLoading, error: shoppingListError } = useGetShoppingList({ dietId });

  const isLoading = isDietLoading || isMealsLoading || isShoppingListLoading;
  const error = dietError || mealsError || shoppingListError;

  const dietDetails: DietDetailViewModel | null = diet
    ? {
        ...diet,
        meals,
        shoppingList,
      }
    : null;

  return {
    dietDetails,
    isLoading,
    error,
  };
};
