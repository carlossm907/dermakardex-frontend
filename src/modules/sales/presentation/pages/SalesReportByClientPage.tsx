import { useState } from "react";
import { useSaleStore } from "../../application/stores/sale.store";
import { Card } from "@/shared/components/ui/Card";
import { SaleReportTable } from "../components/SaleReportTable";
import { LoadingSpinner } from "@/modules/products/presentation/components/LoadingSpinner";
import { SaleReportByClientFilters } from "../components/SaleReportByClientFilters";
import { generateSalesReportPdf } from "../../utils/generateSalesReportPdf";

type ReportInfo =
  | { type: "day"; date: string }
  | { type: "month"; year: number; month: number }
  | null;

export const SalesReportByClientPage: React.FC = () => {
  const {
    salesReport,
    isLoading,
    fetchSalesReportByDay,
    fetchSalesReportByMonth,
  } = useSaleStore();

  const [showReport, setShowReport] = useState(false);
  const [reportInfo, setReportInfo] = useState<ReportInfo>(null);

  const handleReportByDay = async (date: string) => {
    setShowReport(true);
    setReportInfo({ type: "day", date });
    await fetchSalesReportByDay(date);
  };

  const handleReportByMonth = async (year: number, month: number) => {
    setShowReport(true);
    setReportInfo({ type: "month", year, month });
    await fetchSalesReportByMonth(year, month);
  };

  const handlePrint = () => {
    if (reportInfo) generateSalesReportPdf(salesReport, reportInfo);
  };

  const reportLabel = (): string => {
    if (!reportInfo) return "";
    if (reportInfo.type === "day") {
      const [y, m, d] = reportInfo.date.split("-");
      return `${d}/${m}/${y}`;
    }
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
    return `${MONTHS[reportInfo.month - 1]} ${reportInfo.year}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-3">
        <h1 className="text-3xl font-bold text-neutral-900">
          Reporte de Ventas por Cliente
        </h1>
        <p className="text-neutral-600 mt-1">
          Consulta las ventas agrupadas por cliente para un día o mes específico
        </p>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <SaleReportByClientFilters
          onReportByDay={handleReportByDay}
          onReportByMonth={handleReportByMonth}
          isLoading={isLoading}
          showPrintButton={showReport && !isLoading && salesReport.length > 0}
          onPrintReport={handlePrint}
        />
      </div>

      {/* Results */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 pb-8">
        {isLoading ? (
          <Card>
            <LoadingSpinner message="Generando reporte..." />
          </Card>
        ) : showReport ? (
          <>
            {salesReport.length > 0 && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-700">
                  {reportInfo?.type === "day" ? "Día:" : "Período:"}
                </span>
                <span className="text-sm font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  {reportLabel()}
                </span>
                <span className="text-sm text-neutral-500">
                  · {salesReport.length} cliente
                  {salesReport.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            <SaleReportTable report={salesReport} />
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-neutral-400 text-sm">
                Selecciona un período y presiona{" "}
                <span className="font-medium text-neutral-500">
                  Generar Reporte
                </span>
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
