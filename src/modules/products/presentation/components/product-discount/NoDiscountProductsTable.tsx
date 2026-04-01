import {
  getStockStatus,
  type Product,
} from "@/modules/products/domain/models/product.model";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { StockBadge } from "../StockBadge";
import { PriceDisplay } from "../PriceDisplay";
import { Input } from "@/shared/components/ui/Input";
import { LoadingSpinner } from "../LoadingSpinner";
import { EmptyState } from "../EmptyState";
import { useState } from "react";
import { usePagination } from "@/shared/hooks/usePagination";
import { TablePagination } from "@/shared/components/TablePagination";

interface NoDiscountProductsTableProps {
  products: Product[];
  brands: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string }>;
  isLoading: boolean;
  onAddDiscount: (product: Product) => void;
}

export const NoDiscountProductsTable: React.FC<
  NoDiscountProductsTableProps
> = ({ products, brands, categories, isLoading, onAddDiscount }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((p) =>
    searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true,
  );

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    pageSize,
    changePage,
    changePageSize,
  } = usePagination(filteredProducts);

  const getBrandName = (id: number) =>
    brands.find((b) => b.id === id)?.name || "N/A";

  const getCategoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name || "N/A";

  return (
    <Card>
      <div className="border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Agregar Descuento a Productos ({totalItems})
          </h2>
          <div className="w-64">
            <Input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Cargando productos..." />
      ) : totalItems === 0 ? (
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
          title="Todos los productos tienen descuento"
          description="No hay productos disponibles para agregar descuentos."
        />
      ) : (
        <>
          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                    Producto
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                    Marca
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                    Categoría
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                    Precio de Venta
                  </th>
                  <th className="text-center p-4 text-sm font-semibold text-neutral-700">
                    Stock
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedItems.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-neutral-900">
                        {product.name}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {product.presentation}
                      </div>
                    </td>

                    <td className="p-4 text-sm text-neutral-600">
                      {getBrandName(product.brandId)}
                    </td>

                    <td className="p-4 text-sm text-neutral-600">
                      {getCategoryName(product.categoryId)}
                    </td>

                    <td className="p-4 text-right">
                      <PriceDisplay
                        price={product.salePrice}
                        className="justify-end"
                      />
                    </td>

                    <td className="p-4 text-center">
                      <StockBadge
                        stock={product.stock}
                        status={getStockStatus(
                          product.stock,
                          product.stockAlertThreshold,
                        )}
                      />
                    </td>

                    <td className="p-4 text-right">
                      <Button
                        variant="primary"
                        className="text-sm"
                        onClick={() => onAddDiscount(product)}
                      >
                        Agregar Descuento
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onPageChange={changePage}
            onPageSizeChange={changePageSize}
          />
        </>
      )}
    </Card>
  );
};
