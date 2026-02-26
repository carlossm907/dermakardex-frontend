import React, { useEffect, useState } from "react";
import { useStockEntryStore } from "../../application/stores/stock-entry.store";
import { useProductStore } from "../../application/stores/product.store";
import { StockEntryTable } from "../components/StockEntryTable";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Card } from "@/shared/components/ui/Card";

export const StockEntriesPage: React.FC = () => {
  const { entries, isLoading, fetchAllEntries, createEntry } =
    useStockEntryStore();
  const { products, fetchProducts } = useProductStore();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );

  const [formData, setFormData] = useState({
    quantity: "",
    unitPurchasePrice: "",
    reason: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAllEntries();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedProductId) {
      errors.product = "Debes seleccionar un producto";
    }

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || quantity <= 0) {
      errors.quantity = "La cantidad debe ser mayor a 0";
    }

    const price = parseFloat(formData.unitPurchasePrice);
    if (!formData.unitPurchasePrice || price <= 0) {
      errors.unitPurchasePrice = "El precio debe ser mayor a 0";
    }

    if (!formData.reason.trim()) {
      errors.reason = "La razón es requerida";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createEntry(selectedProductId!, {
        productId: selectedProductId!,
        quantity: parseInt(formData.quantity),
        unitPurchasePrice: parseFloat(formData.unitPurchasePrice),
        reason: formData.reason.trim(),
      });

      setFormData({ quantity: "", unitPurchasePrice: "", reason: "" });
      setSelectedProductId(null);
      setSearchTerm("");
      setShowForm(false);

      await fetchAllEntries();
      await fetchProducts();
    } catch (error) {
      console.error("Error al crear entrada:", error);
    }
  };

  const calculateTotalInvestment = () => {
    const quantity = parseInt(formData.quantity) || 0;
    const price = parseFloat(formData.unitPurchasePrice) || 0;
    return quantity * price;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-neutral-50 border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Entradas de Stock
              </h1>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowForm(!showForm)}
                variant={showForm ? "danger" : "primary"}
                className="flex items-center gap-2"
              >
                {!showForm && (
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
                {showForm ? "Cancelar" : "Nueva Entrada"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulario de nueva entrada */}
        {showForm && (
          <Card className="mb-6">
            <form onSubmit={handleSubmit}>
              <div className="border-b border-neutral-200 pb-4 mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Registrar Nueva Entrada
                </h2>
                <p className="text-sm text-neutral-600 mt-1">
                  Selecciona un producto y completa los datos de la entrada
                </p>
              </div>

              <div className="space-y-6">
                {/* Buscador y selector de producto */}
                <div>
                  <label className="label">Buscar Producto</label>
                  <Input
                    type="text"
                    placeholder="Escribe el nombre del producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {formErrors.product && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.product}
                    </p>
                  )}

                  {/* Lista de productos filtrados */}
                  {searchTerm && filteredProducts.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto border border-neutral-200 rounded-lg">
                      {filteredProducts.slice(0, 5).map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setSelectedProductId(product.id);
                            setSearchTerm(product.name);
                            setFilteredProducts([]);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-neutral-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-neutral-600">
                            Stock actual: {product.stock} | Precio compra: S/{" "}
                            {product.purchasePrice.toFixed(2)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Producto seleccionado */}
                  {selectedProduct && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-blue-900">
                            Producto Seleccionado
                          </h3>
                          <p className="text-sm text-blue-700 mt-1">
                            {selectedProduct.name}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Stock actual: {selectedProduct.stock} unidades
                          </p>
                        </div>
                        <button
                          type="button"
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
                </div>

                {/* Campos del formulario */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Cantidad"
                    name="quantity"
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    error={formErrors.quantity}
                  />

                  <Input
                    label="Precio de Compra Unitario (S/)"
                    name="unitPurchasePrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.unitPurchasePrice}
                    onChange={handleInputChange}
                    error={formErrors.unitPurchasePrice}
                  />
                </div>

                {/* Inversión total calculada */}
                {formData.quantity && formData.unitPurchasePrice && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-900">
                        Inversión Total:
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        S/ {calculateTotalInvestment().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">Razón de la Entrada</label>
                  <textarea
                    name="reason"
                    rows={3}
                    placeholder="Ej: Compra a proveedor, reabastecimiento, devolución..."
                    value={formData.reason}
                    onChange={handleInputChange}
                    className={`input ${formErrors.reason ? "border-red-500" : ""}`}
                  />
                  {formErrors.reason && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.reason}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    Registrar Entrada
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Entradas</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {entries.length}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Unidades</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {entries.reduce((sum, e) => sum + e.quantity, 0)}
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Inversión Total</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  S/{" "}
                  {entries
                    .reduce((sum, e) => sum + e.totalInvestment, 0)
                    .toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabla de entradas */}
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
              onAction={() => setShowForm(true)}
            />
          ) : (
            <StockEntryTable entries={entries} showProductColumn={true} />
          )}
        </Card>
      </div>
    </div>
  );
};
