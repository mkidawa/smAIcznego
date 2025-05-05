import type { Database } from "@/db/database.types";
import type { DietStatus, MealType } from "@/types";

export interface Diet {
  id: number;
  number_of_days: number;
  calories_per_day: number;
  preferred_cuisines: Database["public"]["Enums"]["cuisine_type"][];
  status: DietStatus;
  generation_id: number;
  end_date: string;
  created_at: string;
}

export interface MealItem {
  id: number;
  day: number;
  meal_type: MealType;
  approx_calories?: number;
  instructions?: string;
}

export interface DietDetailViewModel extends Diet {
  meals: MealItem[];
  shoppingList: string[];
}
