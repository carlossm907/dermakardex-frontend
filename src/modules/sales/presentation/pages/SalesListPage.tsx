import { useSaleStore } from "../../application/stores/sale.store";
import { useEffect, useState } from "react";
import { SaleFilters } from "../components/SaleFilters";
import { LoadingSpinner } from "@/modules/products/presentation/components/LoadingSpinner";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/modules/products/presentation/components/EmptyState";
import { Button } from "@/shared/components/ui/Button";
import { useProductStore } from "@/modules/products/application/stores/product.store";
import { useScheduledDiscountStore } from "@/modules/products/application/stores/scheduled-discount.store";
import { SalesTable } from "../components/SalesTable";
import { SalesStatsCards } from "../components/SalesStatsCards";
import { NewSaleModal } from "../components/NewSaleModal";
import { useLocation } from "react-router-dom";

export const SaleListPage: React.FC = () => {
  const location = useLocation();
  const {
    sales,
    isLoading,
    fetchSales,
    fetchSalesByDay,
    fetchSalesByMonth,
    fetchSalesByCustomerDni,
  } = useSaleStore();

  const { fetchActive } = useScheduledDiscountStore();

  const { fetchProducts } = useProductStore();

  const [showModal, setShowModal] = useState(
    () =>
      (location.state as { openNewSaleModal?: boolean })?.openNewSaleModal ===
      true,
  );

  useEffect(() => {
    fetchSales();
    fetchProducts();
    fetchActive();
  }, []);

  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "America/Lima",
  });

  const [currentYear, currentMonth] = today.split("-").map(Number);

  const currentMonthSales = sales.filter((sale) => {
    const [saleYear, saleMonth] = sale.saleDate.split("-").map(Number);
    return saleYear === currentYear && saleMonth === currentMonth;
  });

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString(
    "es-PE",
    { month: "long" },
  );

  const stats = {
    total: currentMonthSales.length,
    totalAmount: currentMonthSales.reduce((sum, sale) => sum + sale.total, 0),
    todaySales: sales.filter((sale) => sale.saleDate === today).length,
    monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleFilterAll = () => {
    fetchSales();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Listado de Ventas
            </h1>
            <p className="text-neutral-600 mt-1">
              Administra las ventas registradas
            </p>
          </div>
          <Button onClick={handleOpenModal} className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Cards de estadísticas */}
      <SalesStatsCards
        total={stats.total}
        totalAmount={stats.totalAmount}
        todaySales={stats.todaySales}
        monthName={stats.monthName}
      />
      {/* Filtros */}
      <SaleFilters
        onFilterAll={handleFilterAll}
        onFilterByDay={fetchSalesByDay}
        onFilterByMonth={fetchSalesByMonth}
        onFilterByCustomer={fetchSalesByCustomerDni}
        isLoading={isLoading}
        sales={sales}
      />

      {/* Lista de ventas o reporte */}
      <div className="mt-6">
        {" "}
        <Card>
          {isLoading ? (
            <LoadingSpinner message="Cargando ventas..." />
          ) : sales.length === 0 ? (
            <EmptyState
              icon={
                <svg
                  className="w-16 h-16 text-neutral-300"
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
              }
              title="No hay ventas registradas"
              description="Comienza registrando tu primera venta."
              actionLabel="Nueva Venta"
              onAction={handleOpenModal}
            />
          ) : (
            <div className="overflow-x-auto">
              <SalesTable sales={sales} />
            </div>
          )}
        </Card>
      </div>

      {/* Modal de Nueva Venta */}
      {showModal && <NewSaleModal onClose={handleCloseModal} />}
    </div>
  );
};
