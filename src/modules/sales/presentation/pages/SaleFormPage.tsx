import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSaleStore } from "../../application/stores/sale.store";
import { useProductStore } from "@/modules/products/application/stores/product.store";
import { CartItem, type CartProduct } from "../components/CartItem";
import type { CreateSalePaymentData } from "../../domain/models/sale-payment.model";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { PaymentForm } from "../components/PaymentForm";
import { CustomerDniInput } from "../components/CustomerDniInput";
import { Input } from "@/shared/components/ui/Input";
import { DiscountType } from "@/modules/products/domain/models/discount.type";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

export const SaleFormPage: React.FC = () => {
  const navigate = useNavigate();

  const { registerSale, isLoading } = useSaleStore();
  const { products, fetchProducts } = useProductStore();

  const [customerDni, setCustomerDni] = useState("");
  const [customerFullName, setCustomerFullName] = useState<string | null>(null);
  const [observation, setObservation] = useState("");
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [payments, setPayments] = useState<CreateSalePaymentData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = searchTerm.trim()
    ? products.filter(
        (p) =>
          p.isActive &&
          p.stock > 0 &&
          p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const cartTotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = cart.find((item) => item.productId === productId);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        return;
      }
      handleIncrementQuantity(productId);
    } else {
      const newItem: CartProduct = {
        productId: product.id,
        productName: product.name,
        presentation: product.presentation,
        quantity: 1,
        baseUnitPrice: product.salePrice,
        unitPrice: product.finalPrice,
        discountType: product.discountType,
        discountValue: product.discountValue,
        availableStock: product.stock,
        lineTotal: product.finalPrice,
      };
      setCart([...cart, newItem]);
    }

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

  const validateState = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerDni || customerDni.length !== 8) {
      newErrors.customerDni = "Ingresa un numero de dni valido de 8 digitos";
    }

    if (cart.length === 0) {
      newErrors.cart = "Agrega al menos un producto al carrito";
    }

    if (payments.length === 0) {
      newErrors.payments = "Agrega al menos un metodo de pago";
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
    if (!validateState()) return;

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
      navigate(`/sales/${sale.id}`);
    } catch (error) {
      console.error("Error al registrar venta: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/sales")}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold">Punto de Venta</h1>
              <p className="text-green-100 mt-1">Registra una nueva venta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Layout de dos columnas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Búsqueda de productos */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Buscar Productos
              </h2>

              <Input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <div className="mt-4 max-h-96 overflow-y-auto space-y-2">
                  {filteredProducts.length === 0 ? (
                    <p className="text-sm text-neutral-500 text-center py-4">
                      No se encontraron productos
                    </p>
                  ) : (
                    filteredProducts.slice(0, 10).map((product) => (
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
                              {product.presentation} · Stock: {product.stock}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-green-700">
                              {formatCurrency(product.finalPrice)}
                            </p>
                            {product.discountType !== DiscountType.NONE && (
                              <p className="text-xs text-neutral-400 line-through">
                                {formatCurrency(product.salePrice)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Datos del Cliente
              </h2>

              <CustomerDniInput
                value={customerDni}
                customerFullName={customerFullName}
                onChange={setCustomerDni}
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

          {/* Columna derecha: Carrito y pago */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Carrito ({cart.length})
                </h2>
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
                <div className="space-y-2 max-h-96 overflow-y-auto">
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
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Pago
                </h2>

                <PaymentForm
                  total={cartTotal}
                  payments={payments}
                  onChange={setPayments}
                />

                {errors.payments && (
                  <p className="mt-2 text-sm text-red-600">{errors.payments}</p>
                )}
              </Card>
            )}

            {cart.length > 0 && (
              <Button
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={payments.length === 0}
                className="w-full"
              >
                Registrar Venta
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
