import { useState } from "react";
import type { SalesGroupedByCustomerReport } from "../../domain/models/sales-report.model";
import { Card } from "@/shared/components/ui/Card";

interface SaleReportTableProps {
  report: SalesGroupedByCustomerReport[];
  className?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date + "T00:00:00"));

const formatTime = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

export const SaleReportTable: React.FC<SaleReportTableProps> = ({
  report,
  className = "",
}) => {
  const [nameFilter, setNameFilter] = useState("");
  const filtered = nameFilter.trim()
    ? report.filter((r) =>
        r.customerFullName.toLowerCase().includes(nameFilter.toLowerCase()),
      )
    : report;
  const grandTotal = report.reduce((sum, r) => sum + r.customerTotalAmount, 0);
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Buscador por nombre + contador */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Filtrar por nombre de cliente..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="input pl-9"
          />
        </div>
        {nameFilter && (
          <button
            onClick={() => setNameFilter("")}
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Limpiar
          </button>
        )}
        <span className="text-sm text-neutral-500 whitespace-nowrap">
          {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Resumen del período (solo cuando no hay filtro activo) */}
      {!nameFilter && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Clientes en período</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {report.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total del período</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {formatCurrency(grandTotal)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Sin resultados */}
      {filtered.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <svg
              className="w-14 h-14 text-neutral-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-neutral-500 font-medium">
              {nameFilter
                ? `No se encontraron resultados para "${nameFilter}"`
                : "No hay ventas en el período seleccionado"}
            </p>
          </div>
        </Card>
      )}

      {/* Una card por cliente */}
      {filtered.map((customer) => (
        <Card key={customer.customerDni}>
          {/* Cabecera del cliente */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-primary-600"
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
              </div>
              <div>
                <p className="font-semibold text-neutral-900">
                  {customer.customerFullName}
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  DNI: {customer.customerDni}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">Total del cliente</p>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(customer.customerTotalAmount)}
              </p>
            </div>
          </div>

          {/* Tabla de ventas del cliente */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left p-3 font-semibold text-neutral-700">
                    Ticket
                  </th>
                  <th className="text-left p-3 font-semibold text-neutral-700">
                    Fecha
                  </th>
                  <th className="text-left p-3 font-semibold text-neutral-700">
                    Hora
                  </th>
                  <th className="text-left p-3 font-semibold text-neutral-700">
                    Productos
                  </th>
                  <th className="text-right p-3 font-semibold text-neutral-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {customer.sales.map((sale) => (
                  <tr
                    key={sale.saleId}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="p-3">
                      <span className="font-mono font-semibold text-neutral-900">
                        {sale.ticketNumber}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-600">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td className="p-3 text-neutral-600">
                      {formatTime(sale.saleTime)}
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {sale.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-4"
                          >
                            <span className="text-neutral-700">
                              {item.productName}
                              <span className="text-neutral-400 ml-1">
                                ({item.presentation})
                              </span>
                            </span>
                            <span className="text-xs text-neutral-500 whitespace-nowrap">
                              x{item.quantity} ·{" "}
                              {formatCurrency(item.lineTotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold text-green-700">
                      {formatCurrency(sale.finalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-200 bg-neutral-50">
                  <td
                    colSpan={4}
                    className="p-3 text-right font-semibold text-neutral-700"
                  >
                    Subtotal cliente:
                  </td>
                  <td className="p-3 text-right font-bold text-green-700">
                    {formatCurrency(customer.customerTotalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
};
