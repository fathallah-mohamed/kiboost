interface ChildInfoProps {
  label: string;
  items: string[];
  emptyMessage: string;
}

export const ChildInfo = ({ label, items, emptyMessage }: ChildInfoProps) => (
  <p className="text-gray-600">
    {label}: {items.length > 0 ? items.join(', ') : emptyMessage}
  </p>
);