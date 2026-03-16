import type { StockReportScope } from "@/modules/products/domain/models/stock-report.model";

interface StockReportScopeSelectorProps {
  value: StockReportScope;
  onChange: (scope: StockReportScope) => void;
}

const OPTIONS: {
  value: StockReportScope;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "all",
    label: "Todos los productos",
    icon: (
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
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      </svg>
    ),
  },
  {
    value: "single",
    label: "Un producto",
    icon: (
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
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    value: "multiple",
    label: "Selección de productos",
    icon: (
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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
];

export const StockReportScopeSelector: React.FC<
  StockReportScopeSelectorProps
> = ({ value, onChange }) => {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
        Alcance del reporte
      </p>
      <div className="flex gap-2 flex-wrap">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              value === option.value
                ? "bg-primary-50 text-primary-600 border-primary-200"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
