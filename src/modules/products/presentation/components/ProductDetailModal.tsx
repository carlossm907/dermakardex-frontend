/* eslint-disable react-hooks/static-components */
import { useEffect } from "react";
import { DiscountType } from "../../domain/models/discount.type";
import {
  getStockStatus,
  ProductPresentation,
  type Product,
} from "../../domain/models/product.model";
import { PriceDisplay } from "./PriceDisplay";
import { StockBadge } from "./StockBadge";
import { StatusBadge } from "./StatusBadge";

interface ProductDetailModalProps {
  product: Product | null;
  brands: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string }>;
  laboratories: Array<{ id: number; name: string }>;
  suppliers: Array<{ id: number; name: string }>;
  onClose: () => void;
}

const presentationLabels: Record<ProductPresentation, string> = {
  [ProductPresentation.Units]: "Unidades",
  [ProductPresentation.Halfdozen]: "Media Docena",
  [ProductPresentation.Dozen]: "Docena",
};

const discountTypeLabels: Record<number, string> = {
  [DiscountType.NONE]: "Sin descuento",
  [DiscountType.AMOUNT]: "Monto fijo",
  [DiscountType.PERCENTAGE]: "Porcentaje",
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  brands,
  categories,
  laboratories,
  suppliers,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const brandName = brands.find((b) => b.id === product.brandId)?.name ?? "N/A";
  const categoryName =
    categories.find((c) => c.id === product.categoryId)?.name ?? "N/A";
  const laboratoryName =
    laboratories.find((l) => l.id === product.laboratoryId)?.name ?? "N/A";
  const supplierName =
    suppliers.find((s) => s.id === product.supplierId)?.name ?? "N/A";
  const stockStatus = getStockStatus(
    product.stock,
    product.stockAlertThreshold,
  );
  const hasDiscount = product.discountType !== DiscountType.NONE;

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="mb-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3 border-b border-neutral-100 pb-1">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  );

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div>
      <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
      <div className="text-sm font-medium text-neutral-800">{children}</div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
          <div className="flex-1 pr-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 mb-1">
              Detalle de Producto
            </p>
            <h2 className="text-xl font-bold text-neutral-900 leading-tight">
              {product.name}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">ID #{product.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex-shrink-0"
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

        {/* Body */}
        <div className="px-6 py-5">
          {/* Estado y Stock (destacados) */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 rounded-xl bg-neutral-50 p-4 text-center">
              <p className="text-sm text-neutral-400 mb-1.5">Estado</p>
              <StatusBadge className="!text-sm" isActive={product.isActive} />
            </div>
            <div className="flex-1 rounded-xl bg-neutral-50 p-4 text-center">
              <p className="text-sm text-neutral-400 mb-1.5">Stock</p>
              <StockBadge
                className="!text-sm"
                stock={product.stock}
                status={stockStatus}
              />
            </div>
            <div className="flex-1 rounded-xl bg-neutral-50 p-4 text-center">
              <p className="text-sm text-neutral-400 mb-1.5">Alerta stock</p>
              <span className="text-sm font-semibold text-neutral-700">
                {product.stockAlertThreshold}
              </span>
            </div>
          </div>

          <Section title="Identificación">
            <Field label="Marca">{brandName}</Field>
            <Field label="Categoría">{categoryName}</Field>
            <Field label="Laboratorio">{laboratoryName}</Field>
            <Field label="Proveedor">{supplierName}</Field>
            <Field label="Presentación">
              {presentationLabels[product.presentation] ?? product.presentation}
            </Field>
          </Section>

          <Section title="Precios">
            <Field label="Precio de Compra">
              <PriceDisplay price={product.purchasePrice} />
            </Field>
            <Field label="Precio de Venta">
              <PriceDisplay price={product.salePrice} />
            </Field>
            <Field label="Precio Final">
              <PriceDisplay
                price={product.finalPrice}
                originalPrice={product.salePrice}
                showDiscount={hasDiscount}
              />
            </Field>
            <Field label="Descuento Máximo">
              <PriceDisplay price={product.maxDiscountAmount} />
            </Field>
          </Section>

          {hasDiscount && (
            <Section title="Descuento Aplicado">
              <Field label="Tipo">
                {discountTypeLabels[product.discountType] ?? "—"}
              </Field>

              <Field label="Valor">
                {product.discountType === DiscountType.PERCENTAGE ? (
                  `${product.discountValue}%`
                ) : (
                  <PriceDisplay price={product.discountValue} />
                )}
              </Field>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Cerrar
          </button>
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
