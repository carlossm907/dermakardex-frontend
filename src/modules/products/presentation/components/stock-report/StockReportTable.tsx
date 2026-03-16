import type { StockReport } from "@/modules/products/domain/models/stock-report.model";

interface StockReportTableProps {
  report: StockReport[];
  isSingleDay: boolean;
}

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const EntryDelta: React.FC<{ value: number }> = ({ value }) => {
  if (value === 0)
    return <span className="text-neutral-400 font-medium">0</span>;
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-semibold text-green-700 bg-green-50">
      +{value}
    </span>
  );
};

const SoldDelta: React.FC<{ value: number }> = ({ value }) => {
  if (value === 0)
    return <span className="text-neutral-400 font-medium">0</span>;
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-semibold text-red-700 bg-red-50">
      -{value}
    </span>
  );
};

const FinalStockCell: React.FC<{
  finalStock: number;
  initialStock: number;
}> = ({ finalStock, initialStock }) => {
  const diff = finalStock - initialStock;
  const color =
    diff > 0
      ? "text-green-700"
      : diff < 0
        ? "text-red-700"
        : "text-neutral-800";
  return <span className={`font-semibold ${color}`}>{finalStock}</span>;
};

export const StockReportTable: React.FC<StockReportTableProps> = ({
  report,
  isSingleDay,
}) => {
  if (report.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-14 h-14 mx-auto text-neutral-300 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-neutral-500 text-sm">No hay datos para mostrar</p>
        <p className="text-neutral-400 text-xs mt-1">
          Ajusta los filtros y genera el reporte
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            <th className="text-left p-4 font-semibold text-neutral-700">
              Producto
            </th>
            {!isSingleDay && (
              <th className="text-left p-4 font-semibold text-neutral-700">
                Fecha
              </th>
            )}
            <th className="text-center p-4 font-semibold text-neutral-700">
              Stock Inicial
            </th>
            <th className="text-center p-4 font-semibold text-neutral-700">
              Entradas
            </th>
            <th className="text-center p-4 font-semibold text-neutral-700">
              Ventas
            </th>
            <th className="text-center p-4 font-semibold text-neutral-700">
              Stock Final
            </th>
          </tr>
        </thead>
        <tbody>
          {report.map((item) => (
            <tr
              key={`${item.productId}-${item.date}`}
              className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
            >
              <td className="p-4">
                <div className="font-medium text-neutral-900">
                  {item.productName}
                </div>
                <div className="text-xs text-neutral-400">
                  ID #{item.productId}
                </div>
              </td>
              {!isSingleDay && (
                <td className="p-4 text-neutral-600">
                  {formatDate(item.date)}
                </td>
              )}
              <td className="p-4 text-center font-medium text-neutral-700">
                {item.initialStock}
              </td>
              <td className="p-4 text-center">
                <EntryDelta value={item.entries} />
              </td>
              <td className="p-4 text-center">
                <SoldDelta value={item.sold} />
              </td>
              <td className="p-4 text-center">
                <FinalStockCell
                  finalStock={item.finalStock}
                  initialStock={item.initialStock}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
