/* eslint-disable react-hooks/static-components */
import { useEffect, useState } from "react";
import { useCatalogStore } from "../../../application/stores/catalog.store";
import { useProductStore } from "../../../application/stores/product.store";
import {
  ProductPresentation,
  type CreateProductData,
  type Product,
  type UpdateProductData,
} from "../../../domain/models/product.model";
import { LoadingSpinner } from "../LoadingSpinner";

const Field = ({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const inputClass = (hasError?: string) =>
  `w-full rounded-lg border px-3 py-2 text-sm text-neutral-800 bg-white outline-none transition-all
    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
    ${hasError ? "border-red-400 bg-red-50" : "border-neutral-200 hover:border-neutral-300"}`;

const selectClass = (hasError?: string) =>
  `w-full rounded-lg border px-3 py-2 text-sm text-neutral-800 bg-white outline-none transition-all
    focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer
    ${hasError ? "border-red-400 bg-red-50" : "border-neutral-200 hover:border-neutral-300"}`;

const SectionTitle = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">
      {title}
    </h3>
  </div>
);

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess?: (product: Product) => void;
}

const presentationLabels: Record<ProductPresentation, string> = {
  [ProductPresentation.Units]: "Unidades",
  [ProductPresentation.Halfdozen]: "Media Docena",
  [ProductPresentation.Dozen]: "Docena",
};

