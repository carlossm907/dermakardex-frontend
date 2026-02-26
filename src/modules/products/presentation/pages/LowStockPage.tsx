import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../application/stores/product.store";
import { useEffect } from "react";
import { useCatalogStore } from "../../application/stores/catalog.store";
import { Card } from "@/shared/components/ui/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { ProductTable } from "../components/ProductTable";

export const LowStockPage: React.FC = () => {
  const navigate = useNavigate();
  const { lowStockProducts, isLoading, fetchLowStockProducts } =
    useProductStore();
  const { brands, categories, fetchAll } = useCatalogStore();

  useEffect(() => {
    fetchLowStockProducts();
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Productos con Stock Bajo</h1>
              <p className="text-amber-100 mt-1">
                Productos que requieren reabastecimiento urgente
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <svg
                className="w-6 h-6"
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
                <div className="text-2xl font-bold">
                  {lowStockProducts.length}
                </div>
                <div className="text-xs text-amber-100">Productos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Card */}
        {lowStockProducts.length > 0 && (
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
                  Alerta de Reabastecimiento
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  Estos productos tienen stock por debajo del umbral mínimo.
                  Considera registrar una entrada de stock pronto.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <Card>
          {isLoading ? (
            <LoadingSpinner message="Cargando productos con stock bajo..." />
          ) : lowStockProducts.length === 0 ? (
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="¡Todo bien! No hay productos con stock bajo"
              description="Todos tus productos tienen suficiente stock."
            />
          ) : (
            <ProductTable
              products={lowStockProducts}
              brands={brands}
              categories={categories}
              onEdit={(product) => navigate(`/products/${product.id}/edit`)}
            />
          )}
        </Card>

        {/* Quick Action */}
        {lowStockProducts.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate("/products/stock-entries")}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
              Registrar Entrada de Stock
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
