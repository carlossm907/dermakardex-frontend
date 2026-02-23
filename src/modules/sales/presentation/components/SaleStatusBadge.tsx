import {
  SaleStatusLabels,
  type SaleStatus,
} from "../../domain/models/sale-status.model";

interface SaleStatusBadgeProps {
  status: SaleStatus;
  className?: string;
}

export const SaleStatusBadge: React.FC<SaleStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      {SaleStatusLabels[status]}
    </span>
  );
};
