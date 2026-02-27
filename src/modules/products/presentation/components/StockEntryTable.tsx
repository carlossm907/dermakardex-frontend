import type { StockEntry } from "../../domain/models/stock-entry.model";

interface StockEntryTableProps {
  entries: StockEntry[];
  showProductColumn?: boolean;
  className?: string;
}

export const StockEntryTable: React.FC<StockEntryTableProps> = ({
  entries,
  showProductColumn = false,
  className = "",
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-PE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-neutral-300"
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
        <p className="mt-4 text-neutral-600">
          No hay entradas de stock registradas
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            <th className="text-left p-4 text-sm font-semibold text-neutral-700">
              Fecha
            </th>
            {showProductColumn && (
              <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                Producto
              </th>
            )}
            <th className="text-center p-4 text-sm font-semibold text-neutral-700">
              Cantidad
            </th>
            <th className="text-right p-4 text-sm font-semibold text-neutral-700">
              Precio Unit.
            </th>
            <th className="text-right p-4 text-sm font-semibold text-neutral-700">
              Inversión Total
            </th>
            <th className="text-left p-4 text-sm font-semibold text-neutral-700">
              Razón
            </th>
            <th className="text-left p-4 text-sm font-semibold text-neutral-700">
              Registrado por
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
            >
              <td className="p-4 text-sm text-neutral-600">
                {formatDate(entry.registeredAt)}
              </td>
              {showProductColumn && (
                <td className="p-4 text-sm text-neutral-600">
                  {entry.productName}
                </td>
              )}
              <td className="p-4 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  +{entry.quantity}
                </span>
              </td>
              <td className="p-4 text-right text-sm font-medium text-neutral-900">
                {formatCurrency(entry.unitPurchasePrice)}
              </td>
              <td className="p-4 text-right text-sm font-semibold text-green-600">
                {formatCurrency(entry.totalInvestment)}
              </td>
              <td className="p-4 text-sm text-neutral-600">{entry.reason}</td>
              <td className="p-4 text-sm text-neutral-600">
                {entry.registeredByUserName}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total de inversión */}
      <div className="border-t-2 border-neutral-300 bg-neutral-50 p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-neutral-700">
            Total Inversión:
          </span>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(
              entries.reduce((sum, entry) => sum + entry.totalInvestment, 0),
            )}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-neutral-600">Total Unidades:</span>
          <span className="text-sm font-medium text-neutral-900">
            {entries.reduce((sum, entry) => sum + entry.quantity, 0)} unidades
          </span>
        </div>
      </div>
    </div>
  );
};
