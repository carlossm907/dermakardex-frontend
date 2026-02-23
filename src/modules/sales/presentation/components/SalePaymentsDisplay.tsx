import type { SalePayment } from "../../domain/models/sale-payment.model";
import { PaymentMethodBadge } from "./PaymentMethodBadge";

interface SalePaymentsDisplayProps {
  payments: SalePayment[];
  total: number;
  className?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

export const SalePaymentsDisplay: React.FC<SalePaymentsDisplayProps> = ({
  payments,
  total,
  className = "",
}) => {
  const isMixedPayment = payments.length > 1;

  return (
    <div className={`space-y-3 ${className}`}>
      {isMixedPayment && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Pago Mixto
          </span>
          <span className="flex-1 h-px bg-neutral-200" />
        </div>
      )}

      {payments.map((payment, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-2 px-3 rounded-lg bg-neutral-50 border border-neutral-200"
        >
          <PaymentMethodBadge method={payment.method} />
          <span className="font-semibold text-neutral-900">
            {formatCurrency(payment.amount)}
          </span>
        </div>
      ))}

      {isMixedPayment && (
        <div className="flex items-center justify-between pt-2 border-t-2 border-neutral-300">
          <span className="font-semibold text-neutral-700">Total pagado:</span>
          <span className="text-lg font-bold text-green-700">
            {formatCurrency(total)}
          </span>
        </div>
      )}
    </div>
  );
};
