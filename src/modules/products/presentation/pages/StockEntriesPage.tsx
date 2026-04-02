import React, { useEffect, useState } from "react";
import { useStockEntryStore } from "../../application/stores/stock-entry.store";
import { useProductStore } from "../../application/stores/product.store";
import { StockEntryTable } from "../components/StockEntryTable";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { NewStockEntryModal } from "../components/stock-entries/NewStockEntryModal";
import { StockEntryStatsCards } from "../components/stock-entries/StockEntryStatsCards";

export const StockEntriesPage: React.FC = () => {
  const { entries, isLoading, fetchAllEntries } = useStockEntryStore();
  const { fetchProducts } = useProductStore();

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllEntries();
    fetchProducts();
  }, []);

  const handleSuccess = async () => {
    await fetchAllEntries();
    await fetchProducts();
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Entradas de Productos
            </h1>
            <p className="text-neutral-600 mt-1">Administra los productos</p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
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
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 pt-3">
        <StockEntryStatsCards entries={entries} />

        <Card>
          <div className="border-b border-neutral-200 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Historial de Entradas de Stock
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Todas las entradas registradas en el sistema ordenadas por fecha
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Cargando entradas de stock..." />
          ) : entries.length === 0 ? (
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
              title="No hay entradas de stock registradas"
              description="Comienza registrando tu primera entrada de stock en el inventario."
              actionLabel="Registrar Primera Entrada"
              onAction={() => setShowModal(true)}
            />
          ) : (
            <StockEntryTable entries={entries} showProductColumn={true} />
          )}
        </Card>
      </div>

      {showModal && (
        <NewStockEntryModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};
