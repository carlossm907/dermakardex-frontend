import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { PriceDisplay } from "../PriceDisplay";
import type { Product } from "@/modules/products/domain/models/product.model";
import { DiscountBadge } from "../DiscountBadge";
import { EmptyState } from "../EmptyState";
import { LoadingSpinner } from "../LoadingSpinner";
import { usePagination } from "@/shared/hooks/usePagination";
import { TablePagination } from "@/shared/components/TablePagination";

interface DiscountedProductsTableProps {
  products: Product[];
  brands: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string }>;
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onRemove: (productId: number) => void;
}

export const DiscountedProductsTable: React.FC<
  DiscountedProductsTableProps
> = ({ products, brands, categories, isLoading, onEdit, onRemove }) => {
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
  } = usePagination(products);

  const getBrandName = (id: number) =>
    brands.find((b) => b.id === id)?.name || "N/A";

  const getCategoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name || "N/A";

  return (
    <Card className="mb-6">
      <div className="border-b border-neutral-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          Productos con Descuento ({totalItems})
        </h2>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Cargando productos..." />
      ) : totalItems === 0 ? (
        <EmptyState
          title="No hay productos con descuento"
          description="Agrega descuentos a tus productos desde la tabla de abajo."
        />
      ) : (
        <>
          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left p-4">Producto</th>
                  <th className="text-left p-4">Marca</th>
                  <th className="text-left p-4">Categoría</th>
                  <th className="text-right p-4">Precio Base</th>
                  <th className="text-center p-4">Descuento</th>
                  <th className="text-right p-4">Precio Final</th>
                  <th className="text-right p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {paginatedItems.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-neutral-50">
                    <td className="p-4">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-neutral-500">
                        {product.presentation}
                      </div>
                    </td>

                    <td className="p-4">{getBrandName(product.brandId)}</td>

                    <td className="p-4">
                      {getCategoryName(product.categoryId)}
                    </td>

                    <td className="p-4 text-right">
                      <PriceDisplay price={product.salePrice} />
                    </td>

                    <td className="p-4 text-center">
                      <DiscountBadge
                        discountType={product.discountType}
                        discountValue={product.discountValue}
                      />
                    </td>

                    <td className="p-4 text-right">
                      <PriceDisplay
                        price={product.finalPrice}
                        className="font-bold text-green-600"
                      />
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          className="text-sm"
                          onClick={() => onEdit(product)}
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Editar
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-sm text-red-600 hover:bg-red-50"
                          onClick={() => onRemove(product.id)}
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
