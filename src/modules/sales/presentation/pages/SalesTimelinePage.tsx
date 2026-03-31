import { useState } from "react";
import { useSaleStore } from "../../application/stores/sale.store";
import { Card } from "@/shared/components/ui/Card";
import { LoadingSpinner } from "@/modules/products/presentation/components/LoadingSpinner";
import { SalesTimelineFilters } from "../components/SalesTimelineFilters";
import { SalesTimelineDaySection } from "../components/SalesTimelineDaySection";
import { generateSalesTimelinePdf } from "../../utils/generateSalesTimelinePdf";
import type { SalesTimelineByDay } from "../../domain/models/sales-timeline.model";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

export interface TopSeller {
  name: string;
  salesCount: number;
  total: number;
}

// eslint-disable-next-line react-refresh/only-export-components
export function getTopSeller(timeline: SalesTimelineByDay[]): TopSeller | null {
  const map = new Map<number, { id: number } & TopSeller>();

  for (const day of timeline) {
    for (const block of day.blocks) {
      const entry = map.get(block.sellerUserId) ?? {
        id: block.sellerUserId,
        name: block.sellerFullName,
        salesCount: 0,
        total: 0,
      };
      entry.salesCount += block.sales.length;
      entry.total += block.sales.reduce((s, sale) => s + sale.total, 0);
      map.set(block.sellerUserId, entry);
    }
  }

  if (map.size === 0) return null;

  return [...map.values()].reduce((best, curr) =>
    curr.salesCount > best.salesCount ? curr : best,
  );
}

export const SalesTimelinePage: React.FC = () => {
  const { salesTimeline, isLoading, fetchSalesTimeline } = useSaleStore();

  const [searched, setSearched] = useState(false);
  const [periodLabel, setPeriodLabel] = useState("");
  const [currentYear, setCurrentYear] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(0);

  const handleSearch = async (year: number, month: number) => {
    setSearched(true);
    setCurrentYear(year);
    setCurrentMonth(month);
    setPeriodLabel(`${MONTHS[month - 1]} ${year}`);
    await fetchSalesTimeline(year, month);
  };

  const handlePrint = () => {
    generateSalesTimelinePdf(salesTimeline, currentYear, currentMonth);
  };

  const grandTotal = salesTimeline.reduce(
    (sum, day) =>
      sum +
      day.blocks.reduce(
        (s, block) => s + block.sales.reduce((ss, sale) => ss + sale.total, 0),
        0,
      ),
    0,
  );

  const totalSales = salesTimeline.reduce(
    (sum, day) => sum + day.blocks.reduce((s, b) => s + b.sales.length, 0),
    0,
  );

  const topSeller = getTopSeller(salesTimeline);
  const showPrint = searched && !isLoading && salesTimeline.length > 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-3">
        <h1 className="text-3xl font-bold text-neutral-900">
          Línea de Tiempo de Ventas
        </h1>
        <p className="text-neutral-600 mt-1">
          Visualiza las ventas del mes ordenadas por día y turno de vendedor
        </p>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <SalesTimelineFilters
          onSearch={handleSearch}
          isLoading={isLoading}
          showPrintButton={showPrint}
          onPrintReport={handlePrint}
        />
      </div>

      {/* Results */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 pb-8">
        {isLoading ? (
          <Card>
            <LoadingSpinner message="Generando línea de tiempo..." />
          </Card>
        ) : searched ? (
          <>
            {salesTimeline.length > 0 && (
              <>
                {/* Summary bar */}
                <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-700">
                      Período:
                    </span>
                    <span className="text-sm font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                      {periodLabel}
                    </span>
                  </div>
                  <span className="text-sm text-neutral-500">
                    · {salesTimeline.length} día
                    {salesTimeline.length !== 1 ? "s" : ""}
                    &nbsp;·&nbsp;{totalSales} venta{totalSales !== 1 ? "s" : ""}
                  </span>
                  <span className="ml-auto text-sm font-bold text-neutral-800 tabular-nums">
                    Total: {formatCurrency(grandTotal)}
                  </span>
                </div>

                {/* Top seller card */}
                {topSeller && (
                  <div className="mb-4 bg-white border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                        Vendedor del mes
                      </p>
                      <p className="text-sm font-bold text-neutral-900 truncate">
                        {topSeller.name}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-6 shrink-0">
                      <div className="text-center">
                        <p className="text-lg font-bold text-neutral-900 tabular-nums leading-tight">
                          {topSeller.salesCount}
                        </p>
                        <p className="text-xs text-neutral-500">ventas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-neutral-900 tabular-nums leading-tight">
                          {formatCurrency(topSeller.total)}
                        </p>
                        <p className="text-xs text-neutral-500">total</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline days */}
                <div className="space-y-3">
                  {salesTimeline.map((day) => (
                    <SalesTimelineDaySection key={day.date} day={day} />
                  ))}
                </div>
              </>
            )}

            {!isLoading && salesTimeline.length === 0 && (
              <Card>
                <div className="text-center py-14">
                  <svg
                    className="w-14 h-14 mx-auto text-neutral-200 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-neutral-400 text-sm">
                    No hay ventas registradas para{" "}
                    <span className="font-medium text-neutral-500">
                      {periodLabel}
                    </span>
                  </p>
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <div className="text-center py-14">
              <svg
                className="w-14 h-14 mx-auto text-neutral-200 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-neutral-400 text-sm">
                Selecciona un mes y presiona{" "}
                <span className="font-medium text-neutral-500">
                  Generar Timeline
                </span>
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
