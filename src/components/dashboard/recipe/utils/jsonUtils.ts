import { Json } from "@/integrations/supabase/types";

export const parseJsonField = <T>(field: Json | string | null): T => {
  if (!field) return [] as unknown as T;
  
  if (typeof field === 'string') {
    try {
      return JSON.parse(field) as T;
    } catch {
      return field as unknown as T;
    }
  }
  return field as T;
};

export const safeJsonParse = <T>(json: string | null | undefined, fallback: T): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};