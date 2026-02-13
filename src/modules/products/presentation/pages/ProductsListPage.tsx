import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../application/stores/product.store";
import { useCatalogStore } from "../../application/stores/catalog.store";
import { useEffect, useState } from "react";
import { DiscountType } from "../../domain/models/discount.type";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { ProductSearchBar } from "../components/ProductSearchBar";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { ProductTable } from "../components/ProductTable";

export const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    products,
    isLoading,
    fetchProducts,
    fetchLowStockProducts,
    lowStockProducts,
  } = useProductStore();

  const { brands, categories, fetchAll } = useCatalogStore();

  const [viewMode, setViewMode] = useState<"all" | "low-stock">("all");

  useEffect(() => {
    fetchProducts();
    fetchAll();
    fetchLowStockProducts();
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      fetchProducts(searchTerm);
    } else {
      fetchProducts();
    }
  };

  const handleViewModeChange = (mode: "all" | "low-stock") => {
    setViewMode(mode);
  };

  const displayProducts =
    viewMode === "low-stock" ? lowStockProducts : products;

  const stats = {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    withDiscount: products.filter((p) => p.discountType !== DiscountType.NONE)
      .length,
    lowStock: lowStockProducts.length,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header con gradiente sutil */}
      <div className="bg-gradient-to-r from-white to-neutral-50 border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Productos</h1>
              <p className="text-neutral-600 mt-1">
                Administra tu inventario de manera eficiente
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate("/products/catalog")}
                className="flex items-center gap-2"
              >
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Catálogo
              </Button>
              <Button
                onClick={() => navigate("/products/new")}
                className="flex items-center gap-2"
              >
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
                Nuevo Producto
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs de vista */}
        <div className="mb-6">
          <div className="border-b border-neutral-200">
            <nav className="flex gap-8">
              <button
                onClick={() => handleViewModeChange("all")}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  viewMode === "all"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
                }`}
              >
                Todos los Productos
                <span className="ml-2 text-xs bg-neutral-100 px-2 py-1 rounded-full">
                  {stats.total}
                </span>
              </button>
              <button
                onClick={() => handleViewModeChange("low-stock")}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  viewMode === "low-stock"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
                }`}
              >
                Stock Bajo
                <span
                  className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    stats.lowStock > 0
                      ? "bg-red-100 text-red-800"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {stats.lowStock}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Barra de búsqueda */}
        {viewMode === "all" && (
          <Card className="mb-6">
            <ProductSearchBar
              onSearch={handleSearch}
              placeholder="Buscar por nombre de producto..."
            />
          </Card>
        )}

        {/* Mensaje de alerta para stock bajo */}
        {viewMode === "low-stock" && stats.lowStock > 0 && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-amber-400 mt-0.5 mr-3"
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
              <div>
                <h3 className="text-sm font-medium text-amber-800">
                  Alerta de Stock Bajo
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  Hay {stats.lowStock} producto{stats.lowStock !== 1 ? "s" : ""}{" "}
                  con stock por debajo del umbral. Considera reabastecer pronto.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de productos */}
        <Card>
          {isLoading ? (
            <LoadingSpinner message="Cargando productos..." />
          ) : displayProducts.length === 0 ? (
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              }
              title={
                viewMode === "low-stock"
                  ? "¡Todo bien! No hay productos con stock bajo"
                  : "No hay productos registrados"
              }
              description={
                viewMode === "low-stock"
                  ? "Todos tus productos tienen suficiente stock."
                  : "Comienza agregando tu primer producto al inventario."
              }
              actionLabel={
                viewMode === "all" ? "Crear Primer Producto" : undefined
              }
              onAction={
                viewMode === "all" ? () => navigate("/products/new") : undefined
              }
            />
          ) : (
            <ProductTable
              products={displayProducts}
              brands={brands}
              categories={categories}
              onEdit={(product) => navigate(`/products/${product.id}/edit`)}
            />
          )}
        </Card>

        {/* Cards de estadísticas */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Productos</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {stats.total}
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

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Activos</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.active}
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Con Descuento</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {stats.withDiscount}
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

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {stats.lowStock}
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
        </div>

        {/* Accesos rápidos */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/products/stock-entries")}
            className="p-6 bg-white border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">
                  Entradas de Stock
                </h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Ver historial del Kardex
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/products/discounts")}
            className="p-6 bg-white border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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
              <div>
                <h3 className="font-semibold text-neutral-900">Descuentos</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Administrar promociones
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/products/catalog")}
            className="p-6 bg-white border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Catálogo</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Marcas, categorías y más
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
