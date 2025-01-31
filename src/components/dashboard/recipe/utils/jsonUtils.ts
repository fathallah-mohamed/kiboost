import { Json } from "@/integrations/supabase/types";

export const parseJsonField = <T>(field: Json | string | null): T => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field) as T;
    } catch {
      return field as unknown as T;
    }
  }
  return field as T;
};