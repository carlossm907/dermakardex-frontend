import { useState } from "react";
import type { SaleTimelineItem } from "../../domain/models/sales-timeline.model";

interface SalesTimelineSaleCardProps {
  sale: SaleTimelineItem;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

const formatTime = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

const PAYMENT_COLORS: Record<string, string> = {
  CASH: "bg-green-100 text-green-700",
  CARD: "bg-blue-100 text-blue-700",
  YAPE: "bg-purple-100 text-purple-700",
  PLIN: "bg-sky-100 text-sky-700",
};

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  YAPE: "Yape",
  PLIN: "Plin",
};

export const SalesTimelineSaleCard: React.FC<SalesTimelineSaleCardProps> = ({
  sale,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden transition-shadow hover:shadow-sm">
      {/* Header row */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 gap-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Time badge */}
          <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md shrink-0">
            {formatTime(sale.saleTime)}
          </span>

          {/* Ticket */}
          <span className="text-xs font-medium text-neutral-400 shrink-0">
            #{sale.ticketNumber}
          </span>

          {/* Customer */}
          <span className="text-sm font-medium text-neutral-800 truncate">
            {sale.customerFullName}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Payments */}
          <div className="hidden sm:flex items-center gap-1">
            {sale.payments.map((p, i) => (
              <span
                key={i}
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  PAYMENT_COLORS[p.method] ?? "bg-neutral-100 text-neutral-600"
                }`}
              >
                {PAYMENT_LABELS[p.method] ?? p.method}
              </span>
            ))}
          </div>

          {/* Total */}
          <span className="text-sm font-bold text-neutral-900 tabular-nums">
            {formatCurrency(sale.total)}
          </span>

          {/* Chevron */}
          <svg
            className={`w-4 h-4 text-neutral-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-neutral-100 px-4 py-3 bg-neutral-50 space-y-3">
          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
              Productos
            </p>
            <div className="space-y-1">
              {sale.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-neutral-400 text-xs shrink-0">
                      ×{item.quantity}
                    </span>
                    <span className="text-neutral-700 truncate">
                      {item.productName}
                    </span>
                    <span className="text-neutral-400 text-xs shrink-0">
                      ({item.presentation})
                    </span>
                  </div>
                  <span className="text-neutral-700 font-medium tabular-nums shrink-0 ml-2">
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payments */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
              Pagos
            </p>
            <div className="flex flex-wrap gap-2">
              {sale.payments.map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                    PAYMENT_COLORS[p.method] ??
                    "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  <span>{PAYMENT_LABELS[p.method] ?? p.method}</span>
                  <span className="font-bold tabular-nums">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
