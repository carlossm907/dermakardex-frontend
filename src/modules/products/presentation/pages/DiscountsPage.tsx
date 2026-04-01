import { useEffect, useState } from "react";
import { useProductStore } from "../../application/stores/product.store";
import { useCatalogStore } from "../../application/stores/catalog.store";
import { DiscountType } from "../../domain/models/discount.type";
import type { Product } from "../../domain/models/product.model";
import {
  DiscountModal,
  type DiscountModalMode,
} from "../components/product-discount/DiscountModal";
import { NoDiscountProductsTable } from "../components/product-discount/NoDiscountProductsTable";
import { DiscountedProductsTable } from "../components/product-discount/DiscountedProductsTable";
import { DiscountBulkActions } from "../components/product-discount/DiscountBulkActions";
import { DiscountStatsCards } from "../components/product-discount/DiscountStatsCards";

export const DiscountsPage: React.FC = () => {
  const {
    products,
    isLoading,
    fetchProducts,
    applyDiscount,
    removeDiscount,
    applyDiscountToAll,
    removeDiscountFromAll,
  } = useProductStore();

  const { brands, categories, fetchAll } = useCatalogStore();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<DiscountModalMode>("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [discountType, setDiscountType] = useState<DiscountType>(
    DiscountType.PERCENTAGE,
  );
  const [discountValue, setDiscountValue] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchAll();
  }, []);

  const productsWithDiscount = products.filter(
    (p) => p.discountType !== DiscountType.NONE && p.isActive,
  );

  const productsWithoutDiscount = products.filter(
    (p) => p.discountType === DiscountType.NONE && p.isActive,
  );

  const totalActiveCount = products.filter((p) => p.isActive).length;

  const handleOpenAddModal = (product: Product) => {
    setSelectedProduct(product);
    setDiscountType(DiscountType.PERCENTAGE);
    setDiscountValue("");
    setModalMode("add");
    setShowModal(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product);
    setDiscountType(product.discountType);
    setDiscountValue(product.discountValue.toString());
    setModalMode("edit");
    setShowModal(true);
  };

  const handleOpenApplyAllModal = () => {
    setModalMode("applyAll");
    setDiscountType(DiscountType.PERCENTAGE);
    setDiscountValue("");
    setShowModal(true);
  };

  const handleOpenRemoveAllModal = () => {
    setModalMode("removeAll");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setDiscountType(DiscountType.PERCENTAGE);
    setDiscountValue("");
  };

  const handleConfirm = async () => {
    if (modalMode === "removeAll") {
      setIsApplying(true);
      try {
        await removeDiscountFromAll();
        handleCloseModal();
      } catch (error) {
        console.error("Error al eliminar descuentos:", error);
      } finally {
        setIsApplying(false);
      }
      return;
    }

    if (modalMode === "applyAll") {
      if (!discountValue) return;
      const value = parseFloat(discountValue);
      if (isNaN(value) || value <= 0 || value > 100) {
        alert("Ingresa un porcentaje válido entre 1 y 100");
        return;
      }
      setIsApplying(true);
      try {
        await applyDiscountToAll({ type: DiscountType.PERCENTAGE, value });
        handleCloseModal();
      } catch (error) {
        console.error("Error al aplicar descuentos:", error);
      } finally {
        setIsApplying(false);
      }
      return;
    }

    if (!selectedProduct || !discountValue) return;
    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      alert("Ingresa un valor válido");
      return;
    }
    if (discountType === DiscountType.PERCENTAGE && value > 100) {
      alert("El porcentaje no puede ser mayor a 100%");
      return;
    }
    if (
      discountType === DiscountType.AMOUNT &&
      value > selectedProduct.salePrice
    ) {
      alert("El descuento no puede ser mayor al precio de venta");
      return;
    }

    setIsApplying(true);
    try {
      await applyDiscount(selectedProduct.id, { type: discountType, value });
      handleCloseModal();
    } catch (error) {
      console.error("Error al aplicar descuento:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveDiscount = async (productId: number) => {
    try {
      await removeDiscount(productId);
    } catch (error) {
      console.error("Error al eliminar descuento:", error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">
          Gestión de Descuentos
        </h1>
        <p className="text-neutral-600 mt-1">
          Administra los descuentos de tus productos
        </p>
      </div>

      <DiscountStatsCards
        withDiscountCount={productsWithDiscount.length}
        withoutDiscountCount={productsWithoutDiscount.length}
        totalActiveCount={totalActiveCount}
      />

      <DiscountBulkActions
        withDiscountCount={productsWithDiscount.length}
        onApplyAll={handleOpenApplyAllModal}
        onRemoveAll={handleOpenRemoveAllModal}
      />

      <DiscountedProductsTable
        products={productsWithDiscount}
        brands={brands}
        categories={categories}
        isLoading={isLoading}
        onEdit={handleOpenEditModal}
        onRemove={handleRemoveDiscount}
      />

      <NoDiscountProductsTable
        products={productsWithoutDiscount}
        brands={brands}
        categories={categories}
        isLoading={isLoading}
        onAddDiscount={handleOpenAddModal}
      />

      {showModal && (
        <DiscountModal
          mode={modalMode}
          selectedProduct={selectedProduct}
          discountType={discountType}
          discountValue={discountValue}
          isApplying={isApplying}
          totalActiveCount={totalActiveCount}
          withDiscountCount={productsWithDiscount.length}
          onDiscountTypeChange={setDiscountType}
          onDiscountValueChange={setDiscountValue}
          onConfirm={handleConfirm}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
