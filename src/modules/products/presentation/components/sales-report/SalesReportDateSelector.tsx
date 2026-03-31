import type { SalesReportDateMode } from "@/modules/products/domain/models/sales-report.model";
import { Button } from "@/shared/components/ui/Button";
import { useState } from "react";

interface SalesReportDateSelectorProps {
  from: string;
  to: string;
  mode: SalesReportDateMode;
  onModeChange: (mode: SalesReportDateMode) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSetToday: () => void;
}

const todayISO = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

const modeTab = (active: boolean) =>
  `px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
    active
      ? "bg-primary-50 text-primary-700 border-primary-200"
      : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
  }`;

export const SalesReportDateSelector: React.FC<
  SalesReportDateSelectorProps
> = ({
  from,
  to,
  mode,
  onModeChange,
  onFromChange,
  onToChange,
  onSetToday,
}) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const years = [
    now.getFullYear(),
    now.getFullYear() - 1,
    now.getFullYear() - 2,
  ];

  const handleModeChange = (newMode: SalesReportDateMode) => {
    onModeChange(newMode);
    if (newMode === "day") {
      const today = todayISO();
      onFromChange(today);
      onToChange(today);
    } else if (newMode === "month") {
      applyMonth(selectedMonth, selectedYear);
    }
  };

  const applyMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    onFromChange(firstDay.toISOString().split("T")[0]);
    onToChange(lastDay.toISOString().split("T")[0]);
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    applyMonth(month, selectedYear);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    applyMonth(selectedMonth, year);
  };

  const isToday = from === todayISO() && to === todayISO();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
        Período
      </p>

      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap mb-3">
        <button
          className={modeTab(mode === "day")}
          onClick={() => handleModeChange("day")}
        >
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
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
            Día específico
          </span>
        </button>
        <button
          className={modeTab(mode === "month")}
          onClick={() => handleModeChange("month")}
        >
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
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
            Mes completo
          </span>
        </button>
        <button
          className={modeTab(mode === "range")}
          onClick={() => handleModeChange("range")}
        >
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Rango de fechas
          </span>
        </button>
      </div>

      {/* Day mode */}
      {mode === "day" && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={from}
            onChange={(e) => {
              onFromChange(e.target.value);
              onToChange(e.target.value);
            }}
            className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <Button
            type="button"
            variant={isToday ? "primary" : "secondary"}
            className="text-sm flex items-center gap-1.5"
            onClick={onSetToday}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Hoy
          </Button>
        </div>
      )}

      {/* Month mode */}
      {mode === "month" && (
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(parseInt(e.target.value))}
            className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {MONTHS.map((name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <span className="text-xs text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full font-medium">
            {MONTHS[selectedMonth - 1]} {selectedYear}
          </span>
        </div>
      )}

      {/* Range mode */}
      {mode === "range" && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-500">Desde</label>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => onFromChange(e.target.value)}
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-500">Hasta</label>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => onToChange(e.target.value)}
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          {from && to && from !== to && (
            <span className="text-xs text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full font-medium">
              {Math.round(
                (new Date(to).getTime() - new Date(from).getTime()) /
                  (1000 * 60 * 60 * 24),
              ) + 1}{" "}
              días
            </span>
          )}
        </div>
      )}
    </div>
  );
};
