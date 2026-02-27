import { useProductStore } from "../../application/stores/product.store";
import { useCatalogStore } from "../../application/stores/catalog.store";
import { useEffect, useState } from "react";
import { DiscountType } from "../../domain/models/discount.type";
import { Card } from "@/shared/components/ui/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

type DiscountMode = "single" | "multiple" | "all";

export const DiscountsPage: React.FC = () => {
  const {
    products,
    isLoading,
    fetchProducts,
    applyDiscount,
    //removeDiscount,
    applyDiscountToMultiple,
    applyDiscountToAll,
    removeDiscountFromAll,
  } = useProductStore();

  const { fetchAll } = useCatalogStore();

  const [mode, setMode] = useState<DiscountMode>("single");

  const [discountType, setDiscountType] = useState<DiscountType>(
    DiscountType.PERCENTAGE,
  );

  const [discountValue, setDiscountValue] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );

  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(
    new Set(),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProducts();
    fetchAll();
  }, []);

  const filteredProducts = searchTerm.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : products;

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleProductSelection = (productId: number) => {
    const newSelection = new Set(selectedProductIds);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProductIds(newSelection);
  };

  const validateDiscount = (): boolean => {
    const errors: Record<string, string> = {};

    if (mode === "single" && !selectedProductId) {
      errors.product = "Debes seleccionar un producto";
    }

    if (mode === "multiple" && selectedProductIds.size === 0) {
      errors.products = "Debes seleccionar al menos un producto";
    }

    const value = parseFloat(discountValue);
    if (!discountValue || value <= 0) {
      errors.value = "El valor del descuento debe ser mayor a 0";
    }

    if (discountType === DiscountType.PERCENTAGE && value > 100) {
      errors.value = "El porcentaje no puede ser mayor a 100";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyDiscount = async () => {
    if (!validateDiscount()) return;

    const discountData = {
      type: discountType,
      value: parseFloat(discountValue),
    };

    try {
      if (mode === "single" && selectedProductId) {
        await applyDiscount(selectedProductId, discountData);
      } else if (mode === "multiple" && selectedProductIds) {
        await applyDiscountToMultiple(
          Array.from(selectedProductIds),
          discountData,
        );
      } else if (mode === "all") {
        await applyDiscountToAll(discountData);
      }

      setDiscountValue("");
      setSelectedProductId(null);
      setSelectedProductIds(new Set());
      setSearchTerm("");

      await fetchProducts();
    } catch (error) {
      console.error("Error al aplicar descuento:", error);
    }
  };

  const handleRemoveDiscounts = async () => {
    if (!window.confirm("¿Estás seguro de eliminar todos los descuentos?")) {
      return;
    }

    try {
      await removeDiscountFromAll();
      await fetchProducts();
    } catch (error) {
      console.error("Error al eliminar descuentos:", error);
    }
  };

  const productsWithDiscount = products.filter(
    (p) => p.discountType !== DiscountType.NONE,
  );

  const calculatePreview = () => {
    if (!discountValue) return null;

    const value = parseFloat(discountValue);

    let affectedProducts: typeof products = [];

    if (mode === "single" && selectedProduct) {
      affectedProducts = [selectedProduct];
    } else if (mode === "multiple") {
      affectedProducts = products.filter((p) => selectedProductIds.has(p.id));
    } else if (mode === "all") {
      affectedProducts = products;
    }

    const totalSavings = affectedProducts.reduce((sum, product) => {
      if (discountType === DiscountType.PERCENTAGE) {
        return sum + (product.salePrice * value) / 100;
      } else {
        return sum + Math.min(value, product.maxDiscountAmount);
      }
    }, 0);

    return {
      count: affectedProducts.length,
      totalSavings,
    };
  };

  const preview = calculatePreview();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-gradient-to-br from-red-50 to-white border border-neutral-100 shadow-sm rounded-xl">
          <div className="px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-red-800">
                  Gestión de Descuentos
                </h1>
              </div>
              <div className="flex gap-3">
                {productsWithDiscount.length > 0 && (
                  <Button
                    onClick={handleRemoveDiscounts}
                    variant="danger"
                    className="flex items-center gap-2"
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
                    Eliminar Todos los Descuentos
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-red-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">
                  Productos con Descuento
                </p>
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
                <p className="text-sm text-neutral-600">Total Productos</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {products.length}
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
                <p className="text-sm text-neutral-600">Sin Descuento</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {products.length - productsWithDiscount.length}
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

        {/* Formulario de aplicar descuento */}
        <Card className="mb-6">
          <div className="border-b border-neutral-200 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Aplicar Descuento
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Selecciona el modo, tipo y valor del descuento
            </p>
          </div>

          <div className="space-y-6">
            {/* Selector de modo */}
            <div>
              <label className="label">Modo de Aplicación</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setMode("single")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    mode === "single"
                      ? "border-red-500 bg-red-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        mode === "single" ? "bg-red-100" : "bg-neutral-100"
                      }`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          mode === "single"
                            ? "text-red-600"
                            : "text-neutral-600"
                        }`}
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
                    <div className="text-left">
                      <div className="font-medium text-neutral-900">
                        Un Producto
                      </div>
                      <div className="text-xs text-neutral-600">
                        Descuento individual
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("multiple")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    mode === "multiple"
                      ? "border-red-500 bg-red-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        mode === "multiple" ? "bg-red-100" : "bg-neutral-100"
                      }`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          mode === "multiple"
                            ? "text-red-600"
                            : "text-neutral-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-neutral-900">
                        Varios Productos
                      </div>
                      <div className="text-xs text-neutral-600">
                        Selección múltiple
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("all")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    mode === "all"
                      ? "border-red-500 bg-red-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        mode === "all" ? "bg-red-100" : "bg-neutral-100"
                      }`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          mode === "all" ? "text-red-600" : "text-neutral-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-neutral-900">Todos</div>
                      <div className="text-xs text-neutral-600">
                        Descuento masivo
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Tipo de descuento */}
            <div>
              <label className="label">Tipo de Descuento</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer flex-1 transition-all hover:border-neutral-300">
                  <input
                    type="radio"
                    name="discountType"
                    checked={discountType === DiscountType.PERCENTAGE}
                    onChange={() => setDiscountType(DiscountType.PERCENTAGE)}
                    className="w-4 h-4 text-red-600"
                  />
                  <div>
                    <div className="font-medium text-neutral-900">
                      Porcentaje
                    </div>
                    <div className="text-xs text-neutral-600">
                      Ej: 15% de descuento
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer flex-1 transition-all hover:border-neutral-300">
                  <input
                    type="radio"
                    name="discountType"
                    checked={discountType === DiscountType.AMOUNT}
                    onChange={() => setDiscountType(DiscountType.AMOUNT)}
                    className="w-4 h-4 text-red-600"
                  />
                  <div>
                    <div className="font-medium text-neutral-900">
                      Monto Fijo
                    </div>
                    <div className="text-xs text-neutral-600">
                      Ej: S/ 10.00 de descuento
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Valor del descuento */}
            <Input
              label={
                discountType === DiscountType.PERCENTAGE
                  ? "Porcentaje de Descuento (%)"
                  : "Monto de Descuento (S/)"
              }
              type="number"
              step="0.01"
              placeholder={
                discountType === DiscountType.PERCENTAGE ? "0.00" : "0.00"
              }
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              error={errors.value}
            />

            {/* Preview del descuento */}
            {preview && preview.count > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-amber-900">
                      Vista Previa del Descuento
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-amber-700">
                      <p>
                        • Productos afectados: <strong>{preview.count}</strong>
                      </p>
                      <p>
                        • Descuento total aproximado:{" "}
                        <strong>S/ {preview.totalSavings.toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de aplicar */}
            <Button
              onClick={handleApplyDiscount}
              isLoading={isLoading}
              className="w-full"
              disabled={
                (mode === "single" && !selectedProductId) ||
                (mode === "multiple" && selectedProductIds.size === 0) ||
                !discountValue
              }
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
              Aplicar Descuento
            </Button>
          </div>
        </Card>

        {/* Selección de productos según modo */}
        {mode === "single" && (
          <Card className="mb-6">
            <div className="border-b border-neutral-200 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Seleccionar Producto
              </h2>
            </div>

            <Input
              type="text"
              placeholder="Buscar producto por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />

            {errors.product && (
              <p className="mb-4 text-sm text-red-600">{errors.product}</p>
            )}

            {selectedProduct && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Producto Seleccionado
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      {selectedProduct.name}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Precio: S/ {selectedProduct.salePrice.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProductId(null);
                      setSearchTerm("");
                    }}
                    className="text-blue-600 hover:text-blue-800"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {searchTerm && filteredProducts.length > 0 && !selectedProduct && (
              <div className="max-h-96 overflow-y-auto border border-neutral-200 rounded-lg">
                {filteredProducts.slice(0, 10).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setSearchTerm(product.name);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-neutral-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-neutral-600">
                      Precio: S/ {product.salePrice.toFixed(2)} | Stock:{" "}
                      {product.stock}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

        {mode === "multiple" && (
          <Card>
            <div className="border-b border-neutral-200 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Seleccionar Productos ({selectedProductIds.size} seleccionados)
              </h2>
            </div>

            {errors.products && (
              <p className="mb-4 text-sm text-red-600">{errors.products}</p>
            )}

            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-4 p-4 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.has(product.id)}
                      onChange={() => handleProductSelection(product.id)}
                      className="w-5 h-5 text-red-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-neutral-600">
                        Precio: S/ {product.salePrice.toFixed(2)} | Stock:{" "}
                        {product.stock}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </Card>
        )}

        {mode === "all" && (
          <Card className="bg-gradient-to-r from-red-50 to-white border-l-4 border-red-500">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-900">
                  Aplicar Descuento a Todos los Productos
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Este descuento se aplicará a los {products.length} productos
                  registrados en el sistema. Esta acción puede ser revertida
                  eliminando todos los descuentos.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
