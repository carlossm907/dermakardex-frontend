import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { useState } from "react";

type ReportMode = "day" | "month";

interface SaleReportByClientFiltersProps {
  onReportByDay: (date: string) => void;
  onReportByMonth: (year: number, month: number) => void;
  isLoading: boolean;
  showPrintButton?: boolean;
  onPrintReport?: () => void;
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

export const SaleReportByClientFilters: React.FC<
  SaleReportByClientFiltersProps
> = ({
  onReportByDay,
  onReportByMonth,
  isLoading,
  showPrintButton,
  onPrintReport,
}) => {
  const now = new Date();

  const [mode, setMode] = useState<ReportMode>("day");
  const [dayValue, setDayValue] = useState(now.toLocaleDateString("sv-SE"));
  const [monthValue, setMonthValue] = useState(now.getMonth() + 1);
  const [yearValue, setYearValue] = useState(now.getFullYear());

  const years = [
    now.getFullYear(),
    now.getFullYear() - 1,
    now.getFullYear() - 2,
  ];

  const handleApply = () => {
    if (mode === "day" && dayValue) {
      onReportByDay(dayValue);
    } else if (mode === "month") {
      onReportByMonth(yearValue, monthValue);
    }
  };

  const tabClass = (m: ReportMode) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      mode === m
        ? "bg-primary-600 text-white"
        : "text-neutral-600 hover:bg-neutral-100"
    }`;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Mode tabs */}
        <div className="flex gap-2">
          <button className={tabClass("day")} onClick={() => setMode("day")}>
            Por Día
          </button>
          <button
            className={tabClass("month")}
            onClick={() => setMode("month")}
          >
            Por Mes
          </button>
        </div>

        {/* Print button */}
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Imprimir Reporte
          </Button>
        )}
      </div>

      {/* Day picker */}
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
            onClick={handleApply}
            isLoading={isLoading}
            disabled={!dayValue}
            className="mb-1"
          >
            Generar Reporte
          </Button>
        </div>
      )}

      {/* Month picker */}
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
          <Button onClick={handleApply} isLoading={isLoading} className="mb-1 ">
            Generar Reporte
          </Button>
        </div>
      )}
    </div>
  );
};
