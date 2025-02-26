export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      available_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_name: string
          profile_id: string
          quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_name: string
          profile_id: string
          quantity: number
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_name?: string
          profile_id?: string
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "available_ingredients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      children_profiles: {
        Row: {
          allergies: string[] | null
          birth_date: string
          created_at: string
          id: string
          name: string
          preferences: string[] | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          birth_date: string
          created_at?: string
          id?: string
          name: string
          preferences?: string[] | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          birth_date?: string
          created_at?: string
          id?: string
          name?: string
          preferences?: string[] | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leftovers: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          ingredient_name: string
          photos: string[] | null
          profile_id: string
          quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          ingredient_name: string
          photos?: string[] | null
          profile_id: string
          quantity: number
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          ingredient_name?: string
          photos?: string[] | null
          profile_id?: string
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leftovers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          auto_generation_feedback: string | null
          auto_generation_rating: number | null
          child_id: string | null
          created_at: string
          date: string
          id: string
          is_auto_generated: boolean | null
          meal_time: string
          profile_id: string
          recipe_id: string
          updated_at: string
        }
        Insert: {
          auto_generation_feedback?: string | null
          auto_generation_rating?: number | null
          child_id?: string | null
          created_at?: string
          date: string
          id?: string
          is_auto_generated?: boolean | null
          meal_time?: string
          profile_id: string
          recipe_id: string
          updated_at?: string
        }
        Update: {
          auto_generation_feedback?: string | null
          auto_generation_rating?: number | null
          child_id?: string | null
          created_at?: string
          date?: string
          id?: string
          is_auto_generated?: boolean | null
          meal_time?: string
          profile_id?: string
          recipe_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_statistics: {
        Row: {
          child_id: string | null
          created_at: string
          frequency: number | null
          id: string
          last_served: string
          profile_id: string
          recipe_id: string
          updated_at: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          frequency?: number | null
          id?: string
          last_served: string
          profile_id: string
          recipe_id: string
          updated_at?: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          frequency?: number | null
          id?: string
          last_served?: string
          profile_id?: string
          recipe_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_statistics_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_statistics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_statistics_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipe_favorites: {
        Row: {
          created_at: string
          id: string
          profile_id: string | null
          recipe_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id?: string | null
          recipe_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string | null
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          profile_id: string | null
          rating: number
          recipe_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          profile_id?: string | null
          rating: number
          recipe_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          profile_id?: string | null
          rating?: number
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ratings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ratings_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_tags: {
        Row: {
          created_at: string
          id: string
          profile_id: string | null
          recipe_id: string | null
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id?: string | null
          recipe_id?: string | null
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string | null
          recipe_id?: string | null
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          allergens: string[] | null
          auto_generated: boolean | null
          budget_max: number | null
          child_id: string | null
          cooking_steps: Json | null
          cost_estimate: number | null
          created_at: string
          dietary_preferences: string[] | null
          difficulty: string
          health_benefits: Json | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: string
          is_generated: boolean | null
          max_age: number | null
          max_prep_time: number
          meal_type: string
          min_age: number | null
          name: string
          nutritional_info: Json
          preparation_time: number
          profile_id: string
          seasonal_months: number[] | null
          seasonality: string[] | null
          servings: number
          source: string | null
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          auto_generated?: boolean | null
          budget_max?: number | null
          child_id?: string | null
          cooking_steps?: Json | null
          cost_estimate?: number | null
          created_at?: string
          dietary_preferences?: string[] | null
          difficulty?: string
          health_benefits?: Json | null
          id?: string
          image_url?: string | null
          ingredients: Json
          instructions: string
          is_generated?: boolean | null
          max_age?: number | null
          max_prep_time?: number
          meal_type?: string
          min_age?: number | null
          name: string
          nutritional_info: Json
          preparation_time?: number
          profile_id: string
          seasonal_months?: number[] | null
          seasonality?: string[] | null
          servings?: number
          source?: string | null
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          auto_generated?: boolean | null
          budget_max?: number | null
          child_id?: string | null
          cooking_steps?: Json | null
          cost_estimate?: number | null
          created_at?: string
          dietary_preferences?: string[] | null
          difficulty?: string
          health_benefits?: Json | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: string
          is_generated?: boolean | null
          max_age?: number | null
          max_prep_time?: number
          meal_type?: string
          min_age?: number | null
          name?: string
          nutritional_info?: Json
          preparation_time?: number
          profile_id?: string
          seasonal_months?: number[] | null
          seasonality?: string[] | null
          servings?: number
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          id: string
          items: Json
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          items: Json
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_meal_plan_requirements: {
        Args: {
          profile_id: string
        }
        Returns: {
          can_generate: boolean
          message: string
        }[]
      }
      validate_health_benefit_categories: {
        Args: {
          benefits: Json
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
