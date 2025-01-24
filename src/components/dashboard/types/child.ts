export interface ChildProfile {
  id: string;
  profile_id: string;
  name: string;
  birth_date: string;
  allergies?: string[];
  preferences?: string[];
  created_at?: string;
  updated_at?: string;
}