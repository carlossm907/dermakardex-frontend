import type { EntriesReport } from "@/modules/products/domain/models/entries-report.model";

interface EntriesReportTableProps {
  report: EntriesReport[];
}

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const formatPeriod = (from: string, to: string): string =>
  from === to ? formatDate(from) : `${formatDate(from)} – ${formatDate(to)}`;

export const EntriesReportTable: React.FC<EntriesReportTableProps> = ({
  report,
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
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-neutral-500 text-sm">No hay datos para mostrar</p>
        <p className="text-neutral-400 text-xs mt-1">
          Ajusta los filtros y genera el reporte
        </p>
      </div>
    );
  }

  const totalQuantity = report.reduce((s, r) => s + r.quantity, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            <th className="text-left p-4 font-semibold text-neutral-700">
              Producto
            </th>
            <th className="text-center p-4 font-semibold text-neutral-700">
              Período
            </th>
            <th className="text-center p-4 font-semibold text-neutral-700">
              Unidades ingresadas
            </th>
          </tr>
        </thead>
        <tbody>
          {report.map((item, index) => (
            <tr
              key={`${item.productId}-${item.from}`}
              className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                index % 2 === 1 ? "bg-neutral-50/50" : ""
              }`}
            >
              <td className="p-4">
                <div className="font-medium text-neutral-900">
                  {item.productName}
                </div>
                <div className="text-xs text-neutral-400">
                  ID #{item.productId}
                </div>
              </td>
              <td className="p-4 text-center text-neutral-600 text-sm">
                {formatPeriod(item.from, item.to)}
              </td>
              <td className="p-4 text-center">
                {item.quantity > 0 ? (
                  <span className="inline-flex items-center gap-0.5 px-3 py-0.5 rounded text-xs font-semibold text-indigo-700 bg-indigo-50">
                    +{item.quantity}
                  </span>
                ) : (
                  <span className="text-neutral-400 font-medium text-sm">
                    0
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-neutral-200 bg-neutral-50">
            <td className="p-4 font-semibold text-neutral-700">Total</td>
            <td />
            <td className="p-4 text-center">
              <span className="inline-flex items-center gap-0.5 px-3 py-0.5 rounded text-xs font-bold text-indigo-800 bg-indigo-100">
                +{totalQuantity}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
