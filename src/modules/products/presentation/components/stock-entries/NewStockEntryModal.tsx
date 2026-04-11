import { useProductStore } from "@/modules/products/application/stores/product.store";
import { useStockEntryStore } from "@/modules/products/application/stores/stock-entry.store";
import { productsApi } from "@/modules/products/infrastructure/api/products.api";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { useEffect, useRef, useState } from "react";

interface NewStockEntryModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialProductId?: number;
}

const INITIAL_FORM = {
  quantity: "",
  expirationDate: "",
  unitPurchasePrice: "",
  reason: "",
};

export const NewStockEntryModal: React.FC<NewStockEntryModalProps> = ({
  onClose,
  onSuccess,
  initialProductId,
}) => {
  const { isLoading, createEntry } = useStockEntryStore();
  const { products } = useProductStore();

  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcode, setBarcode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  useEffect(() => {
    if (initialProductId) {
      const product = products.find((p) => p.id === initialProductId);
      if (product) {
        setSelectedProductId(product.id);
        setSearchTerm(product.name);
        setFilteredProducts([]);
      }
    } else {
      barcodeRef.current?.focus();
    }
  }, [initialProductId, products]);

  useEffect(() => {
    if (searchTerm.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredProducts(
        products.filter((p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handleSelectProduct = (id: number, name: string) => {
    setSelectedProductId(id);
    setSearchTerm(name);
    setFilteredProducts([]);
  };

  const handleClearProduct = () => {
    setSelectedProductId(null);
    setSearchTerm("");
  };

  const handleBarcodeScan = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    try {
      const product = await productsApi.getProductByCode(barcode);
      handleSelectProduct(product.id, product.name);
    } catch {
      alert("Producto no encontrado");
    } finally {
      setBarcode("");
    }
  };

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
    const today = new Date().toISOString().split("T")[0];

    if (!selectedProductId) errors.product = "Debes seleccionar un producto";
    if (!formData.quantity || parseInt(formData.quantity) <= 0)
      errors.quantity = "La cantidad debe ser mayor a 0";
    if (
      !formData.unitPurchasePrice ||
      parseFloat(formData.unitPurchasePrice) <= 0
    )
      errors.unitPurchasePrice = "El precio debe ser mayor a 0";
    if (!formData.expirationDate)
      errors.expirationDate = "La fecha de vencimiento es requerida";
    else if (formData.expirationDate < today)
      errors.expirationDate = "La fecha no puede ser pasada";
    if (!formData.reason.trim()) errors.reason = "La razón es requerida";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const totalInvestment =
    (parseInt(formData.quantity) || 0) *
    (parseFloat(formData.unitPurchasePrice) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createEntry(selectedProductId!, {
        productId: selectedProductId!,
        quantity: parseInt(formData.quantity),
        expirationDate: formData.expirationDate,
        unitPurchasePrice: parseFloat(formData.unitPurchasePrice),
        reason: formData.reason.trim(),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al crear entrada:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-neutral-100 flex-shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 mb-1">
              Nueva Entrada
            </p>
            <h2 className="text-xl font-bold text-neutral-900 leading-tight">
              Nueva Entrada de Stock
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Selecciona un producto y completa los datos de la entrada
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex-shrink-0 mt-0.5"
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

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="stock-entry-form" onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Selección de producto */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  Producto
                </p>

                <div className="space-y-3">
                  {/* Código de barras */}
                  <Input
                    ref={barcodeRef}
                    type="text"
                    label="Escanear Producto"
                    placeholder="Escanea el código de barras..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={handleBarcodeScan}
                  />

                  {/* Búsqueda por nombre */}
                  <Input
                    type="text"
                    label="Buscar Producto"
                    placeholder="Escribe el nombre del producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Error de producto */}
                {formErrors.product && (
                  <p className="mt-2 text-sm text-red-600">
                    {formErrors.product}
                  </p>
                )}

                {/* Dropdown de resultados */}
                {searchTerm &&
                  !selectedProductId &&
                  filteredProducts.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto border border-neutral-200 rounded-lg shadow-sm">
                      {filteredProducts.slice(0, 5).map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() =>
                            handleSelectProduct(product.id, product.name)
                          }
                          className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-neutral-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-neutral-500">
                            Stock actual: {product.stock} · Precio compra: S/{" "}
                            {product.purchasePrice.toFixed(2)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                {/* Producto seleccionado */}
                {selectedProduct && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
                        Producto seleccionado
                      </p>
                      <p className="font-semibold text-blue-900 mt-0.5">
                        {selectedProduct.name}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Stock actual: {selectedProduct.stock} unidades
                      </p>
                      <p className="text-xs text-blue-700 mt-1 font-medium">
                        Precio de compra: S/{" "}
                        {selectedProduct.purchasePrice.toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearProduct}
                      className="p-1 text-blue-400 hover:text-blue-700 transition-colors"
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
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-100" />

              {/* Campos de la entrada */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  Datos de la Entrada
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Cantidad"
                    name="quantity"
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    error={formErrors.quantity}
                  />
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
                      Precio de Compra Unitario (S/)
                    </label>
                    <div
                      className={`flex rounded-lg border overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 ${formErrors.unitPurchasePrice ? "border-red-400 bg-red-50" : "border-neutral-200"}`}
                    >
                      <input
                        name="unitPurchasePrice"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.unitPurchasePrice}
                        onChange={handleInputChange}
                        className="flex-1 min-w-0 px-3 py-2 text-sm text-neutral-800 bg-transparent outline-none"
                      />
                      {selectedProduct && (
                        <button
                          type="button"
                          title={`Usar precio anterior: S/ ${selectedProduct.purchasePrice.toFixed(2)}`}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              unitPurchasePrice:
                                selectedProduct.purchasePrice.toString(),
                            }))
                          }
                          className="flex items-center justify-center w-10 border-l border-neutral-200 bg-neutral-50 hover:bg-primary-50 hover:text-primary-600 text-neutral-400 transition-colors shrink-0"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    {formErrors.unitPurchasePrice && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.unitPurchasePrice}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Fecha de Vencimiento"
                    name="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    error={formErrors.expirationDate}
                    className="sm:col-span-2"
                  />
                </div>
              </div>

              {/* Inversión calculada */}
              {formData.quantity && formData.unitPurchasePrice && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">
                    Inversión Total:
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    S/ {totalInvestment.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Razón */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
                  Razón de la Entrada
                </label>
                <textarea
                  name="reason"
                  rows={3}
                  placeholder="Ej: Compra a proveedor, reabastecimiento, devolución..."
                  value={formData.reason}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-neutral-800 bg-white outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${formErrors.reason ? "border-red-400 bg-red-50" : "border-neutral-200 hover:border-neutral-300"}`}
                />
                {formErrors.reason && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.reason}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-neutral-100 flex gap-3 flex-shrink-0">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="stock-entry-form"
            variant="primary"
            className="flex-1"
            isLoading={isLoading}
          >
            Registrar Entrada
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
