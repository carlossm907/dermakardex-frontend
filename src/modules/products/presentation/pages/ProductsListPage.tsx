import { useProductStore } from "../../application/stores/product.store";
import { useCatalogStore } from "../../application/stores/catalog.store";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { ProductSearchBar } from "../components/products/ProductSearchBar";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { ProductTable } from "../components/products/ProductTable";
import { ProductFormModal } from "../components/products/ProductFormModal";
import type { Product } from "../../domain/models/product.model";
import { useLocation } from "react-router-dom";

export const ProductsListPage: React.FC = () => {
  const location = useLocation();
  const { products, isLoading, fetchProducts } = useProductStore();

  const { brands, categories, laboratories, suppliers, fetchAll } =
    useCatalogStore();

  const [showCreateModal, setShowCreateModal] = useState(
    () =>
      (location.state as { openCreateModal?: boolean })?.openCreateModal ===
      true,
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchAll();
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      fetchProducts(searchTerm);
    } else {
      fetchProducts();
    }
  };

  const displayProducts = products;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Listado de Productos
            </h1>
            <p className="text-neutral-600 mt-1">Administra los productos</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateModal(true)}
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

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 pt-3">
        {/* Barra de búsqueda */}
        {
          <Card className="mb-6">
            <ProductSearchBar
              onSearch={handleSearch}
              placeholder="Buscar por nombre de producto..."
            />
          </Card>
        }

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
              title={"No hay productos registrados"}
              description={
                "Comienza agregando tu primer producto al inventario."
              }
              actionLabel={"Crear Primer Producto"}
              onAction={() => setShowCreateModal(true)}
            />
          ) : (
            <ProductTable
              products={displayProducts}
              brands={brands}
              categories={categories}
              suppliers={suppliers}
              laboratories={laboratories}
              onEdit={(product) => setEditingProduct(product)}
            />
          )}
        </Card>
      </div>

      {showCreateModal && (
        <ProductFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchProducts();
          }}
        />
      )}

      {editingProduct && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};
