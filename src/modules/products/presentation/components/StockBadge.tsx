import type { StockStatus } from "../../domain/models/product.model";

interface StockBadgeProps {
  stock: number;
  status: StockStatus;
  className?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  stock,
  status,
  className = "",
}) => {
  const colorMap: Record<StockStatus, string> = {
    EMPTY: "bg-red-400 text-red-900",
    LOW: "bg-red-100 text-red-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    OK: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colorMap[status]
      } ${className}`}
    >
      {stock}
    </span>
  );
};
