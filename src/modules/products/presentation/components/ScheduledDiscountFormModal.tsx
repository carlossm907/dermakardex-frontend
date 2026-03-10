import { useState } from "react";
import { useScheduledDiscountStore } from "../../application/stores/scheduled-discount.store";
import type { Product } from "../../domain/models/product.model";
import type { ScheduledDiscount } from "../../domain/models/scheduled-discount.model";
import { DiscountType } from "../../domain/models/discount.type";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

type ApplyMode = "single" | "multiple" | "all";

interface Props {
  editingDiscount: ScheduledDiscount | null;
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

const toLocalDatetimeValue = (isoString?: string) => {
  if (!isoString) return "";
  return isoString.slice(0, 16);
};

const toIsoString = (localValue: string) => {
  if (!localValue) return "";
  return new Date(localValue).toISOString();
};

export const ScheduledDiscountFormModal: React.FC<Props> = ({
  editingDiscount,
  products,
  onClose,
  onSuccess,
}) => {
  const { createForProduct, createForProducts, createForAll, update } =
    useScheduledDiscountStore();
  const isEditing = !!editingDiscount;
  const [mode, setMode] = useState<ApplyMode>("single");
  const [name, setName] = useState(editingDiscount?.name ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(
    editingDiscount?.discountType ?? DiscountType.PERCENTAGE,
  );
  const [discountValue, setDiscountValue] = useState(
    editingDiscount?.discountValue?.toString() ?? "",
  );
  const [startsAt, setStartsAt] = useState(
    toLocalDatetimeValue(editingDiscount?.startsAt),
  );
  const [endsAt, setEndsAt] = useState(
    toLocalDatetimeValue(editingDiscount?.endsAt),
  );

  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    editingDiscount?.productId ?? null,
  );

  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(
    new Set(),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = productSearch.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()),
      )
    : products;

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const toggleProductSelection = (id: number) => {
    const next = new Set(selectedProductIds);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedProductIds(next);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "El nombre es requerido";

    if (!isEditing) {
      if (mode === "single" && !selectedProductId)
        errs.product = "Selecciona un producto";
      if (mode === "multiple" && selectedProductIds.size === 0)
        errs.products = "Selecciona al menos un producto";
    }

    const val = parseFloat(discountValue);
    if (!discountValue || val <= 0) errs.value = "El valor debe ser mayor a 0";
    if (discountType === DiscountType.PERCENTAGE && val > 100)
      errs.value = "El porcentaje no puede superar 100";

    if (!startsAt) errs.startsAt = "La fecha de inicio es requerida";
    if (!endsAt) errs.endsAt = "La fecha de fin es requerida";
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt))
      errs.endsAt = "La fecha de fin debe ser posterior al inicio";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const value = parseFloat(discountValue);

    try {
      if (isEditing) {
        await update(editingDiscount.id, {
          name: name.trim(),
          type: discountType,
          value,
          startsAt: toIsoString(startsAt),
          endsAt: toIsoString(endsAt),
        });
      } else if (mode === "single" && selectedProductId) {
        await createForProduct({
          productId: selectedProductId,
          name: name.trim(),
          type: discountType,
          value,
          startsAt: toIsoString(startsAt),
          endsAt: toIsoString(endsAt),
        });
      } else if (mode === "multiple") {
        await createForProducts({
          productIds: Array.from(selectedProductIds),
          name: name.trim(),
          discountType,
          discountValue: value,
          startsAt: toIsoString(startsAt),
          endsAt: toIsoString(endsAt),
        });
      } else if (mode === "all") {
        await createForAll({
          name: name.trim(),
          discountType,
          discountValue: value,
          startsAt: toIsoString(startsAt),
          endsAt: toIsoString(endsAt),
        });
      }
      onSuccess();
    } catch {
      /* error shown by store */
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 mb-1">
              Descuento Programado
            </p>
            <h2 className="text-xl font-bold text-neutral-900">
              {isEditing ? "Editar Descuento" : "Nuevo Descuento"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
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

        <div className="px-6 py-5 space-y-6">
          {/* Nombre */}
          <Input
            label="Nombre del descuento"
            type="text"
            placeholder="Ej: Promo Verano 2025"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          {/* Modo de aplicación (solo al crear) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Aplicar a
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    {
                      key: "single",
                      label: "Un producto",
                      desc: "Individual",
                      icon: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      ),
                    },
                    {
                      key: "multiple",
                      label: "Varios",
                      desc: "Selección múltiple",
                      icon: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      ),
                    },
                    {
                      key: "all",
                      label: "Todos",
                      desc: "Masivo",
                      icon: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      ),
                    },
                  ] as const
                ).map(({ key, label, desc, icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMode(key)}
                    className={`p-3 border-2 rounded-xl transition-all text-left ${
                      mode === key
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                        mode === key ? "bg-primary-100" : "bg-neutral-100"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 ${mode === key ? "text-primary-600" : "text-neutral-500"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {icon}
                      </svg>
                    </div>
                    <div className="font-medium text-sm text-neutral-900">
                      {label}
                    </div>
                    <div className="text-xs text-neutral-500">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tipo de descuento */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Tipo de descuento
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDiscountType(DiscountType.PERCENTAGE)}
                className={`flex-1 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                  discountType === DiscountType.PERCENTAGE
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
                }`}
              >
                Porcentaje (%)
              </button>
              <button
                type="button"
                onClick={() => setDiscountType(DiscountType.AMOUNT)}
                className={`flex-1 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                  discountType === DiscountType.AMOUNT
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
                }`}
              >
                Monto fijo (S/)
              </button>
            </div>
          </div>

          {/* Valor */}
          <Input
            label={
              discountType === DiscountType.PERCENTAGE
                ? "Porcentaje de descuento (%)"
                : "Monto de descuento (S/)"
            }
            type="number"
            step="0.01"
            min="0"
            max={discountType === DiscountType.PERCENTAGE ? "100" : undefined}
            placeholder="0.00"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            error={errors.value}
          />

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Fecha de inicio
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className={`input w-full ${errors.startsAt ? "border-red-500" : ""}`}
              />
              {errors.startsAt && (
                <p className="mt-1 text-sm text-red-600">{errors.startsAt}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Fecha de fin
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className={`input w-full ${errors.endsAt ? "border-red-500" : ""}`}
              />
              {errors.endsAt && (
                <p className="mt-1 text-sm text-red-600">{errors.endsAt}</p>
              )}
            </div>
          </div>

          {/* Selección de producto — modo single */}
          {!isEditing && mode === "single" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Producto
              </label>

              {selectedProduct ? (
                <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-xl">
                  <div>
                    <div className="font-medium text-primary-900 text-sm">
                      {selectedProduct.name}
                    </div>
                    <div className="text-xs text-primary-600 mt-0.5">
                      Precio: S/ {selectedProduct.salePrice.toFixed(2)} | Stock:{" "}
                      {selectedProduct.stock}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProductId(null);
                      setProductSearch("");
                    }}
                    className="text-primary-500 hover:text-primary-700"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className={`input w-full ${errors.product ? "border-red-500" : ""}`}
                  />
                  {productSearch && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredProducts.slice(0, 8).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setProductSearch(p.name);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 border-b border-neutral-100 last:border-0 transition-colors"
                        >
                          <div className="text-sm font-medium text-neutral-900">
                            {p.name}
                          </div>
                          <div className="text-xs text-neutral-500">
                            S/ {p.salePrice.toFixed(2)} | Stock: {p.stock}
                          </div>
                        </button>
                      ))}
                      {filteredProducts.length === 0 && (
                        <div className="px-4 py-3 text-sm text-neutral-500">
                          No se encontraron productos
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {errors.product && (
                <p className="mt-1 text-sm text-red-600">{errors.product}</p>
              )}
            </div>
          )}

          {/* Selección múltiple */}
          {!isEditing && mode === "multiple" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Productos ({selectedProductIds.size} seleccionados)
              </label>
              {errors.products && (
                <p className="mb-2 text-sm text-red-600">{errors.products}</p>
              )}
              <div className="border border-neutral-200 rounded-xl max-h-60 overflow-y-auto divide-y divide-neutral-100">
                {products.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.has(p.id)}
                      onChange={() => toggleProductSelection(p.id)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        S/ {p.salePrice.toFixed(2)} | Stock: {p.stock}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Modo all — aviso */}
          {!isEditing && mode === "all" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Descuento masivo
                </p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Este descuento se programará para los {products.length}{" "}
                  productos del sistema. Los que ya tengan un descuento en ese
                  rango de fechas serán omitidos.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 border-t border-neutral-100 pt-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {isEditing ? "Guardar cambios" : "Crear descuento"}
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
