export type HealthBenefitCategory = 
  | 'cognitive'
  | 'energy'
  | 'satiety'
  | 'digestive'
  | 'immunity'
  | 'growth'
  | 'mental'
  | 'organs'
  | 'beauty'
  | 'physical'
  | 'prevention'
  | 'global';

export interface HealthBenefit {
  icon: string;
  description: string;
  category: HealthBenefitCategory;
}