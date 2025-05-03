import type { CreateShoppingListResponse } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import { Logger } from "../logger";
import { z } from "zod";
import { ValidationError } from "../errors/api-error";

const createShoppingListSchema = z.object({
  items: z
    .array(
      z
        .string({
          required_error: "Each list item must be a text",
          invalid_type_error: "Each list item must be a text",
        })
        .min(1, "List item cannot be empty")
        .max(200, "List item cannot be longer than 200 characters")
    )
    .min(1, "Shopping list must contain at least one item")
    .max(100, "Shopping list cannot contain more than 100 items"),
});

export type CreateShoppingListSchema = typeof createShoppingListSchema;

export class ShoppingListService {
  private readonly logger = Logger.getInstance();

  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createShoppingList(dietId: number, data: unknown) {
    if (!dietId || isNaN(dietId)) {
      throw new ValidationError("Invalid diet ID");
    }

    const validationResult = createShoppingListSchema.safeParse(data);
    if (!validationResult.success) {
      throw new ValidationError("Invalid shopping list data", validationResult.error.errors);
    }

    this.logger.info("Starting shopping list creation", { dietId });

    try {
      // Check if diet exists
      const { data: diet, error: dietError } = await this.supabase
        .from("diet")
        .select("*")
        .eq("id", dietId)
        .eq("user_id", import.meta.env.MOCK_USER_ID)
        .single();

      if (dietError || !diet) {
        this.logger.warn("Diet not found", { dietId, error: dietError });
        return new Response(
          JSON.stringify({
            error: "DIET_NOT_FOUND",
            details: dietError ? dietError.message : "Diet not found",
          }),
          { status: 404 }
        );
      }

      // Check if shopping list already exists
      const { data: existingList } = await this.supabase
        .from("shopping_list")
        .select("*")
        .eq("diet_id", dietId)
        .maybeSingle();

      if (existingList) {
        this.logger.warn("Shopping list already exists", { dietId });
        return new Response(
          JSON.stringify({
            error: "SHOPPING_LIST_ALREADY_EXISTS",
            details: "Shopping list for this diet already exists",
          }),
          { status: 409 }
        );
      }

      // Create new shopping list
      const { data: insertedList, error: insertError } = await this.supabase
        .from("shopping_list")
        .insert({
          diet_id: dietId,
          items: validationResult.data.items,
          created_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (insertError || !insertedList) {
        throw new Error(insertError ? insertError.message : "Error while creating shopping list");
      }

      // Check if diet has assigned meals
      const { count: mealsCount } = await this.supabase
        .from("meal")
        .select("*", { count: "exact", head: true })
        .eq("diet_id", dietId);

      // If there are meals, update diet status to 'ready'
      if (mealsCount && mealsCount > 0) {
        await this.supabase.from("diet").update({ status: "ready" }).eq("id", dietId);
        this.logger.info("Updated diet status to 'ready'", { dietId });
      }

      // Prepare and return response
      const responsePayload: CreateShoppingListResponse = {
        shopping_list_id: insertedList.id,
      };

      this.logger.info("Shopping list created successfully", { dietId, shoppingListId: insertedList.id });
      return new Response(JSON.stringify(responsePayload), { status: 201 });
    } catch (error) {
      this.logger.error("Error while creating shopping list", error as Error, { dietId });
      return new Response(
        JSON.stringify({
          error: "SERVER_ERROR",
          details: error instanceof Error ? error.message : String(error),
        }),
        { status: 500 }
      );
    }
  }

  async getShoppingList(dietId: number) {
    if (!dietId || isNaN(dietId)) {
      throw new ValidationError("Invalid diet ID");
    }

    this.logger.info("Starting shopping list retrieval", { dietId });

    try {
      // Check if diet exists
      const { data: diet, error: dietError } = await this.supabase
        .from("diet")
        .select("*")
        .eq("id", dietId)
        .eq("user_id", import.meta.env.MOCK_USER_ID)
        .single();

      if (dietError || !diet) {
        this.logger.warn("Diet not found", { dietId, error: dietError });
        return new Response(
          JSON.stringify({
            error: "DIET_NOT_FOUND",
            details: dietError ? dietError.message : "Diet not found",
          }),
          { status: 404 }
        );
      }

      // Get shopping list
      const { data: shoppingList, error: shoppingListError } = await this.supabase
        .from("shopping_list")
        .select("*")
        .eq("diet_id", dietId)
        .single();

      if (shoppingListError) {
        this.logger.warn("Shopping list not found", { dietId, error: shoppingListError });
        return new Response(
          JSON.stringify({
            error: "SHOPPING_LIST_NOT_FOUND",
            details: shoppingListError.message,
          }),
          { status: 404 }
        );
      }

      this.logger.info("Shopping list retrieved successfully", { dietId });
      return new Response(JSON.stringify(shoppingList), { status: 200 });
    } catch (error) {
      this.logger.error("Error while retrieving shopping list", error as Error, { dietId });
      return new Response(
        JSON.stringify({
          error: "SERVER_ERROR",
          details: error instanceof Error ? error.message : String(error),
        }),
        { status: 500 }
      );
    }
  }
}
