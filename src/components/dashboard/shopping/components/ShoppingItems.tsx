import { ShoppingListItem } from '../types';

interface ShoppingItemsProps {
  items: ShoppingListItem[];
  onToggleCheck: (index: number) => void;
}

export const ShoppingItems = ({ items, onToggleCheck }: ShoppingItemsProps) => {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
          <span>
            {item.item} - {item.quantity} {item.unit}
          </span>
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => onToggleCheck(index)}
            className="w-5 h-5"
          />
        </div>
      ))}
    </div>
  );
};