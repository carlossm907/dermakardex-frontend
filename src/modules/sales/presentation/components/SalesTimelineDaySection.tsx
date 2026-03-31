import { useState } from "react";
import type { SalesTimelineByDay } from "../../domain/models/sales-timeline.model";
import { SalesTimelineSellerBlockCard } from "./SalesTimelineSellerBlockCard";

interface SalesTimelineDayProps {
  day: SalesTimelineByDay;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

const formatDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(d);
};

export const SalesTimelineDaySection: React.FC<SalesTimelineDayProps> = ({
  day,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const dayTotal = day.blocks.reduce(
    (sum, block) => sum + block.sales.reduce((s, sale) => s + sale.total, 0),
    0,
  );
  const totalSales = day.blocks.reduce((sum, b) => sum + b.sales.length, 0);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Day header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span className="text-sm font-bold text-neutral-800 capitalize">
            {formatDate(day.date)}
          </span>
          <span className="text-xs text-neutral-400 font-medium">
            {totalSales} venta{totalSales !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-neutral-900 tabular-nums">
            {formatCurrency(dayTotal)}
          </span>
          <svg
            className={`w-4 h-4 text-neutral-400 transition-transform ${collapsed ? "-rotate-90" : ""}`}
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

      {/* Blocks */}
      {!collapsed && (
        <div className="px-5 pb-5 space-y-4 border-t border-neutral-100">
          <div className="pt-4 space-y-5">
            {day.blocks.map((block, i) => (
              <SalesTimelineSellerBlockCard key={i} block={block} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
