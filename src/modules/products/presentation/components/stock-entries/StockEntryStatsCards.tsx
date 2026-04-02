import type { StockEntry } from "@/modules/products/domain/models/stock-entry.model";
import { Card } from "@/shared/components/ui/Card";

interface StockEntryStatsCardsProps {
  entries: StockEntry[];
}

export const StockEntryStatsCards: React.FC<StockEntryStatsCardsProps> = ({
  entries,
}) => {
  const totalUnits = entries.reduce((sum, e) => sum + e.quantity, 0);
  const totalInvestment = entries.reduce(
    (sum, e) => sum + e.totalInvestment,
    0,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Total Entradas</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {entries.length}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
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
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Total Unidades</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {totalUnits}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Inversión Total</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              S/{" "}
              {totalInvestment.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
};
