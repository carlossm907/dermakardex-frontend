import { useNavigate } from "react-router-dom";
import { useSaleStore } from "../../application/stores/sale.store";
import { useEffect } from "react";
import { SaleCard } from "../components/SaleCard";
import { SaleFilters } from "../components/SaleFilters";
import { LoadingSpinner } from "@/modules/products/presentation/components/LoadingSpinner";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/modules/products/presentation/components/EmptyState";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

export const SaleListPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    sales,
    isLoading,
    fetchSales,
    fetchSalesByDay,
    fetchSalesByMonth,
    fetchSalesByCustomerDni,
  } = useSaleStore();

  useEffect(() => {
    fetchSales();
  }, []);

  const stats = {
    total: sales.length,
    totalAmount: sales.reduce((sum, sale) => sum + sale.total, 0),
    today: sales.filter(
      (s) => s.saleDate === new Date().toISOString().split("T")[0],
    ).length,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header con gradiente verde */}
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-gradient-to-br from-green-50 to-white border border-neutral-100 shadow-sm rounded-xl">
          <div className="px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-green-800">Ventas</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Ventas</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
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
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Monto Total</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
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

          <Card className="bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Ventas Hoy</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {stats.today}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-600"
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
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <SaleFilters
          onFilterAll={fetchSales}
          onFilterByDay={fetchSalesByDay}
          onFilterByMonth={fetchSalesByMonth}
          onFilterByCustomer={fetchSalesByCustomerDni}
          isLoading={isLoading}
        />

        {/* Lista de ventas */}
        <div className="mt-6">
          {isLoading ? (
            <Card>
              <LoadingSpinner message="Cargando ventas..." />
            </Card>
          ) : sales.length === 0 ? (
            <Card>
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
                description="Comienza registrando tu primera venta en el punto de venta."
                actionLabel="Ir al Punto de Venta"
                onAction={() => navigate("/sales/new")}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sales.map((sale) => (
                <SaleCard key={sale.id} sale={sale} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
