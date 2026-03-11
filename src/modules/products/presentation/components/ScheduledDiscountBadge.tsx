import { DiscountType } from "../../domain/models/discount.type";

interface ScheduledDiscountBadgeProps {
  name: string;
  discountType: DiscountType;
  discountValue: number;
  className?: string;
}

export const ScheduledDiscountBadge: React.FC<ScheduledDiscountBadgeProps> = ({
  name,
  discountType,
  discountValue,
  className = "",
}) => {
  const getText = () => {
    if (discountType === DiscountType.PERCENTAGE) {
      return `${name} · ${discountValue}%`;
    }

    if (discountType === DiscountType.AMOUNT) {
      return `${name} · -S/${discountValue.toFixed(2)}`;
    }

    return name;
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 ${className}`}
    >
      {getText()}
    </span>
  );
};
