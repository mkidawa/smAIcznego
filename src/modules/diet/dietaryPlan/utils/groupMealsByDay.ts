import type { MealItem } from "../../diet.types";

export const groupMealsByDay = (meals: MealItem[]): Record<number, MealItem[]> => {
  return meals.reduce(
    (acc, meal) => {
      if (!acc[meal.day]) {
        acc[meal.day] = [];
      }
      acc[meal.day].push(meal);
      return acc;
    },
    {} as Record<number, MealItem[]>
  );
};
