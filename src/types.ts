import type { Database } from "./api/db/database.types";
import type { DietPlanResponse } from "./types/openRouter";

// Aliasy dla typów enum z bazy danych
export type CuisineType = Database["public"]["Enums"]["cuisine_type"];
export type DietStatus = Database["public"]["Enums"]["diet_status"];
export type MealType = Database["public"]["Enums"]["meal_type"];
export type GenerationStatus = "pending" | "completed";

// ======================= PROFIL =======================
/**
 * DTO dla tworzenia profilu użytkownika.
 */
export interface CreateProfileCommand {
  age: number;
  gender: "male" | "female" | "other";
  weight: number;
  allergies: string[];
  terms_accepted: true; // musi być true przy pierwszym zapisie
}

/**
 * DTO dla aktualizacji profilu użytkownika. Wszystkie pola są opcjonalne.
 */
export type UpdateProfileCommand = Partial<CreateProfileCommand>;

/**
 * DTO odpowiedzi zwracanej przez endpoint profilu.
 */
export interface ProfileResponse {
  id: string; // identyfikator użytkownika (Supabase user id)
  age: number;
  gender: "male" | "female" | "other";
  weight: number;
  allergies: string[];
  terms_accepted: boolean;
  created_at: string;
  updated_at?: string;
}

// ======================= DIETA =======================
/**
 * DTO dla tworzenia diety.
 * Pochodzi z modelu bazy danych 'diet', mapując pola z notacją snake_case na camelCase.
 */
export interface CreateDietCommand {
  number_of_days: number; // zakres 1-14
  calories_per_day: number; // wartość > 0
  preferred_cuisines: CuisineType[]; // lista preferowanych kuchni
  generation_id: number; // musi istnieć i należeć do użytkownika
}

/**
 * DTO odpowiedzi przy tworzeniu diety.
 */
export interface CreateDietResponse {
  diet_id: number;
  status: DietStatus; // 'draft', 'meals_ready', 'ready'
  generation_id: number;
}

// ======================= POSIŁKI =======================
/**
 * DTO dla tworzenia przepisu, zagnieżdżonego w poleceniu tworzenia posiłku.
 * Pochodzi z modelu 'recipe'.
 */
export interface CreateRecipeCommand {
  title: string;
  description?: string;
  instructions: string;
}

/**
 * DTO dla tworzenia pojedynczego posiłku.
 * Pochodzi z modelu bazy danych 'meal', z mapowaniem pól na camelCase.
 */
export interface CreateMealCommand {
  day: number; // wartość > 0 i ≤ numberOfDays z diety
  meal_type: MealType;
  instructions?: string;
  approx_calories?: number;
  recipe?: CreateRecipeCommand; // opcjonalny przepis
}

/**
 * Command Model dla grupowego tworzenia posiłków.
 */
export interface BulkCreateMealsCommand {
  meals: CreateMealCommand[];
}

/**
 * Odpowiedź przy tworzeniu posiłków - lista utworzonych identyfikatorów posiłków.
 */
export type BulkCreateMealsResponse = number[];

// ======================= LISTA ZAKUPÓW =======================
/**
 * DTO dla tworzenia listy zakupów.
 * Pochodzi z modelu 'shopping_list'.
 */
export interface CreateShoppingListCommand {
  items: string[];
}

/**
 * DTO odpowiedzi przy tworzeniu listy zakupów.
 */
export interface CreateShoppingListResponse {
  shopping_list_id: number;
}

// ======================= GENERACJA =======================
/**
 * Model danych generacji.
 */
export interface Generation {
  id: number;
  status: GenerationStatus;
  created_at: string;
}

/**
 * DTO dla tworzenia rekordu generacji.
 * Zawiera parametry potrzebne do wywołania AI,
 * mapując je na odpowiednie encje (model 'generation').
 */
export interface CreateGenerationCommand {
  number_of_days: number;
  calories_per_day: number;
  meals_per_day: number;
  preferred_cuisines: CuisineType[];
}

/**
 * DTO odpowiedzi przy tworzeniu rekordu generacji.
 */
export interface CreateGenerationResponse {
  generation_id: number;
  status: GenerationStatus;
}

/**
 * DTO odpowiedzi przy pobieraniu stanu generacji.
 */
export interface GenerationResponse extends Generation {
  preview?: DietPlanResponse;
}

// ======================= PRZEPIS =======================
/**
 * DTO odpowiedzi dla przepisu.
 * Pochodzi z modelu 'recipe'.
 */
export interface RecipeResponse {
  id: number;
  title: string;
  description: string | null;
  instructions: string | null;
  created_at: string;
}
