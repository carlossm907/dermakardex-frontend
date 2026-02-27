import { useProductStore } from "@/modules/products/application/stores/product.store";
import { useStockEntryStore } from "@/modules/products/application/stores/stock-entry.store";
import { DiscountType } from "@/modules/products/domain/models/discount.type";
import { useSaleStore } from "@/modules/sales/application/stores/sale.store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

export const DashboardHomePage: React.FC = () => {
  const navigate = useNavigate();

  const { products, lowStockProducts, fetchProducts, fetchLowStockProducts } =
    useProductStore();
  const { entries, fetchAllEntries } = useStockEntryStore();
  const { sales, fetchSales } = useSaleStore();

  useEffect(() => {
    fetchProducts();
    fetchLowStockProducts();
    fetchAllEntries();
    fetchSales();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const stats = {
    totalProducts: products.length,
    productsWithDiscount: products.filter(
      (p) => p.discountType !== DiscountType.NONE,
    ).length,
    activeProducts: products.filter((p) => p.isActive).length,
    lowStockProducts: lowStockProducts.length,

    todayStockEntries: entries.filter((entry) =>
      entry.registeredAt.toISOString().startsWith(today),
    ).length,

    todaySales: sales.filter((sale) => sale.saleDate == today).length,
    todayRevenue: sales
      .filter((sale) => sale.saleDate === today)
      .reduce((sum, sale) => sum + sale.total, 0),
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">
          Resumen general del sistema DermaKardex
        </p>
      </div>

      {/* Grid de estadísticas - 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Total Productos Activos */}
        <Card
          className="bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/products")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Productos Activos</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.activeProducts}
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Productos con Descuento */}
        <Card
          className="bg-gradient-to-br from-red-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/products/discounts")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Con Descuento</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats.productsWithDiscount}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Stock Bajo */}
        <Card
          className="bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/products/low-stock")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {stats.lowStockProducts}
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Entradas de Hoy */}
        <Card
          className="bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/products/stock-entries")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Entradas Hoy</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.todayStockEntries}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
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

        {/* Ventas de Hoy */}
        <Card
          className="bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/sales")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Ventas Hoy</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.todaySales}
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

        {/* Ganancia de Hoy */}
        <Card
          className="bg-gradient-to-br from-emerald-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/sales")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Ganancia Hoy</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {formatCurrency(stats.todayRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-emerald-600"
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

      {/* Sección de accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Productos */}
        <Card className="bg-gradient-to-br from-primary-50 to-white border-l-4 border-primary-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-primary-600"
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
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary-900 mb-2">
                Gestión de Productos
              </h3>
              <p className="text-sm text-primary-700 mb-4">
                Administra tu inventario, catálogo, entradas de stock y
                descuentos.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate("/products")}
                  className="text-xs px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                >
                  Ver Productos
                </button>
                <button
                  onClick={() => navigate("/products/new")}
                  className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Nuevo Producto
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Card de Ventas */}
        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-2">
                Punto de Venta
              </h3>
              <p className="text-sm text-green-700 mb-4">
                Registra ventas, genera tickets y consulta el historial de
                transacciones.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate("/sales")}
                  className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Ver Ventas
                </button>
                <button
                  onClick={() => navigate("/sales/new")}
                  className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Nueva Venta
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