const INITIAL_FORM = {
  code: "",
  name: "",
  brandId: "",
  laboratoryId: "",
  categoryId: "",
  supplierId: "",
  presentation: "",
  purchasePrice: "",
  salePrice: "",
  maxDiscountAmount: "",
  initialStock: "",
  stockAlertThreshold: "",
  isActive: true,
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  const isEditMode = !!product;

  const { createProduct, updateProduct, isLoading } = useProductStore();
  const { brands, categories, laboratories, suppliers, fetchAll } =
    useCatalogStore();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (isEditMode && product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        code: product.code,
        name: product.name,
        brandId: product.brandId.toString(),
        laboratoryId: product.laboratoryId.toString(),
        categoryId: product.categoryId.toString(),
        supplierId: product.supplierId.toString(),
        presentation: product.presentation,
        purchasePrice: product.purchasePrice.toString(),
        salePrice: product.salePrice.toString(),
        maxDiscountAmount: product.maxDiscountAmount.toString(),
        initialStock: product.stock.toString(),
        stockAlertThreshold: product.stockAlertThreshold.toString(),
        isActive: product.isActive,
      });
    }
  }, [isEditMode, product]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    else if (formData.name.trim().length < 3)
      newErrors.name = "Mínimo 3 caracteres";

    if (!formData.brandId) newErrors.brandId = "Selecciona una marca";
    if (!formData.laboratoryId)
      newErrors.laboratoryId = "Selecciona un laboratorio";
    if (!formData.categoryId) newErrors.categoryId = "Selecciona una categoría";
    if (!formData.supplierId) newErrors.supplierId = "Selecciona un proveedor";
    if (!formData.presentation)
      newErrors.presentation = "Selecciona una presentación";

    const purchasePrice = parseFloat(formData.purchasePrice);
    const salePrice = parseFloat(formData.salePrice);
    const maxDiscount = parseFloat(formData.maxDiscountAmount);

    if (!formData.purchasePrice || purchasePrice <= 0)
      newErrors.purchasePrice = "Debe ser mayor a 0";
    if (!formData.salePrice || salePrice <= 0)
      newErrors.salePrice = "Debe ser mayor a 0";
    else if (salePrice < purchasePrice)
      newErrors.salePrice = "Debe ser mayor al precio de compra";
    if (formData.maxDiscountAmount === "" || maxDiscount < 0)
      newErrors.maxDiscountAmount = "No puede ser negativo";

    if (!isEditMode) {
      const initialStock = parseInt(formData.initialStock);
      if (formData.initialStock === "" || initialStock < 0)
        newErrors.initialStock = "No puede ser negativo";
    }

    const threshold = parseInt(formData.stockAlertThreshold);
    if (formData.stockAlertThreshold === "" || threshold < 0)
      newErrors.stockAlertThreshold = "No puede ser negativo";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateMargin = () => {
    const purchase = parseFloat(formData.purchasePrice) || 0;
    const sale = parseFloat(formData.salePrice) || 0;
    if (purchase > 0 && sale > 0)
      return (((sale - purchase) / purchase) * 100).toFixed(1);
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let savedProduct: Product;

      if (isEditMode && product) {
        const updateData: UpdateProductData = {
          code: formData.code.trim(),
          name: formData.name.trim(),
          brandId: parseInt(formData.brandId),
          laboratoryId: parseInt(formData.laboratoryId),
          categoryId: parseInt(formData.categoryId),
          supplierId: parseInt(formData.supplierId),
          presentation: formData.presentation as ProductPresentation,
          purchasePrice: parseFloat(formData.purchasePrice),
          salePrice: parseFloat(formData.salePrice),
          maxDiscountAmount: parseFloat(formData.maxDiscountAmount),
          stockAlertThreshold: parseInt(formData.stockAlertThreshold),
          isActive: formData.isActive,
        };
        savedProduct = await updateProduct(product.id, updateData);
      } else {
        const createData: CreateProductData = {
          code: formData.code.trim(),
          name: formData.name.trim(),
          brandId: parseInt(formData.brandId),
          laboratoryId: parseInt(formData.laboratoryId),
          categoryId: parseInt(formData.categoryId),
          supplierId: parseInt(formData.supplierId),
          presentation: formData.presentation as ProductPresentation,
          purchasePrice: parseFloat(formData.purchasePrice),
          salePrice: parseFloat(formData.salePrice),
          maxDiscountAmount: parseFloat(formData.maxDiscountAmount),
          initialStock: parseInt(formData.initialStock),
          stockAlertThreshold: parseInt(formData.stockAlertThreshold),
          isActive: true,
        };
        savedProduct = await createProduct(createData);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        onSuccess?.(savedProduct);
        onClose();
      }, 1200);
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  const margin = calculateMargin();

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
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-neutral-100 flex-shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 mb-1">
              {isEditMode ? "Editar Producto" : "Nuevo Producto"}
            </p>
            <h2 className="text-xl font-bold text-neutral-900 leading-tight">
              {isEditMode ? product.name : "Registrar nuevo producto"}
            </h2>
            {isEditMode && (
              <p className="text-xs text-neutral-400 mt-0.5">
                ID #{product.id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex-shrink-0 mt-0.5"
            aria-label="Cerrar"
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

        {/* ── Body (scrollable) ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {saveSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-base font-semibold text-neutral-800">
                {isEditMode ? "Producto actualizado" : "Producto creado"}
              </p>
              <p className="text-sm text-neutral-500">Cerrando...</p>
            </div>
          ) : isLoading && !brands.length ? (
            <LoadingSpinner message="Cargando catálogos..." />
          ) : (
            <form id="product-form" onSubmit={handleSubmit} noValidate>
              {/* ── Identificación ── */}
              <div className="mb-6">
                <SectionTitle
                  icon={
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
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  }
                  title="Identificación"
                />
                <div className="space-y-3">
                  <Field label="Código del producto" error={errors.code}>
                    <input
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="Ej. 7549535935"
                      className={inputClass(errors.code)}
                    />
                  </Field>

                  <Field label="Nombre del producto" error={errors.name}>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ej. Paracetamol 500mg"
                      className={inputClass(errors.name)}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Marca" error={errors.brandId}>
                      <select
                        name="brandId"
                        value={formData.brandId}
                        onChange={handleInputChange}
                        className={selectClass(errors.brandId)}
                      >
                        <option value="">Seleccionar...</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Categoría" error={errors.categoryId}>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className={selectClass(errors.categoryId)}
                      >
                        <option value="">Seleccionar...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Laboratorio" error={errors.laboratoryId}>
                      <select
                        name="laboratoryId"
                        value={formData.laboratoryId}
                        onChange={handleInputChange}
                        className={selectClass(errors.laboratoryId)}
                      >
                        <option value="">Seleccionar...</option>
                        {laboratories.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Proveedor" error={errors.supplierId}>
                      <select
                        name="supplierId"
                        value={formData.supplierId}
                        onChange={handleInputChange}
                        className={selectClass(errors.supplierId)}
                      >
                        <option value="">Seleccionar...</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Presentación" error={errors.presentation}>
                    <select
                      name="presentation"
                      value={formData.presentation}
                      onChange={handleInputChange}
                      className={selectClass(errors.presentation)}
                    >
                      <option value="">Seleccionar...</option>
                      {Object.values(ProductPresentation).map((p) => (
                        <option key={p} value={p}>
                          {presentationLabels[p]}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              {/* ── Precios ── */}
              <div className="mb-6">
                <SectionTitle
                  icon={
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                  title="Precios"
                />
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Precio de Compra (S/)"
                      error={errors.purchasePrice}
                    >
                      <input
                        name="purchasePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.purchasePrice}
                        onChange={handleInputChange}
                        className={inputClass(errors.purchasePrice)}
                      />
                    </Field>

                    <Field
                      label="Precio de Venta (S/)"
                      error={errors.salePrice}
                    >
                      <input
                        name="salePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        className={inputClass(errors.salePrice)}
                      />
                    </Field>
                  </div>

                  {/* Indicador de margen */}
                  {margin !== null && (
                    <div
                      className={`rounded-lg p-3 flex items-center justify-between border ${
                        parseFloat(margin) < 0
                          ? "bg-red-50 border-red-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${parseFloat(margin) < 0 ? "text-red-700" : "text-blue-700"}`}
                      >
                        Margen de ganancia
                      </span>
                      <span
                        className={`text-sm font-bold ${parseFloat(margin) < 0 ? "text-red-600" : "text-blue-600"}`}
                      >
                        {margin}%
                      </span>
                    </div>
                  )}

                  <Field
                    label="Descuento Máximo Permitido (S/)"
                    error={errors.maxDiscountAmount}
                  >
                    <input
                      name="maxDiscountAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      className={inputClass(errors.maxDiscountAmount)}
                    />
                  </Field>
                </div>
              </div>

              {/* ── Stock ── */}
              <div className="mb-6">
                <SectionTitle
                  icon={
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  }
                  title="Stock"
                />
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {!isEditMode && (
                      // eslint-disable-next-line react-hooks/static-components
                      <Field label="Stock Inicial" error={errors.initialStock}>
                        <input
                          name="initialStock"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={formData.initialStock}
                          onChange={handleInputChange}
                          className={inputClass(errors.initialStock)}
                        />
                      </Field>
                    )}
                    <Field
                      label="Umbral de Alerta"
                      error={errors.stockAlertThreshold}
                      className={isEditMode ? "col-span-2" : ""}
                    >
                      <input
                        name="stockAlertThreshold"
                        type="number"
                        min="0"
                        placeholder="10"
                        value={formData.stockAlertThreshold}
                        onChange={handleInputChange}
                        className={inputClass(errors.stockAlertThreshold)}
                      />
                    </Field>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2.5">
                    <svg
                      className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
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
                    <p className="text-xs text-amber-700">
                      Recibirás una alerta cuando el stock caiga por debajo del
                      umbral definido.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Estado (solo edición) ── */}
              {isEditMode && (
                <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      Estado del producto
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Los productos inactivos no aparecerán en ventas
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                    <span className="ml-3 text-sm font-medium text-neutral-700">
                      {formData.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </label>
                </div>
              )}
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        {!saveSuccess && (
          <div className="px-6 pb-6 pt-4 border-t border-neutral-100 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 active:bg-primary-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Guardando...
                </>
              ) : isEditMode ? (
                "Guardar Cambios"
              ) : (
                "Crear Producto"
              )}
            </button>
          </div>
        )}
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
