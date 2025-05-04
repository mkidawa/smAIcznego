import { describe, it, expect } from "vitest";
import { groupMealsByDay } from "./groupMealsByDay";
import type { MealItem } from "../../diet.types";

describe("groupMealsByDay", () => {
  it("should group meals by day", () => {
    // Arrange
    const meals: MealItem[] = [
      { id: 1, day: 1, meal_type: "breakfast", approx_calories: 300, instructions: "Breakfast instructions" },
      { id: 2, day: 1, meal_type: "lunch", approx_calories: 600, instructions: "Lunch instructions" },
      { id: 3, day: 1, meal_type: "dinner", approx_calories: 500, instructions: "Dinner instructions" },
      { id: 4, day: 2, meal_type: "breakfast", approx_calories: 350, instructions: "Breakfast instructions" },
      { id: 5, day: 2, meal_type: "lunch", approx_calories: 550, instructions: "Lunch instructions" },
    ];

    // Act
    const result = groupMealsByDay(meals);

    // Assert
    expect(result).toEqual({
      1: [
        { id: 1, day: 1, meal_type: "breakfast", approx_calories: 300, instructions: "Breakfast instructions" },
        { id: 2, day: 1, meal_type: "lunch", approx_calories: 600, instructions: "Lunch instructions" },
        { id: 3, day: 1, meal_type: "dinner", approx_calories: 500, instructions: "Dinner instructions" },
      ],
      2: [
        { id: 4, day: 2, meal_type: "breakfast", approx_calories: 350, instructions: "Breakfast instructions" },
        { id: 5, day: 2, meal_type: "lunch", approx_calories: 550, instructions: "Lunch instructions" },
      ],
    });
  });

  it("should return an empty object for an empty meals array", () => {
    // Arrange
    const meals: MealItem[] = [];

    // Act
    const result = groupMealsByDay(meals);

    // Assert
    expect(result).toEqual({});
  });

  it("should handle meals with non-consecutive days", () => {
    // Arrange
    const meals: MealItem[] = [
      { id: 1, day: 1, meal_type: "breakfast", approx_calories: 300, instructions: "Breakfast instructions" },
      { id: 2, day: 3, meal_type: "lunch", approx_calories: 600, instructions: "Lunch instructions" },
      { id: 3, day: 5, meal_type: "dinner", approx_calories: 500, instructions: "Dinner instructions" },
    ];

    // Act
    const result = groupMealsByDay(meals);

    // Assert
    expect(result).toEqual({
      1: [{ id: 1, day: 1, meal_type: "breakfast", approx_calories: 300, instructions: "Breakfast instructions" }],
      3: [{ id: 2, day: 3, meal_type: "lunch", approx_calories: 600, instructions: "Lunch instructions" }],
      5: [{ id: 3, day: 5, meal_type: "dinner", approx_calories: 500, instructions: "Dinner instructions" }],
    });
  });
});
