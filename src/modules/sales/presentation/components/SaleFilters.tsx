import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { useState } from "react";

type FilterMode =
  | "all"
  | "day"
  | "month"
  | "customer"
  | "report-day"
  | "report-month";

interface SaleFiltersProps {
  onFilterAll: () => void;
  onFilterByDay: (date: string) => void;
  onFilterByMonth: (year: number, month: number) => void;
  onFilterByCustomer: (dni: string) => void;
  onReportByDay: (date: string) => void;
  onReportByMonth: (year: number, month: number) => void;
  isLoading: boolean;

  onPrintReport?: () => void;
  showPrintButton?: boolean;
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

export const SaleFilters: React.FC<SaleFiltersProps> = ({
  onFilterAll,
  onFilterByDay,
  onFilterByMonth,
  onFilterByCustomer,
  onReportByDay,
  onReportByMonth,
  onPrintReport,
  showPrintButton,
  isLoading,
}) => {
  const [mode, setMode] = useState<FilterMode>("all");
  const [dayValue, setDayValue] = useState("");
  const [monthValue, setMonthValue] = useState(new Date().getMonth() + 1);
  const [yearValue, setYearValue] = useState(new Date().getFullYear());
  const [customerDni, setCustomerDni] = useState("");
  const [reportDayValue, setReportDayValue] = useState(
    new Date().toLocaleDateString("sv-SE"),
  );
  const [reportMonthValue, setReportMonthValue] = useState(
    new Date().getMonth() + 1,
  );
  const [reportYearValue, setReportYearValue] = useState(
    new Date().getFullYear(),
  );

  const now = new Date();

  const years = [
    now.getFullYear(),
    now.getFullYear() - 1,
    now.getFullYear() - 2,
  ];

  const handleModeChange = (newMode: FilterMode) => {
    setMode(newMode);
    if (newMode === "all") {
      onFilterAll();
    }
  };

  const handleApplyFilter = () => {
    if (mode === "day" && dayValue) {
      onFilterByDay(dayValue);
    } else if (mode === "month") {
      onFilterByMonth(yearValue, monthValue);
    } else if (mode === "customer" && customerDni.length === 8) {
      onFilterByCustomer(customerDni);
    } else if (mode === "report-day" && reportDayValue) {
      onReportByDay(reportDayValue);
    } else if (mode === "report-month") {
      onReportByMonth(reportYearValue, reportMonthValue);
    }
  };

  const tabClass = (m: FilterMode) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      mode === m
        ? "bg-primary-600 text-white"
        : "text-neutral-600 hover:bg-neutral-100"
    }`;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
      <div className="flex justify-between items-start">
        {/* Selector de modo */}
        <div className="flex flex-wrap gap-2">
          <button
            className={tabClass("all")}
            onClick={() => handleModeChange("all")}
          >
            Todas
          </button>
          <button
            className={tabClass("day")}
            onClick={() => handleModeChange("day")}
          >
            Por Día
          </button>
          <button
            className={tabClass("month")}
            onClick={() => handleModeChange("month")}
          >
            Por Mes
          </button>
          <button
            className={tabClass("customer")}
            onClick={() => handleModeChange("customer")}
          >
            Por Cliente
          </button>

          <span className="w-px bg-neutral-200 mx-1 self-stretch" />

          <button
            className={tabClass("report-day")}
            onClick={() => handleModeChange("report-day")}
          >
            Reporte por Día
          </button>
          <button
            className={tabClass("report-month")}
            onClick={() => handleModeChange("report-month")}
          >
            Reporte por Mes
          </button>
        </div>

        {showPrintButton && (
          <Button
            variant="secondary"
            onClick={onPrintReport}
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
                d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
              />
            </svg>
            Imprimir Reporte
          </Button>
        )}
      </div>

      {/* Filtro por día */}
      {mode === "day" && (
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Fecha"
              type="date"
              value={dayValue}
              onChange={(e) => setDayValue(e.target.value)}
            />
          </div>
          <Button
            onClick={handleApplyFilter}
            isLoading={isLoading}
            disabled={!dayValue}
            className="mb-1"
          >
            Buscar
          </Button>
        </div>
      )}

      {/* Filtro por mes */}
      {mode === "month" && (
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="label">Mes</label>
            <select
              className="input"
              value={monthValue}
              onChange={(e) => setMonthValue(parseInt(e.target.value))}
            >
              {MONTHS.map((name, i) => (
                <option key={i} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label className="label">Año</label>
            <select
              className="input"
              value={yearValue}
              onChange={(e) => setYearValue(parseInt(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleApplyFilter}
            isLoading={isLoading}
            className="mb-1"
          >
            Buscar
          </Button>
        </div>
      )}

      {/* Filtro por cliente */}
      {mode === "customer" && (
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="DNI del Cliente"
              type="text"
              inputMode="numeric"
              maxLength={8}
              placeholder="12345678"
              value={customerDni}
              onChange={(e) =>
                setCustomerDni(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
            />
          </div>
          <Button
            onClick={handleApplyFilter}
            isLoading={isLoading}
            disabled={customerDni.length !== 8}
            className="mb-1"
          >
            Buscar
          </Button>
        </div>
      )}

      {/* Reporte por día */}
      {mode === "report-day" && (
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Fecha"
              type="date"
              value={reportDayValue}
              onChange={(e) => setReportDayValue(e.target.value)}
            />
          </div>
          <Button
            onClick={handleApplyFilter}
            isLoading={isLoading}
            disabled={!reportDayValue}
            className="mb-1"
          >
            Generar Reporte
          </Button>
        </div>
      )}

      {/* Reporte por mes */}
      {mode === "report-month" && (
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="label">Mes</label>
            <select
              className="input"
              value={reportMonthValue}
              onChange={(e) => setReportMonthValue(parseInt(e.target.value))}
            >
              {MONTHS.map((name, i) => (
                <option key={i} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label className="label">Año</label>
            <select
              className="input"
              value={reportYearValue}
              onChange={(e) => setReportYearValue(parseInt(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleApplyFilter}
            isLoading={isLoading}
            className="mb-1"
          >
            Generar Reporte
          </Button>
        </div>
      )}
    </div>
  );
};
