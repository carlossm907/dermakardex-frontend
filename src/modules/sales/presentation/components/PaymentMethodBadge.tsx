import { Banknote, CreditCard, Smartphone, Wallet } from "lucide-react";

import type { LucideIcon } from "lucide-react";

import {
  PaymentMethod,
  PaymentMethodLabels,
} from "../../domain/models/payment-method.model";

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  className?: string;
}

const methodStyles: Record<
  PaymentMethod,
  { bg: string; text: string; Icon: LucideIcon }
> = {
  [PaymentMethod.CASH]: {
    bg: "bg-green-100",
    text: "text-green-800",
    Icon: Banknote,
  },
  [PaymentMethod.CARD]: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    Icon: CreditCard,
  },
  [PaymentMethod.YAPE]: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    Icon: Smartphone,
  },
  [PaymentMethod.PLIN]: {
    bg: "bg-teal-100",
    text: "text-teal-800",
    Icon: Wallet,
  },
};

export const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({
  method,
  className = "",
}) => {
  const { bg, text, Icon } = methodStyles[method];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text} ${className}`}
    >
      <Icon size={14} strokeWidth={2} />
      <span>{PaymentMethodLabels[method]}</span>
    </span>
  );
};
