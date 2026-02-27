import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../application/stores/product.store";
import { useCatalogStore } from "../../application/stores/catalog.store";
import { useEffect } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { ProductSearchBar } from "../components/ProductSearchBar";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { ProductTable } from "../components/ProductTable";

export const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();

  const { products, isLoading, fetchProducts } = useProductStore();

  const { brands, categories, fetchAll } = useCatalogStore();

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
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-gradient-to-br from-blue-50 to-white border border-neutral-100 shadow-sm rounded-xl">
          <div className="px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-blue-800">Productos</h1>
              </div>
              <div className="flex gap-3">
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              onAction={() => navigate("/products/new")}
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
      </div>
    </div>
  );
};
