import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";

interface SalesTimelineFiltersProps {
  onSearch: (year: number, month: number) => void;
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

export const SalesTimelineFilters: React.FC<SalesTimelineFiltersProps> = ({
  onSearch,
  isLoading,
  showPrintButton,
  onPrintReport,
}) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const years = [
    now.getFullYear(),
    now.getFullYear() - 1,
    now.getFullYear() - 2,
  ];

  const handleApply = () => {
    onSearch(year, month);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Selectores de período */}
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="label">Mes</label>
            <select
              className="input"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
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
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleApply} isLoading={isLoading} className="mb-1">
            Generar Timeline
          </Button>
        </div>

        {/* Botón imprimir */}
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
    </div>
  );
};
