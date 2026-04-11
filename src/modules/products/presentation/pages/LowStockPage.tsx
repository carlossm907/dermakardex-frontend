import { useProductStore } from "../../application/stores/product.store";
import { useEffect, useState } from "react";
import { useCatalogStore } from "../../application/stores/catalog.store";
import { Card } from "@/shared/components/ui/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { useStockEntryStore } from "../../application/stores/stock-entry.store";
import { LowStockTable } from "../components/LowStockTable";
import { NewStockEntryModal } from "../components/stock-entries/NewStockEntryModal";

export const LowStockPage: React.FC = () => {
  const { lowStockProducts, isLoading, fetchLowStockProducts } =
    useProductStore();
  const { brands, categories, fetchAll } = useCatalogStore();
  const { fetchAllEntries } = useStockEntryStore();

  const [showNewEntryModal, setShowNewEntryModal] = useState(false);

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
            <LowStockTable
              products={lowStockProducts}
              brands={brands}
              categories={categories}
              laboratories={[]}
              suppliers={[]}
            />
          )}
        </Card>
      </div>
      {showNewEntryModal && (
        <NewStockEntryModal
          onClose={() => setShowNewEntryModal(false)}
          onSuccess={() => {
            setShowNewEntryModal(false);
            fetchAllEntries();
            fetchLowStockProducts();
          }}
        />
      )}
    </div>
  );
};
