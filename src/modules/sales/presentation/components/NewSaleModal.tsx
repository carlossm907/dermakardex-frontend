import { useNavigate } from "react-router-dom";
import { useSaleStore } from "../../application/stores/sale.store";
import { useProductStore } from "@/modules/products/application/stores/product.store";
import { useScheduledDiscountStore } from "@/modules/products/application/stores/scheduled-discount.store";
import { useRef, useState } from "react";
import type { CreateSalePaymentData } from "../../domain/models/sale-payment.model";
import { CartItem, type CartProduct } from "./CartItem";
import { DiscountType } from "@/modules/products/domain/models/discount.type";
import { dniLookupService } from "../../infrastructure/services/dni-lookup.service";
import { productsApi } from "@/modules/products/infrastructure/api/products.api";
import { generateSaleTicketPdf } from "../../utils/generateSaleTicketPdf";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { PaymentForm } from "./PaymentForm";
import { CustomerDniInput } from "./CustomerDniInput";
import { Input } from "@/shared/components/ui/Input";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

interface NewSaleModalProps {
  onClose: () => void;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { registerSale } = useSaleStore();
  const { products } = useProductStore();
  const { discounts } = useScheduledDiscountStore();

  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcode, setBarcode] = useState("");

  const [customerDni, setCustomerDni] = useState("");
  const [customerFullName, setCustomerFullName] = useState<string | null>(null);
  const [observation, setObservation] = useState("");
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [payments, setPayments] = useState<CreateSalePaymentData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  const filteredProducts = searchTerm.trim()
    ? products.filter(
        (p) =>
          p.isActive &&
          p.stock > 0 &&
          p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

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

  const applyDiscount = (
    basePrice: number,
    type: DiscountType,
    value: number,
  ) => {
    if (type === DiscountType.PERCENTAGE) return basePrice * (1 - value / 100);
    if (type === DiscountType.AMOUNT) return Math.max(basePrice - value, 0);
    return basePrice;
  };

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = cart.find((item) => item.productId === productId);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) return;
      handleIncrementQuantity(productId);
      return;
    }

    const scheduled = getActiveScheduledDiscount(product.id);

    let discountType: DiscountType;
    let discountValue: number;
    let unitPrice: number;

    if (scheduled) {
      discountType = scheduled.discountType;
      discountValue = scheduled.discountValue;
      unitPrice = applyDiscount(product.salePrice, discountType, discountValue);
    } else if (product.discountType !== DiscountType.NONE) {
      discountType = product.discountType;
      discountValue = product.discountValue;
      unitPrice = applyDiscount(product.salePrice, discountType, discountValue);
    } else {
      discountType = DiscountType.NONE;
      discountValue = 0;
      unitPrice = product.salePrice;
    }

    const newItem: CartProduct = {
      productId: product.id,
      productName: product.name,
      presentation: product.presentation,
      quantity: 1,
      baseUnitPrice: product.salePrice,
      unitPrice,
      discountType,
      discountValue,
      availableStock: product.stock,
      lineTotal: unitPrice,
    };

    setCart([...cart, newItem]);
    setSearchTerm("");
  };

  const handleIncrementQuantity = (productId: number) => {
    setCart(
      cart.map((item) => {
        if (
          item.productId === productId &&
          item.quantity < item.availableStock
        ) {
          const newQuantity = item.quantity + 1;
          return {
            ...item,
            quantity: newQuantity,
            lineTotal: item.unitPrice * newQuantity,
          };
        }
        return item;
      }),
    );
  };

  const handleDecrementQuantity = (productId: number) => {
    setCart(
      cart.map((item) => {
        if (item.productId === productId && item.quantity > 1) {
          const newQuantity = item.quantity - 1;
          return {
            ...item,
            quantity: newQuantity,
            lineTotal: item.unitPrice * newQuantity,
          };
        }
        return item;
      }),
    );
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const handleDniChange = async (dni: string) => {
    setCustomerDni(dni);
    if (dni.length === 8) {
      const result = await dniLookupService.lookupDni(dni);
      if (result.success && result.fullName) {
        setCustomerFullName(result.fullName);
      } else {
        setCustomerFullName(null);
      }
    } else {
      setCustomerFullName(null);
    }
  };

  const handleBarcodeScan = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      try {
        const product = await productsApi.getProductByCode(barcode);
        handleAddToCart(product.id);
        setBarcode("");
        barcodeRef.current?.focus();
      } catch {
        alert("Producto no encontrado");
        setBarcode("");
        barcodeRef.current?.focus();
      }
    }
  };

  const validateSale = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerDni || customerDni.length !== 8) {
      newErrors.customerDni = "Ingresa un DNI válido de 8 dígitos";
    }
    if (cart.length === 0) {
      newErrors.cart = "Agrega al menos un producto al carrito";
    }
    if (payments.length === 0) {
      newErrors.payments = "Configura al menos un método de pago";
    } else {
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(totalPaid - cartTotal) > 0.01) {
        newErrors.payments = "El monto pagado debe ser igual al total";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateSale()) return;

    setIsSubmitting(true);
    try {
      const sale = await registerSale({
        customerDni,
        observation: observation.trim(),
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        payments,
      });

      generateSaleTicketPdf(sale);
      onClose();
      navigate(`/sales/${sale.id}`);
    } catch (error) {
      console.error("Error al registrar venta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="bg-white rounded-xl shadow-xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-neutral-900">Nueva Venta</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
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

        {/* Contenido */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Agregar Productos
                </h3>
                <div className="space-y-3">
                  <Input
                    ref={barcodeRef}
                    type="text"
                    placeholder="Escanea código de barras..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={handleBarcodeScan}
                  />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm && (
                  <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                    {filteredProducts.length === 0 ? (
                      <p className="text-sm text-neutral-500 text-center py-4">
                        No se encontraron productos
                      </p>
                    ) : (
                      filteredProducts.slice(0, 10).map((product) => {
                        const scheduled = getActiveScheduledDiscount(
                          product.id,
                        );

                        let finalPrice = product.salePrice;
                        let hasDiscount = false;

                        if (scheduled) {
                          finalPrice = applyDiscount(
                            product.salePrice,
                            scheduled.discountType,
                            scheduled.discountValue,
                          );
                          hasDiscount = true;
                        } else if (product.discountType !== DiscountType.NONE) {
                          finalPrice = product.finalPrice;
                          hasDiscount = true;
                        }

                        return (
                          <button
                            key={product.id}
                            onClick={() => handleAddToCart(product.id)}
                            className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-neutral-900 truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                  {product.presentation} · Stock:{" "}
                                  {product.stock}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="font-semibold text-green-700">
                                  {formatCurrency(finalPrice)}
                                </p>
                                {hasDiscount && (
                                  <p className="text-xs text-neutral-400 line-through">
                                    {formatCurrency(product.salePrice)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Datos del Cliente
                </h3>
                <CustomerDniInput
                  value={customerDni}
                  customerFullName={customerFullName}
                  onChange={handleDniChange}
                  onCustomerResolved={setCustomerFullName}
                  onCustomerCleared={() => setCustomerFullName(null)}
                  error={errors.customerDni}
                />
                <div className="mt-4">
                  <label className="label">Observaciones (Opcional)</label>
                  <textarea
                    rows={3}
                    placeholder="Ej: Cliente frecuente, entrega a domicilio..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    className="input"
                  />
                </div>
              </Card>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Carrito ({cart.length})
                  </h3>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Vaciar
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="w-16 h-16 text-neutral-300 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-sm text-neutral-500">
                      El carrito está vacío
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <CartItem
                        key={item.productId}
                        item={item}
                        onIncrement={handleIncrementQuantity}
                        onDecrement={handleDecrementQuantity}
                        onRemove={handleRemoveFromCart}
                      />
                    ))}
                  </div>
                )}

                {errors.cart && (
                  <p className="mt-2 text-sm text-red-600">{errors.cart}</p>
                )}

                {cart.length > 0 && (
                  <div className="mt-4 pt-4 border-t-2 border-neutral-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-neutral-900">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-green-700">
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              {cart.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Pago
                  </h3>
                  <PaymentForm
                    total={cartTotal}
                    payments={payments}
                    onChange={setPayments}
                  />
                  {errors.payments && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.payments}
                    </p>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={cart.length === 0 || payments.length === 0}
          >
            Registrar Venta
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
