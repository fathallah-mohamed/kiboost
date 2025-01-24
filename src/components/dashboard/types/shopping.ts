import { Json } from "@/integrations/supabase/types";

export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface ShoppingList {
  id?: string;
  profile_id: string;
  items: ShoppingItem[];
  created_at?: string;
  updated_at?: string;
}

export interface ShoppingListDB {
  id?: string;
  profile_id: string;
  items: Json;
  created_at?: string;
  updated_at?: string;
}