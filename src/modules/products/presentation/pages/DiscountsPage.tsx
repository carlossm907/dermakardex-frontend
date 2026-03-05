import { useEffect, useState } from "react";
import { useProductStore } from "../../application/stores/product.store";
import { useCatalogStore } from "../../application/stores/catalog.store";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { DiscountBadge } from "../components/DiscountBadge";
import { PriceDisplay } from "../components/PriceDisplay";
import { StockBadge } from "../components/StockBadge";
import { DiscountType } from "../../domain/models/discount.type";
import { getStockStatus } from "../../domain/models/product.model";
import type { Product } from "../../domain/models/product.model";

type ModalMode = "add" | "edit" | "applyAll" | "removeAll";

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
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [discountType, setDiscountType] = useState<DiscountType>(
    DiscountType.PERCENTAGE,
  );
  const [discountValue, setDiscountValue] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchAll();
  }, []);

  const getBrandName = (id: number) =>
    brands.find((b) => b.id === id)?.name || "N/A";
  const getCategoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name || "N/A";

  const productsWithDiscount = products.filter(
    (p) => p.discountType !== DiscountType.NONE && p.isActive,
  );

  const productsWithoutDiscount = products
    .filter((p) => p.discountType === DiscountType.NONE && p.isActive)
    .filter((p) =>
      searchTerm
        ? p.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true,
    );

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

  const handleApplyDiscount = async () => {
    if (modalMode === "applyAll") {
      if (!discountValue) return;
      const value = parseFloat(discountValue);
      if (isNaN(value) || value <= 0 || value > 100) {
        alert("Ingresa un porcentaje válido entre 1 y 100");
        return;
      }

      setIsApplying(true);
      try {
        await applyDiscountToAll({
          type: DiscountType.PERCENTAGE,
          value,
        });
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
      await applyDiscount(selectedProduct.id, {
        type: discountType,
        value,
      });
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

  const handleRemoveAllDiscounts = async () => {
    setIsApplying(true);
    try {
      await removeDiscountFromAll();
      handleCloseModal();
    } catch (error) {
      console.error("Error al eliminar descuentos:", error);
    } finally {
      setIsApplying(false);
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

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Con Descuento</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {productsWithDiscount.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Sin Descuento</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {productsWithoutDiscount.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Productos</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {products.filter((p) => p.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
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
            </div>
          </div>
        </Card>
      </div>

      {/* Acciones masivas */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={handleOpenApplyAllModal}
            className="flex items-center gap-1"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Aplicar Descuento a Todos
          </Button>

          {productsWithDiscount.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleOpenRemoveAllModal}
              className="flex items-center gap-1 text-red-600 hover:bg-red-50"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Eliminar Todos los Descuentos ({productsWithDiscount.length})
            </Button>
          )}
        </div>
      </Card>

      {/* Tabla de productos CON descuento */}
      <Card className="mb-6">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Productos con Descuento ({productsWithDiscount.length})
          </h2>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Cargando productos..." />
        ) : productsWithDiscount.length === 0 ? (
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            }
            title="No hay productos con descuento"
            description="Agrega descuentos a tus productos desde la tabla de abajo."
          />
        ) : (
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
                    Precio Base
                  </th>
                  <th className="text-center p-4 text-sm font-semibold text-neutral-700">
                    Descuento
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                    Precio Final
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {productsWithDiscount.map((product) => (
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
                      <DiscountBadge
                        discountType={product.discountType}
                        discountValue={product.discountValue}
                      />
                    </td>
                    <td className="p-4 text-right">
                      <PriceDisplay
                        price={product.finalPrice}
                        className="justify-end font-bold text-green-600"
                      />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          className="text-sm"
                          onClick={() => handleOpenEditModal(product)}
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
                          onClick={() => handleRemoveDiscount(product.id)}
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
        )}
      </Card>

      {/* Tabla de productos SIN descuento (para agregar) */}
      <Card>
        <div className="border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              Agregar Descuento a Productos ({productsWithoutDiscount.length})
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
        ) : productsWithoutDiscount.length === 0 ? (
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
                {productsWithoutDiscount.map((product) => (
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
                        onClick={() => handleOpenAddModal(product)}
                      >
                        Agregar Descuento
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal unificado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                {modalMode === "add" && "Agregar Descuento"}
                {modalMode === "edit" && "Editar Descuento"}
                {modalMode === "applyAll" && "Aplicar Descuento a Todos"}
                {modalMode === "removeAll" && "Eliminar Todos los Descuentos"}
              </h3>
              {(modalMode === "add" || modalMode === "edit") &&
                selectedProduct && (
                  <p className="text-sm text-neutral-600 mt-1">
                    {selectedProduct.name}
                  </p>
                )}
            </div>

            <div className="p-6 space-y-4">
              {modalMode === "removeAll" ? (
                // Modal de confirmación de eliminación masiva
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                    ¿Estás seguro?
                  </h4>
                  <p className="text-sm text-neutral-600">
                    Se eliminarán los descuentos de{" "}
                    <span className="font-bold">
                      {productsWithDiscount.length}
                    </span>{" "}
                    productos. Esta acción no se puede deshacer.
                  </p>
                </div>
              ) : (
                // Modal de agregar/editar/aplicar a todos
                <>
                  {modalMode === "applyAll" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800">
                        Se aplicará el descuento a{" "}
                        <span className="font-bold">
                          {products.filter((p) => p.isActive).length}
                        </span>{" "}
                        productos activos.
                      </p>
                    </div>
                  )}

                  {/* Tipo de descuento */}
                  {modalMode !== "applyAll" && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Tipo de Descuento
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            setDiscountType(DiscountType.PERCENTAGE)
                          }
                          className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                            discountType === DiscountType.PERCENTAGE
                              ? "border-primary-600 bg-primary-50 text-primary-700"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          Porcentaje (%)
                        </button>
                        <button
                          onClick={() => setDiscountType(DiscountType.AMOUNT)}
                          className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                            discountType === DiscountType.AMOUNT
                              ? "border-primary-600 bg-primary-50 text-primary-700"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          Monto (S/)
                        </button>
                      </div>
                    </div>
                  )}

                  {modalMode === "applyAll" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-800">
                        Solo se puede aplicar descuento por porcentaje a todos
                        los productos.
                      </p>
                    </div>
                  )}

                  {/* Valor del descuento */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {modalMode === "applyAll"
                        ? "Porcentaje de Descuento"
                        : "Valor del Descuento"}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={
                        modalMode === "applyAll" ||
                        discountType === DiscountType.PERCENTAGE
                          ? "100"
                          : selectedProduct?.salePrice.toString()
                      }
                      placeholder={
                        modalMode === "applyAll" ||
                        discountType === DiscountType.PERCENTAGE
                          ? "Ej: 15"
                          : "Ej: 10.50"
                      }
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                    />
                  </div>

                  {/* Preview */}
                  {discountValue &&
                    parseFloat(discountValue) > 0 &&
                    selectedProduct &&
                    modalMode !== "applyAll" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-neutral-600">
                            Precio Base:
                          </span>
                          <span className="font-medium">
                            S/ {selectedProduct.salePrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-neutral-600">
                            Descuento:
                          </span>
                          <span className="text-red-600 font-medium">
                            {discountType === DiscountType.PERCENTAGE
                              ? `${parseFloat(discountValue)}%`
                              : `- S/ ${parseFloat(discountValue).toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-green-300">
                          <span className="font-semibold text-green-800">
                            Precio Final:
                          </span>
                          <span className="text-lg font-bold text-green-700">
                            S/{" "}
                            {(
                              selectedProduct.salePrice -
                              (discountType === DiscountType.PERCENTAGE
                                ? (selectedProduct.salePrice *
                                    parseFloat(discountValue)) /
                                  100
                                : parseFloat(discountValue))
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>

            <div className="border-t border-neutral-200 px-6 py-4 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleCloseModal}
                disabled={isApplying}
              >
                Cancelar
              </Button>
              <Button
                variant={modalMode === "removeAll" ? "secondary" : "primary"}
                className={`flex-1 ${modalMode === "removeAll" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                onClick={
                  modalMode === "removeAll"
                    ? handleRemoveAllDiscounts
                    : handleApplyDiscount
                }
                isLoading={isApplying}
                disabled={
                  modalMode === "removeAll"
                    ? false
                    : !discountValue || parseFloat(discountValue) <= 0
                }
              >
                {modalMode === "removeAll" ? "Sí, Eliminar Todos" : "Confirmar"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
