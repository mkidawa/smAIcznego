import type { Database } from "./db/database.types";

// Aliasy dla typów enum z bazy danych
export type CuisineType = Database["public"]["Enums"]["cuisine_type"];
export type DietStatus = Database["public"]["Enums"]["diet_status"];
export type MealType = Database["public"]["Enums"]["meal_type"];

// ======================= PROFIL =======================
/**
 * DTO dla tworzenia profilu użytkownika.
 */
export interface CreateProfileCommand {
  age: number;
  gender: "male" | "female" | "other";
  weight: number;
  allergies: string[];
  termsAccepted: true; // musi być true przy pierwszym zapisie
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
  termsAccepted: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ======================= DIETA =======================
/**
 * DTO dla tworzenia diety.
 * Pochodzi z modelu bazy danych 'diet', mapując pola z notacją snake_case na camelCase.
 */
export interface CreateDietCommand {
  numberOfDays: number; // zakres 1-14
  caloriesPerDay: number; // wartość > 0
  preferredCuisines: CuisineType[]; // lista preferowanych kuchni
  generationId: number; // musi istnieć i należeć do użytkownika
}

/**
 * DTO odpowiedzi przy tworzeniu diety.
 */
export interface CreateDietResponse {
  dietId: number;
  status: DietStatus; // 'draft', 'meals_ready', 'ready'
  generationId: number;
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
  mealType: MealType;
  instructions?: string;
  approxCalories?: number;
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
  shoppingListId: number;
}

// ======================= GENERACJA =======================
/**
 * DTO dla tworzenia rekordu generacji.
 * Zawiera parametry potrzebne do wywołania AI,
 * mapując je na odpowiednie encje (model 'generation').
 */
export interface CreateGenerationCommand {
  numberOfDays: number;
  caloriesPerDay: number;
  mealsPerDay: number;
  preferredCuisines: CuisineType[];
}

/**
 * DTO odpowiedzi przy tworzeniu rekordu generacji.
 */
export interface CreateGenerationResponse {
  generationId: number;
  status: "pending" | "completed";
}

/**
 * DTO odpowiedzi przy pobieraniu stanu generacji.
 */
export interface GenerationResponse {
  generationId: number;
  status: "pending" | "completed";
  preview?: CreateDietResponse; // Przykładowy podgląd diety oparty na CreateDietResponse
  createdAt: string;
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
  createdAt: string;
}
