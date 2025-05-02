import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { CreateMealCommand, DietStatus, MealType } from "../../types";

export class MealService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Sprawdza czy dieta istnieje i pobiera jej długość
   */
  async validateDiet(dietId: number): Promise<{
    exists: boolean;
    numberOfDays: number | null;
  }> {
    const { data: diet, error } = await this.supabase.from("diet").select("number_of_days").eq("id", dietId).single();

    if (error || !diet) {
      return { exists: false, numberOfDays: null };
    }

    return {
      exists: true,
      numberOfDays: diet.number_of_days,
    };
  }

  /**
   * Sprawdza czy nie ma konfliktów między posiłkami (ten sam typ w tym samym dniu)
   */
  async validateMealUniqueness(
    dietId: number,
    meals: CreateMealCommand[]
  ): Promise<{
    hasConflicts: boolean;
    conflicts?: { day: number; meal_type: MealType }[];
  }> {
    // Grupujemy nowe posiłki po dniu i typie
    const mealGroups = new Map<string, boolean>();
    const conflicts: { day: number; meal_type: MealType }[] = [];
    // Sprawdzamy duplikaty w nowych posiłkach
    for (const meal of meals) {
      const key = `${meal.day}-${meal.meal_type}`;
      if (mealGroups.has(key)) {
        conflicts.push({ day: meal.day, meal_type: meal.meal_type });
      }
      mealGroups.set(key, true);
    }

    // Sprawdzamy konflikty z istniejącymi posiłkami
    const { data: existingMeals, error } = await this.supabase
      .from("meal")
      .select("day, meal_type")
      .eq("diet_id", dietId);

    if (error) {
      throw new Error(`Failed to check meal uniqueness: ${error.message}`);
    }

    for (const existing of existingMeals) {
      const key = `${existing.day}-${existing.meal_type}`;
      if (mealGroups.has(key)) {
        conflicts.push({ day: existing.day, meal_type: existing.meal_type });
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
    };
  }

  /**
   * Dodaje wiele posiłków do diety i aktualizuje jej status w ramach jednej transakcji
   */
  async createMealsWithStatusUpdate(dietId: number, meals: CreateMealCommand[]): Promise<number[]> {
    // Dodajemy posiłki
    const { data, error: insertError } = await this.supabase
      .from("meal")
      .insert(
        meals.map((meal) => ({
          ...meal,
          diet_id: dietId,
        }))
      )
      .select("id");

    if (insertError) {
      throw new Error(`Failed to create meals: ${insertError.message}`);
    }

    // Aktualizujemy status diety
    const { error: updateError } = await this.supabase
      .from("diet")
      .update({ status: "meals_ready" as DietStatus })
      .eq("id", dietId);

    if (updateError) {
      throw new Error(`Failed to update diet status: ${updateError.message}`);
    }

    return data.map((meal: { id: number }) => meal.id);
  }
}
