import { Button } from "@/shared/components/ui/Button";

interface SalesReportDateRangeProps {
  from: string;
  to: string;
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

export const SalesReportDateRange: React.FC<SalesReportDateRangeProps> = ({
  from,
  to,
  onFromChange,
  onToChange,
  onSetToday,
}) => {
  const isToday = from === todayISO() && to === todayISO();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
        Rango de fechas
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-500">Desde</label>
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => onFromChange(e.target.value)}
            className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-500">Hasta</label>
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => onToChange(e.target.value)}
            className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

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

        {from === to && (
          <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">
            Ventas del día actual
          </span>
        )}
      </div>
    </div>
  );
};
