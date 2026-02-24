import { useEffect, useState } from "react";
import type { CreateSalePaymentData } from "../../domain/models/sale-payment.model";
import { PaymentMethod } from "../../domain/models/payment-method.model";
import { PaymentMethodBadge } from "./PaymentMethodBadge";

interface PaymentFormProps {
  total: number;
  payments: CreateSalePaymentData[];
  onChange: (payment: CreateSalePaymentData[]) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

export const PaymentForm: React.FC<PaymentFormProps> = ({
  total,
  onChange,
}) => {
  const [amounts, setAmounts] = useState<Record<PaymentMethod, string>>({
    [PaymentMethod.CASH]: "",
    [PaymentMethod.CARD]: "",
    [PaymentMethod.YAPE]: "",
    [PaymentMethod.PLIN]: "",
  });

  const totalPaid = Object.values(amounts).reduce(
    (sum, v) => sum + (parseFloat(v) || 0),
    0,
  );
  const remaining = total - totalPaid;
  const cashAmount = parseFloat(amounts[PaymentMethod.CASH]) || 0;
  const change = cashAmount > total ? cashAmount - total : 0;

  useEffect(() => {
    const built: CreateSalePaymentData[] = [];

    Object.entries(amounts).forEach(([method, raw]) => {
      const amount = parseFloat(raw);
      if (amount > 0) {
        built.push({ method: method as PaymentMethod, amount });
      }
    });

    onChange(built);
  }, [amounts]);

  const handleAmountChange = (method: PaymentMethod, value: string) => {
    const clean = value.replace(/[^0-9.]/g, "");
    setAmounts((prev) => ({ ...prev, [method]: clean }));
  };

  const handleExactCash = () => {
    setAmounts((prev) => ({
      ...prev,
      [PaymentMethod.CASH]: total.toFixed(2),
      [PaymentMethod.CARD]: "",
      [PaymentMethod.YAPE]: "",
      [PaymentMethod.PLIN]: "",
    }));
  };

  const handleClearAll = () => {
    setAmounts({
      [PaymentMethod.CASH]: "",
      [PaymentMethod.CARD]: "",
      [PaymentMethod.YAPE]: "",
      [PaymentMethod.PLIN]: "",
    });
  };

  const isBalanced = Math.abs(remaining) < 0.01;

  return (
    <div className="space-y-4">
      {/* Inputs por método */}
      <div className="space-y-2">
        {Object.values(PaymentMethod).map((method) => (
          <div key={method} className="flex items-center gap-3">
            <div className="w-28 flex-shrink-0">
              <PaymentMethodBadge method={method} />
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 font-medium">
                S/
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amounts[method]}
                onChange={(e) => handleAmountChange(method, e.target.value)}
                className="input pl-9 text-right"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleExactCash}
          className="flex-1 text-xs px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-600"
        >
          Efectivo exacto
        </button>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-xs px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-600"
        >
          Limpiar
        </button>
      </div>

      {/* Resumen */}
      <div className="rounded-xl border-2 border-dashed p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Total a pagar:</span>
          <span className="font-semibold text-neutral-900">
            {formatCurrency(total)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Total ingresado:</span>
          <span
            className={`font-semibold ${
              totalPaid >= total ? "text-green-600" : "text-neutral-900"
            }`}
          >
            {formatCurrency(totalPaid)}
          </span>
        </div>

        {/* Pendiente */}
        {remaining > 0.01 && (
          <div className="flex justify-between text-sm pt-1 border-t border-neutral-200">
            <span className="text-red-600">Pendiente:</span>
            <span className="font-bold text-red-600">
              {formatCurrency(remaining)}
            </span>
          </div>
        )}

        {/* Vuelto */}
        {change > 0.01 && (
          <div className="flex justify-between text-sm pt-1 border-t border-neutral-200">
            <span className="text-blue-600">Vuelto:</span>
            <span className="font-bold text-blue-600">
              {formatCurrency(change)}
            </span>
          </div>
        )}

        {/* Balanceado */}
        {isBalanced && totalPaid > 0 && (
          <div className="flex items-center justify-center gap-2 pt-1 border-t border-green-200 text-green-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium">Pago balanceado</span>
          </div>
        )}
      </div>
    </div>
  );
};
