import { useNavigate } from "react-router-dom";
import { getStockStatus } from "../../domain/models/product.model";
import type { Product } from "../../domain/models/product.model";
import { DiscountBadge } from "./DiscountBadge";
import { PriceDisplay } from "./PriceDisplay";
import { StockBadge } from "./StockBadge";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/shared/components/ui/Button";
import { useState } from "react";
import { ProductDetailModal } from "./ProductDetailModal";
import { useScheduledDiscountStore } from "../../application/stores/scheduled-discount.store";
import { ScheduledDiscountBadge } from "./ScheduledDiscountBadge";

interface ProductTableProps {
  products: Product[];
  brands: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string }>;
  laboratories: Array<{ id: number; name: string }>;
  suppliers: Array<{ id: number; name: string }>;
  onEdit?: (product: Product) => void;
  showActions?: boolean;
  className?: string;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  brands,
  categories,
  laboratories,
  suppliers,
  onEdit,
  showActions = true,
  className = "",
}) => {
  const { discounts } = useScheduledDiscountStore();

  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const getBrandName = (id: number) => {
    return brands.find((b) => b.id === id)?.name || "N/A";
  };

  const getCategoryName = (id: number) => {
    return categories.find((c) => c.id === id)?.name || "N/A";
  };

  const handleEdit = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(product);
    } else {
      navigate(`/products/${product.id}/edit`);
    }
  };

  const getActiveScheduledDiscount = (productId: number) => {
    const now = new Date();

    return discounts.find(
      (d) =>
        d.productId === productId &&
        d.isActive &&
        new Date(d.startsAt) <= now &&
        new Date(d.endsAt) >= now,
    );
  };

  const calculateScheduledPrice = (
    salePrice: number,
    discountType: number,
    discountValue: number,
  ) => {
    if (discountType === 2) {
      return salePrice - salePrice * (discountValue / 100);
    }

    if (discountType === 1) {
      return salePrice - discountValue;
    }

    return salePrice;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-neutral-300"
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
        <p className="mt-4 text-neutral-600">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <>
      <div className={`overflow-x-auto ${className}`}>
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
              <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                Presentación
              </th>
              <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                Precio Venta
              </th>
              <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                Precio Final
              </th>
              <th className="text-center p-4 text-sm font-semibold text-neutral-700">
                Stock
              </th>
              <th className="text-center p-4 text-sm font-semibold text-neutral-700">
                Estado
              </th>
              {showActions && (
                <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const scheduled = getActiveScheduledDiscount(product.id);

              return (
                <tr
                  key={product.id}
                  className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                  title="Click para ver detalle"
                >
                  <td className="p-4">
                    <div className="font-medium text-neutral-900">
                      {product.name}
                    </div>

                    {scheduled ? (
                      <ScheduledDiscountBadge
                        name={scheduled.name}
                        discountType={scheduled.discountType}
                        discountValue={scheduled.discountValue}
                        className="mt-1"
                      />
                    ) : (
                      <DiscountBadge
                        discountType={product.discountType}
                        discountValue={product.discountValue}
                        className="mt-1"
                      />
                    )}
                  </td>

                  <td className="p-4 text-sm text-neutral-600">
                    {getBrandName(product.brandId)}
                  </td>

                  <td className="p-4 text-sm text-neutral-600">
                    {getCategoryName(product.categoryId)}
                  </td>

                  <td className="p-4 text-sm text-neutral-600">
                    {product.presentation}
                  </td>

                  <td className="p-4 text-right">
                    <PriceDisplay
                      price={product.salePrice}
                      className="justify-end"
                    />
                  </td>

                  <td className="p-4 text-right">
                    {scheduled ? (
                      <PriceDisplay
                        price={calculateScheduledPrice(
                          product.salePrice,
                          scheduled.discountType,
                          scheduled.discountValue,
                        )}
                        originalPrice={product.salePrice}
                        showDiscount={true}
                        className="justify-end"
                      />
                    ) : (
                      <PriceDisplay
                        price={product.finalPrice}
                        originalPrice={product.salePrice}
                        showDiscount={product.discountType !== 0}
                        className="justify-end"
                      />
                    )}
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

                  <td className="p-4 text-center">
                    <StatusBadge isActive={product.isActive} />
                  </td>

                  {showActions && (
                    <td className="p-4 text-right">
                      <Button
                        variant="secondary"
                        className="text-sm"
                        onClick={(e) => handleEdit(product, e)}
                      >
                        Editar
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        brands={brands}
        categories={categories}
        laboratories={laboratories}
        suppliers={suppliers}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
};
