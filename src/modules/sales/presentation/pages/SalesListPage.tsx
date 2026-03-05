import { useNavigate } from "react-router-dom";
import { useSaleStore } from "../../application/stores/sale.store";
import { useEffect, useRef, useState } from "react";
import { SaleFilters } from "../components/SaleFilters";
import { LoadingSpinner } from "@/modules/products/presentation/components/LoadingSpinner";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/modules/products/presentation/components/EmptyState";
import { Button } from "@/shared/components/ui/Button";
import { useProductStore } from "@/modules/products/application/stores/product.store";
import type { CreateSalePaymentData } from "../../domain/models/sale-payment.model";
import { CartItem, type CartProduct } from "../components/CartItem";
import { dniLookupService } from "../../infrastructure/services/dni-lookup.service";
import { CustomerDniInput } from "../components/CustomerDniInput";
import { DiscountType } from "@/modules/products/domain/models/discount.type";
import { Input } from "@/shared/components/ui/Input";
import { SaleStatusBadge } from "../components/SaleStatusBadge";
import { PaymentForm } from "../components/PaymentForm";
import { productsApi } from "@/modules/products/infrastructure/api/products.api";
import { generateSaleTicketPdf } from "../../utils/generateSaleTicketPdf";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date + "T00:00:00"));

const formatTime = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

export const SaleListPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    sales,
    isLoading,
    fetchSales,
    fetchSalesByDay,
    fetchSalesByMonth,
    fetchSalesByCustomerDni,
    registerSale,
  } = useSaleStore();

  const { products, fetchProducts } = useProductStore();

  const [showModal, setShowModal] = useState(false);

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

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (showModal) {
      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 100);
    }
  }, [showModal]);

  const today = new Date().toLocaleDateString("sv-SE");

  const stats = {
    total: sales.length,
    totalAmount: sales.reduce((sum, sale) => sum + sale.total, 0),
    todaySales: sales.filter((sale) => sale.saleDate === today).length,
  };

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
      if (existingItem.quantity >= product.stock) return;
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

      setCustomerDni("");
      setCustomerFullName(null);
      setObservation("");
      setCart([]);
      setPayments([]);
      setSearchTerm("");
      setErrors({});
      setShowModal(false);

      setCustomerDni("");
      setCustomerFullName(null);
      setObservation("");
      setCart([]);
      setPayments([]);
      setSearchTerm("");
      setErrors({});
      setShowModal(false);

      navigate(`/sales/${sale.id}`);
    } catch (error) {
      console.error("Error al registrar venta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCustomerDni("");
    setCustomerFullName(null);
    setObservation("");
    setCart([]);
    setPayments([]);
    setSearchTerm("");
    setErrors({});
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Listado de Ventas
            </h1>
            <p className="text-neutral-600 mt-1">
              Administra las ventas registradas
            </p>
          </div>
          <Button onClick={handleOpenModal} className="flex items-center gap-2">
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Ventas</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {stats.total}
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Monto Total</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {formatCurrency(stats.totalAmount)}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Ventas Hoy</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">
                {stats.todaySales}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <SaleFilters
        onFilterAll={fetchSales}
        onFilterByDay={fetchSalesByDay}
        onFilterByMonth={fetchSalesByMonth}
        onFilterByCustomer={fetchSalesByCustomerDni}
        isLoading={isLoading}
      />

      {/* Tabla de ventas */}
      <div className="mt-6">
        <Card>
          {isLoading ? (
            <LoadingSpinner message="Cargando ventas..." />
          ) : sales.length === 0 ? (
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
              title="No hay ventas registradas"
              description="Comienza registrando tu primera venta."
              actionLabel="Nueva Venta"
              onAction={handleOpenModal}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                      Ticket
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                      Cliente
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                      Fecha
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                      Hora
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                      Total
                    </th>
                    <th className="text-center p-4 text-sm font-semibold text-neutral-700">
                      Estado
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                      Acciones
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                      Vendido por
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono font-semibold text-neutral-900">
                          {sale.ticketNumber}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="text-sm text-neutral-900">
                          {sale.customerFullName}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="text-sm text-neutral-600">
                          {formatDate(sale.saleDate)}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="text-sm text-neutral-600">
                          {formatTime(sale.saleTime)}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <span className="font-semibold text-green-700">
                          {formatCurrency(sale.total)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <SaleStatusBadge status={sale.status} />
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="secondary"
                          className="text-sm"
                          onClick={() => navigate(`/sales/${sale.id}`)}
                        >
                          Ver Detalle
                        </Button>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-neutral-600">
                          {sale.sellerFullName}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de Nueva Venta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-neutral-900">
                Nueva Venta
              </h2>
              <button
                onClick={handleCloseModal}
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

            {/* Contenido del modal */}
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
                                    {product.presentation} · Stock:{" "}
                                    {product.stock}
                                  </p>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="font-semibold text-green-700">
                                    {formatCurrency(product.finalPrice)}
                                  </p>
                                  {product.discountType !==
                                    DiscountType.NONE && (
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

            {/* Footer del modal */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleCloseModal}
              >
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
        </div>
      )}
    </div>
  );
};
