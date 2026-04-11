import { useEffect, useState } from "react";
import { useSalesReportStore } from "../../application/stores/sales-report.store";
import type {
  SalesReportDateMode,
  SalesReportScope,
} from "../../domain/models/sales-report.model";
import { SalesReportTable } from "../components/sales-report/SalesReportTable";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SalesReportProductSelector } from "../components/sales-report/SalesReportProductSelector";
import { SalesReportScopeSelector } from "../components/sales-report/SalesReportScopeSelector";
import { generateSalesProductReportPdf } from "../../utils/generateSalesProductReportPdf";
import { useProductStore } from "../../application/stores/product.store";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SalesReportDateSelector } from "../components/sales-report/SalesReportDateSelector";

const todayISO = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const SalesReportPage: React.FC = () => {
  const { products, fetchProducts } = useProductStore();
  const {
    report,
    isLoading,
    error,
    fetchSingleProductSalesReport,
    fetchAllProductsSalesReport,
    fetchSelectedProductsSalesReport,
    fetchAffectedProductsSalesReport,
    clearReport,
    clearError,
  } = useSalesReportStore();

  const [scope, setScope] = useState<SalesReportScope>("all");
  const [dateMode, setDateMode] = useState<SalesReportDateMode>("day");
  const [from, setFrom] = useState<string>(todayISO());
  const [to, setTo] = useState<string>(todayISO());
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleScopeChange = (newScope: SalesReportScope) => {
    setScope(newScope);
    setSelectedProductId(null);
    setSelectedProductIds([]);
    clearReport();
    setHasSearched(false);
  };

  const handleToggleMultiple = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSetToday = () => {
    const today = todayISO();
    setFrom(today);
    setTo(today);
  };

  const isReadyToSearch = (): boolean => {
    if (!from || !to) return false;
    if (scope === "single" && !selectedProductId) return false;
    if (scope === "multiple" && selectedProductIds.length === 0) return false;
    return true;
  };

  const handleGenerateReport = async () => {
    clearError();
    setHasSearched(true);

    if (scope === "all") {
      await fetchAllProductsSalesReport(from, to);
    } else if (scope === "affected") {
      await fetchAffectedProductsSalesReport(from, to);
    } else if (scope === "single" && selectedProductId !== null) {
      await fetchSingleProductSalesReport(selectedProductId, from, to);
    } else if (scope === "multiple" && selectedProductIds.length > 0) {
      await fetchSelectedProductsSalesReport(selectedProductIds, from, to);
    }
  };

  const handleClear = () => {
    clearReport();
    setHasSearched(false);
  };

  const handleExportPdf = () => {
    generateSalesProductReportPdf(report, from, to);
  };

  const isSingleDay = from === to;
  const showResults = hasSearched && !isLoading;
  const hasData = showResults && report.length > 0;

  const reportTitle = (): string | null => {
    if (!hasSearched) return null;
    const fmt = (d: string) => {
      const [y, m, day] = d.split("-");
      return `${day}/${m}/${y}`;
    };
    if (isSingleDay) return `Ventas del día ${fmt(from)}`;
    return `Ventas del ${fmt(from)} al ${fmt(to)}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-3">
        <h1 className="text-3xl font-bold text-neutral-900">
          Reporte de Ventas
        </h1>
        <p className="text-neutral-600 mt-1">
          Consulta las unidades vendidas por producto en un rango de fechas
        </p>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <Card className="space-y-5">
          <SalesReportScopeSelector
            value={scope}
            onChange={handleScopeChange}
          />

          <SalesReportProductSelector
            scope={scope}
            products={products}
            selectedProductId={selectedProductId}
            selectedProductIds={selectedProductIds}
            onSelectSingle={setSelectedProductId}
            onToggleMultiple={handleToggleMultiple}
          />

          <SalesReportDateSelector
            from={from}
            to={to}
            mode={dateMode}
            onModeChange={setDateMode}
            onFromChange={setFrom}
            onToChange={setTo}
            onSetToday={handleSetToday}
          />

          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={handleGenerateReport}
              disabled={!isReadyToSearch() || isLoading}
              className="flex items-center gap-2"
            >
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Generar reporte
            </Button>

            {hasData && (
              <Button
                variant="secondary"
                onClick={handleExportPdf}
                className="flex items-center gap-2 text-sm"
              >
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
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Imprimir reporte
              </Button>
            )}

            {showResults && (
              <Button
                variant="secondary"
                onClick={handleClear}
                className="text-sm"
              >
                Limpiar
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Results */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 pb-8">
        <Card>
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg mb-4 text-sm text-red-700">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner message="Generando reporte..." />
          ) : showResults ? (
            <>
              {hasData && (
                <div className="px-4 pt-4 pb-2">
                  <h2 className="text-base font-semibold text-neutral-800">
                    {reportTitle()}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {report.length} producto{report.length !== 1 ? "s" : ""}
                    {isSingleDay && " · Ventas registradas hoy"}
                  </p>
                </div>
              )}
              <SalesReportTable
                report={report}
                isSingleDay={isSingleDay}
                dateMode={dateMode}
                from={from}
                to={to}
              />
            </>
          ) : (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-neutral-400 text-sm">
                Configura los filtros y presiona{" "}
                <span className="font-medium text-neutral-500">
                  Generar reporte
                </span>
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
