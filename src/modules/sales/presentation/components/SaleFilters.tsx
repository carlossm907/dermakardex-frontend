import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { useState } from "react";

type FilterMode = "all" | "day" | "month" | "customer";

interface SaleFiltersProps {
  onFilterAll: () => void;
  onFilterByDay: (date: string) => void;
  onFilterByMonth: (year: number, month: number) => void;
  onFilterByCustomer: (dni: string) => void;
  isLoading: boolean;
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
  isLoading,
}) => {
  const [mode, setMode] = useState<FilterMode>("all");
  const [dayValue, setDayValue] = useState("");
  const [monthValue, setMonthValue] = useState(new Date().getMonth() + 1);
  const [yearValue, setYearValue] = useState(new Date().getFullYear());
  const [customerDni, setCustomerDni] = useState("");

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
          <Button onClick={handleApplyFilter} isLoading={isLoading}>
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
          >
            Buscar
          </Button>
        </div>
      )}
    </div>
  );
};
