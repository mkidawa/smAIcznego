export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      diets: {
        Row: {
          calories_per_day: number;
          created_at: string;
          end_date: string;
          generation_id: number;
          id: number;
          number_of_days: number;
          preferred_cuisines: Database["public"]["Enums"]["cuisine_type"][];
          status: Database["public"]["Enums"]["diet_status"];
          user_id: string;
        };
        Insert: {
          calories_per_day: number;
          created_at?: string;
          end_date: string;
          generation_id: number;
          id?: number;
          number_of_days: number;
          preferred_cuisines?: Database["public"]["Enums"]["cuisine_type"][];
          status?: Database["public"]["Enums"]["diet_status"];
          user_id: string;
        };
        Update: {
          calories_per_day?: number;
          created_at?: string;
          end_date?: string;
          generation_id?: number;
          id?: number;
          number_of_days?: number;
          preferred_cuisines?: Database["public"]["Enums"]["cuisine_type"][];
          status?: Database["public"]["Enums"]["diet_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diets_generation_id_fkey";
            columns: ["generation_id"];
            isOneToOne: false;
            referencedRelation: "generations";
            referencedColumns: ["id"];
          },
        ];
      };
      generation_logs: {
        Row: {
          created_at: string;
          event_type: string;
          generation_id: number;
          id: number;
          message: string | null;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          generation_id: number;
          id?: number;
          message?: string | null;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          generation_id?: number;
          id?: number;
          message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "generation_logs_generation_id_fkey";
            columns: ["generation_id"];
            isOneToOne: false;
            referencedRelation: "generations";
            referencedColumns: ["id"];
          },
        ];
      };
      generations: {
        Row: {
          created_at: string;
          id: number;
          metadata: Json;
          source_text: string;
          status: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          metadata?: Json;
          source_text: string;
          status?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          metadata?: Json;
          source_text?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      meals: {
        Row: {
          approx_calories: number | null;
          day: number;
          diet_id: number;
          id: number;
          instructions: string | null;
          meal_type: Database["public"]["Enums"]["meal_type"];
        };
        Insert: {
          approx_calories?: number | null;
          day: number;
          diet_id: number;
          id?: number;
          instructions?: string | null;
          meal_type: Database["public"]["Enums"]["meal_type"];
        };
        Update: {
          approx_calories?: number | null;
          day?: number;
          diet_id?: number;
          id?: number;
          instructions?: string | null;
          meal_type?: Database["public"]["Enums"]["meal_type"];
        };
        Relationships: [
          {
            foreignKeyName: "meals_diet_id_fkey";
            columns: ["diet_id"];
            isOneToOne: false;
            referencedRelation: "diets";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          age: number | null;
          allergies: string[];
          dietary_preferences: string | null;
          gender: string | null;
          terms_accepted: boolean;
          user_id: string;
          weight: number | null;
        };
        Insert: {
          age?: number | null;
          allergies?: string[];
          dietary_preferences?: string | null;
          gender?: string | null;
          terms_accepted?: boolean;
          user_id: string;
          weight?: number | null;
        };
        Update: {
          age?: number | null;
          allergies?: string[];
          dietary_preferences?: string | null;
          gender?: string | null;
          terms_accepted?: boolean;
          user_id?: string;
          weight?: number | null;
        };
        Relationships: [];
      };
      recipes: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          instructions: string | null;
          meal_id: number | null;
          title: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          instructions?: string | null;
          meal_id?: number | null;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          instructions?: string | null;
          meal_id?: number | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipes_meal_id_fkey";
            columns: ["meal_id"];
            isOneToOne: true;
            referencedRelation: "meals";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_lists: {
        Row: {
          created_at: string;
          diet_id: number;
          id: number;
          items: string[];
        };
        Insert: {
          created_at?: string;
          diet_id: number;
          id?: number;
          items?: string[];
        };
        Update: {
          created_at?: string;
          diet_id?: number;
          id?: number;
          items?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "shopping_lists_diet_id_fkey";
            columns: ["diet_id"];
            isOneToOne: true;
            referencedRelation: "diets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      cuisine_type:
        | "polish"
        | "italian"
        | "indian"
        | "asian"
        | "vegan"
        | "vegetarian"
        | "gluten-free"
        | "keto"
        | "paleo";
      diet_status: "draft" | "meals_ready" | "ready" | "archived";
      meal_type: "breakfast" | "second breakfast" | "lunch" | "afternoon snack" | "dinner";
    };
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      cuisine_type: ["polish", "italian", "indian", "asian", "vegan", "vegetarian", "gluten-free", "keto", "paleo"],
      diet_status: ["draft", "meals_ready", "ready", "archived"],
      meal_type: ["breakfast", "second breakfast", "lunch", "afternoon snack", "dinner"],
    },
  },
} as const;
