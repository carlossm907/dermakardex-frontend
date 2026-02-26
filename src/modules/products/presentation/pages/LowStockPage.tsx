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
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-gradient-to-br from-amber-50 to-white border border-neutral-100 shadow-sm rounded-xl">
          <div className="px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-amber-800">
                  Productos con Stock Bajo
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
