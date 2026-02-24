import { useNavigate } from "react-router-dom";
import type { SaleListItem } from "../../domain/models/sale.model";
import { SaleStatusBadge } from "./SaleStatusBadge";

interface SaleCardProps {
  sale: SaleListItem;
  className?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date + "T00:00:00"));

const formatTime = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

export const SaleCard: React.FC<SaleCardProps> = ({ sale, className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/sales/${sale.id}`)}
      className={`w-full text-left p-4 bg-white border border-neutral-200 rounded-xl hover:border-primary-400 hover:shadow-md transition-all group ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Ticket number + estado */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <svg
              className="w-5 h-5 text-green-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <div className="font-bold text-neutral-900 font-mono tracking-wide">
              {sale.ticketNumber}
            </div>
            <div className="text-sm text-neutral-600 mt-0.5">
              {sale.customerFullName}
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-green-700">
            {formatCurrency(sale.total)}
          </div>
          <SaleStatusBadge status={sale.status} className="mt-1" />
        </div>
      </div>

      {/* Fecha y hora */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
        <svg
          className="w-3.5 h-3.5 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-xs text-neutral-500">
          {formatDate(sale.saleDate)} · {formatTime(sale.saleTime)}
        </span>
      </div>
    </button>
  );
};
