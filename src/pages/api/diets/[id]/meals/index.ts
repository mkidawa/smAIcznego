import type { APIRoute } from "astro";
import { z } from "zod";
import type { BulkCreateMealsCommand, CreateMealCommand } from "../../../../../types";
import { MealService } from "../../../../../lib/services/meal.service";

// Schema for a single meal
const mealSchema = z.object({
  day: z.number(),
  meal_type: z.enum(["breakfast", "second breakfast", "lunch", "afternoon snack", "dinner"]),
  instructions: z.string().optional(),
  approx_calories: z.number().positive().optional(),
}) satisfies z.ZodType<CreateMealCommand>;

// Schema for the entire request
const bulkCreateMealsSchema = z.object({
  meals: z.array(mealSchema).min(1),
}) satisfies z.ZodType<BulkCreateMealsCommand>;

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const dietId = Number(params.id);
    if (isNaN(dietId)) {
      return new Response(JSON.stringify({ error: "Invalid diet ID format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parsing and validating input data
    const rawData = await request.json();
    const validationResult = bulkCreateMealsSchema.safeParse(rawData);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { meals } = validationResult.data;
    const mealService = new MealService(locals.supabase);

    // Check if diet exists
    const { exists, numberOfDays } = await mealService.validateDiet(dietId);

    if (!exists) {
      return new Response(JSON.stringify({ error: "Diet not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (numberOfDays === null) {
      return new Response(JSON.stringify({ error: "Invalid diet data" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate days relative to diet length
    const invalidDays = meals.filter((meal) => meal.day > numberOfDays);
    if (invalidDays.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid meal days",
          details: `Meal days cannot exceed diet length (${numberOfDays} days)`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check for meal uniqueness
    const { hasConflicts, conflicts } = await mealService.validateMealUniqueness(dietId, meals);
    if (hasConflicts) {
      return new Response(
        JSON.stringify({
          error: "Meal conflicts detected",
          details: "Cannot add multiple meals of the same type for the same day",
          conflicts,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Add meals and update diet status within a transaction
    const mealIds = await mealService.createMealsWithStatusUpdate(dietId, meals);

    return new Response(JSON.stringify({ meal_ids: mealIds }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in bulk create meals endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
