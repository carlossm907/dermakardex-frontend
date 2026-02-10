import React from "react";
import { DiscountType } from "../../domain/models/discount.type";

interface DiscountBadgeProps {
  discountType: DiscountType;
  discountValue: number;
  className?: string;
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({
  discountType,
  discountValue,
  className = "",
}) => {
  if (discountType === DiscountType.NONE || discountValue === 0) {
    return null;
  }

  const getDiscountText = () => {
    if (discountType === DiscountType.PERCENTAGE) {
      return `${discountValue}% de descuento`;
    } else if (discountType === DiscountType.AMOUNT) {
      return `-S/${discountValue.toFixed(2)}`;
    }

    return "";
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 ${className}`}
    >
      {getDiscountText()}
    </span>
  );
};
