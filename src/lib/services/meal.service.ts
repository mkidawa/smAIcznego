import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { CreateMealCommand, DietStatus, MealType } from "../../types";
import { Logger } from "../logger";

export class MealService {
  private readonly logger = Logger.getInstance();

  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Validates if diet exists and retrieves its length
   */
  async validateDiet(dietId: number): Promise<{
    exists: boolean;
    numberOfDays: number | null;
  }> {
    this.logger.info("Validating diet existence", { dietId });

    const { data: diet, error } = await this.supabase.from("diet").select("number_of_days").eq("id", dietId).single();

    if (error || !diet) {
      this.logger.warn("Diet not found during validation", { dietId, error });
      return { exists: false, numberOfDays: null };
    }

    this.logger.info("Diet validation successful", { dietId, numberOfDays: diet.number_of_days });
    return {
      exists: true,
      numberOfDays: diet.number_of_days,
    };
  }

  /**
   * Checks for conflicts between meals (same type on the same day)
   */
  async validateMealUniqueness(
    dietId: number,
    meals: CreateMealCommand[]
  ): Promise<{
    hasConflicts: boolean;
    conflicts?: { day: number; meal_type: MealType }[];
  }> {
    this.logger.info("Starting meal uniqueness validation", { dietId, mealsCount: meals.length });

    // Group new meals by day and type
    const mealGroups = new Map<string, boolean>();
    const conflicts: { day: number; meal_type: MealType }[] = [];
    // Check duplicates in new meals
    for (const meal of meals) {
      const key = `${meal.day}-${meal.meal_type}`;
      if (mealGroups.has(key)) {
        conflicts.push({ day: meal.day, meal_type: meal.meal_type });
      }
      mealGroups.set(key, true);
    }

    // Check conflicts with existing meals
    const { data: existingMeals, error } = await this.supabase
      .from("meal")
      .select("day, meal_type")
      .eq("diet_id", dietId);

    if (error) {
      this.logger.error("Failed to check meal uniqueness", error, { dietId });
      throw new Error(`Failed to check meal uniqueness: ${error.message}`);
    }

    for (const existing of existingMeals) {
      const key = `${existing.day}-${existing.meal_type}`;
      if (mealGroups.has(key)) {
        conflicts.push({ day: existing.day, meal_type: existing.meal_type });
      }
    }

    const result = {
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
    };

    this.logger.info("Meal uniqueness validation completed", {
      dietId,
      hasConflicts: result.hasConflicts,
      conflictsCount: conflicts.length,
    });

    return result;
  }

  /**
   * Adds multiple meals to diet and updates its status in a single transaction
   */
  async createMealsWithStatusUpdate(dietId: number, meals: CreateMealCommand[]): Promise<number[]> {
    this.logger.info("Starting meal creation with status update", { dietId, mealsCount: meals.length });

    // Add meals
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
      this.logger.error("Failed to create meals", insertError, { dietId });
      throw new Error(`Failed to create meals: ${insertError.message}`);
    }

    // Update diet status
    const { error: updateError } = await this.supabase
      .from("diet")
      .update({ status: "meals_ready" as DietStatus })
      .eq("id", dietId);

    if (updateError) {
      this.logger.error("Failed to update diet status", updateError, { dietId });
      throw new Error(`Failed to update diet status: ${updateError.message}`);
    }

    this.logger.info("Successfully created meals and updated diet status", {
      dietId,
      createdMealsCount: data.length,
    });

    return data.map((meal: { id: number }) => meal.id);
  }

  /**
   * Pobiera wszystkie posiłki dla danej diety
   */
  async getMealsByDietId(dietId: number) {
    this.logger.info("Fetching meals for diet", { dietId });

    const { data: meals, error } = await this.supabase
      .from("meal")
      .select(
        `
        id,
        day,
        meal_type,
        instructions,
        approx_calories,
        recipe (
          id,
          title,
          description,
          instructions
        )
      `
      )
      .eq("diet_id", dietId)
      .order("day", { ascending: true });

    if (error) {
      this.logger.error("Failed to fetch meals", error, { dietId });
      throw new Error(`Failed to fetch meals: ${error.message}`);
    }

    this.logger.info("Successfully fetched meals", {
      dietId,
      mealsCount: meals.length,
    });

    return meals;
  }
}
