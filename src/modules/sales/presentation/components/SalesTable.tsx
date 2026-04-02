import { Button } from "@/shared/components/ui/Button";
import { SaleStatusBadge } from "./SaleStatusBadge";
import { useNavigate } from "react-router-dom";
import { usePagination } from "@/shared/hooks/usePagination";
import { TablePagination } from "@/shared/components/TablePagination";
import type { SaleListItem } from "../../domain/models/sale.model";

interface Props {
  sales: SaleListItem[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);

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

export const SalesTable: React.FC<Props> = ({ sales }) => {
  const navigate = useNavigate();

  // PAGINACIÓN
  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    pageSize,
    changePage,
    changePageSize,
  } = usePagination(sales);

  return (
    <>
      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left p-4 text-sm font-semibold">Ticket</th>
              <th className="text-left p-4 text-sm font-semibold">Cliente</th>
              <th className="text-left p-4 text-sm font-semibold">Fecha</th>
              <th className="text-left p-4 text-sm font-semibold">Hora</th>
              <th className="text-right p-4 text-sm font-semibold">Total</th>
              <th className="text-center p-4 text-sm font-semibold">Estado</th>
              <th className="text-right p-4 text-sm font-semibold">Acciones</th>
              <th className="text-right p-4 text-sm font-semibold">
                Vendido por
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedItems.map((sale) => (
              <tr
                key={sale.id}
                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                <td className="p-4 font-mono font-semibold">
                  {sale.ticketNumber}
                </td>

                <td className="p-4">{sale.customerFullName}</td>

                <td className="p-4 text-sm text-neutral-600">
                  {formatDate(sale.saleDate)}
                </td>

                <td className="p-4 text-sm text-neutral-600">
                  {formatTime(sale.saleTime)}
                </td>

                <td className="p-4 text-right font-semibold text-green-700">
                  {formatCurrency(sale.total)}
                </td>

                <td className="p-4 text-center">
                  <SaleStatusBadge status={sale.status} />
                </td>

                <td className="p-4 text-right">
                  <Button
                    variant="secondary"
                    className="text-sm"
                    onClick={() => navigate(`/sales/${sale.id}`)}
                  >
                    Ver Detalle
                  </Button>
                </td>

                <td className="p-4 text-sm text-neutral-600">
                  {sale.sellerFullName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onPageChange={changePage}
        onPageSizeChange={changePageSize}
      />
    </>
  );
};
