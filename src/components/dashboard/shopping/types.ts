export interface ShoppingListItem {
  item: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

export interface AvailableIngredient {
  id?: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
}