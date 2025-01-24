export interface Category {
  id: string;
  title: string;
  slogan: string;
  description: string;
  isActive: boolean;
  icon: string;
  route?: string;
  comingSoonMessage?: string;
}