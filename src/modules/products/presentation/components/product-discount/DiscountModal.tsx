import { DiscountType } from "@/modules/products/domain/models/discount.type";
import type { Product } from "@/modules/products/domain/models/product.model";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";

export type DiscountModalMode = "add" | "edit" | "applyAll" | "removeAll";

interface DiscountModalProps {
  mode: DiscountModalMode;
  selectedProduct: Product | null;
  discountType: DiscountType;
  discountValue: string;
  isApplying: boolean;
  totalActiveCount: number;
  withDiscountCount: number;
  onDiscountTypeChange: (type: DiscountType) => void;
  onDiscountValueChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const MODAL_TITLES: Record<DiscountModalMode, string> = {
  add: "Agregar Descuento",
  edit: "Editar Descuento",
  applyAll: "Aplicar Descuento a Todos",
  removeAll: "Eliminar Todos los Descuentos",
};

export const DiscountModal: React.FC<DiscountModalProps> = ({
  mode,
  selectedProduct,
  discountType,
  discountValue,
  isApplying,
  totalActiveCount,
  withDiscountCount,
  onDiscountTypeChange,
  onDiscountValueChange,
  onConfirm,
  onClose,
}) => {
  const finalPrice =
    selectedProduct && discountValue && parseFloat(discountValue) > 0
      ? selectedProduct.salePrice -
        (discountType === DiscountType.PERCENTAGE
          ? (selectedProduct.salePrice * parseFloat(discountValue)) / 100
          : parseFloat(discountValue))
      : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        {/* Header */}
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            {MODAL_TITLES[mode]}
          </h3>
          {(mode === "add" || mode === "edit") && selectedProduct && (
            <p className="text-sm text-neutral-600 mt-1">
              {selectedProduct.name}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {mode === "removeAll" ? (
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
                <span className="font-bold">{withDiscountCount}</span>{" "}
                productos. Esta acción no se puede deshacer.
              </p>
            </div>
          ) : (
            <>
              {mode === "applyAll" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    Se aplicará el descuento a{" "}
                    <span className="font-bold">{totalActiveCount}</span>{" "}
                    productos activos.
                  </p>
                </div>
              )}

              {/* Tipo de descuento (solo para add/edit) */}
              {mode !== "applyAll" && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tipo de Descuento
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        onDiscountTypeChange(DiscountType.PERCENTAGE)
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
                      onClick={() => onDiscountTypeChange(DiscountType.AMOUNT)}
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

              {mode === "applyAll" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    Solo se puede aplicar descuento por porcentaje a todos los
                    productos.
                  </p>
                </div>
              )}

              {/* Valor del descuento */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {mode === "applyAll"
                    ? "Porcentaje de Descuento"
                    : "Valor del Descuento"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={
                    mode === "applyAll" ||
                    discountType === DiscountType.PERCENTAGE
                      ? "100"
                      : selectedProduct?.salePrice.toString()
                  }
                  placeholder={
                    mode === "applyAll" ||
                    discountType === DiscountType.PERCENTAGE
                      ? "Ej: 15"
                      : "Ej: 10.50"
                  }
                  value={discountValue}
                  onChange={(e) => onDiscountValueChange(e.target.value)}
                />
              </div>

              {/* Preview del precio final */}
              {finalPrice !== null &&
                selectedProduct &&
                mode !== "applyAll" && (
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
                        S/ {finalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-6 py-4 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isApplying}
          >
            Cancelar
          </Button>
          <Button
            variant={mode === "removeAll" ? "secondary" : "primary"}
            className={`flex-1 ${mode === "removeAll" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
            onClick={onConfirm}
            isLoading={isApplying}
            disabled={
              mode === "removeAll"
                ? false
                : !discountValue || parseFloat(discountValue) <= 0
            }
          >
            {mode === "removeAll" ? "Sí, Eliminar Todos" : "Confirmar"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
