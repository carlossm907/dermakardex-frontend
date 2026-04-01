import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../application/stores/product.store";
import { useEffect } from "react";
import { useCatalogStore } from "../../application/stores/catalog.store";
import { Card } from "@/shared/components/ui/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { ProductTable } from "../components/products/ProductTable";
import { Button } from "@/shared/components/ui/Button";

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
      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Productos con Stock Bajo
            </h1>
            <p className="text-neutral-600 mt-1">Administra los productos</p>
          </div>
          {lowStockProducts.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => navigate("products/stock-entries")}
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
                Nueva Entrada
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 pt-3">
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
              laboratories={[]}
              suppliers={[]}
            />
          )}
        </Card>
      </div>
    </div>
  );
};
