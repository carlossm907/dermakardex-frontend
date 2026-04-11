import { useRef, useState } from "react";
import { dniLookupService } from "../../infrastructure/services/dni-lookup.service";

interface CustomerDniInputProps {
  value: string;
  customerFullName: string | null;
  onChange: (dni: string) => void;
  onCustomerResolved: (fullName: string) => void;
  onCustomerCleared: () => void;
  error?: string;
  disabled?: boolean;
}

type DniState =
  | "idle"
  | "typing"
  | "searching"
  | "found"
  | "not-found"
  | "invalid";

export const CustomerDniInput: React.FC<CustomerDniInputProps> = ({
  value,
  customerFullName,
  onChange,
  onCustomerResolved,
  onCustomerCleared,
  error,
  disabled = false,
}) => {
  const [dniState, setDniState] = useState<DniState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    onChange(raw);

    if (customerFullName) {
      onCustomerCleared();
    }

    if (raw.length < 8) {
      setDniState(raw.length > 0 ? "typing" : "idle");
      return;
    }

    const cached = dniLookupService.getFromCache(raw);
    if (cached) {
      setDniState("found");
      onCustomerResolved(cached);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    setDniState("searching");

    debounceRef.current = setTimeout(async () => {
      const result = await dniLookupService.lookupDni(raw);

      if (result.success && result.fullName) {
        setDniState("found");
        onCustomerResolved(result.fullName);
      } else if (result.success && !result.fullName) {
        setDniState("found");
      } else {
        setDniState("not-found");
        onCustomerCleared();
      }
    }, 300);
  };

  const handleClear = () => {
    onChange("");
    onCustomerCleared();
    setDniState("idle");
  };

  const getInputBorderClass = () => {
    if (error) return "border-red-500 focus:ring-red-500";
    if (dniState === "found") return "border-green-500 focus:ring-green-500";
    if (dniState === "invalid") return "border-red-400 focus:ring-red-400";
    if (dniState === "searching") return "border-blue-400 focus:ring-blue-400";
    return "border-neutral-300 focus:ring-primary-500";
  };

  return (
    <div>
      <label className="label">DNI del Cliente</label>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          placeholder="12345678"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`input pr-10 font-mono tracking-widest ${getInputBorderClass()}`}
        />

        {/* Indicador de estado */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {dniState === "searching" && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          {dniState === "found" && (
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {dniState === "typing" && (
            <span className="text-xs text-neutral-400 font-mono">
              {8 - value.length}
            </span>
          )}
          {value && dniState !== "searching" && (
            <button
              type="button"
              onClick={handleClear}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Nombre del cliente encontrado */}
      {customerFullName && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <svg
            className="w-4 h-4 text-green-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-sm font-medium text-green-800">
            {customerFullName}
          </span>
        </div>
      )}

      {/* Buscando... */}
      {dniState === "searching" && (
        <p className="mt-1.5 text-xs text-blue-600">Buscando nombre...</p>
      )}

      {/* No encontrado */}
      {dniState === "not-found" && !error && (
        <p className="mt-1.5 text-xs text-amber-600">
          DNI no encontrado en el padrón. Puedes continuar igual.
        </p>
      )}

      {/* Error de validación del formulario */}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      {/* Contador */}
      <p className="mt-1 text-xs text-neutral-400 text-right">
        {value.length}/8 dígitos
      </p>
    </div>
  );
};
