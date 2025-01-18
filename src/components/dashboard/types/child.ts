export interface ChildProfile {
  id: string;
  name: string;
  birth_date: string;
  allergies: string[];
  preferences: string[];
  profile_id: string;  // Added this line to match database schema
}