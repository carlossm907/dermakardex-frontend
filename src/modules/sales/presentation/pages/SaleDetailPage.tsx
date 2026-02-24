import { useNavigate, useParams } from "react-router-dom";
import { useSaleStore } from "../../application/stores/sale.store";
import { useEffect } from "react";
import { Card } from "@/shared/components/ui/Card";
import { SaleItemsTable } from "../components/SaleItemsTable";
import { SalePaymentsDisplay } from "../components/SalePaymentsDisplay";
import { SaleStatusBadge } from "../components/SaleStatusBadge";
import { Button } from "@/shared/components/ui/Button";
import { LoadingSpinner } from "@/modules/products/presentation/components/LoadingSpinner";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date + "T00:00:00"));

const formatTime = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

export const SaleDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedSale, isLoading, fetchSaleById, clearSelectedSale } =
    useSaleStore();

  useEffect(() => {
    if (id) {
      fetchSaleById(parseInt(id));
    }

    return () => {
      clearSelectedSale();
    };
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner message="Cargando detalle de venta..." />
      </div>
    );
  }

  if (!selectedSale) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center py-8">
            <svg
              className="w-16 h-16 text-neutral-300 mx-auto mb-4"
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
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Venta no encontrada
            </h2>
            <p className="text-neutral-600 mb-4">
              La venta que buscas no existe o fue eliminada.
            </p>
            <Button onClick={() => navigate("/sales")}>Volver a Ventas</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
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
                <h1 className="text-2xl font-bold">Detalle de Venta</h1>
                <p className="text-green-100 mt-1">
                  Ticket {selectedSale.ticketNumber}
                </p>
              </div>
            </div>

            <Button
              onClick={handlePrint}
              className="bg-white text-green-600 hover:bg-green-50"
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Ticket Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="print:shadow-none">
          {/* Header del ticket */}
          <div className="text-center border-b border-neutral-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              DermaKardex
            </h2>
            <p className="text-sm text-neutral-600">
              Sistema de Gestión Farmacéutica
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
              <span className="text-3xl font-bold text-green-700 font-mono">
                {selectedSale.ticketNumber}
              </span>
            </div>
          </div>

          {/* Info de la venta */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                Fecha
              </p>
              <p className="font-medium text-neutral-900">
                {formatDate(selectedSale.saleDate)}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                Hora
              </p>
              <p className="font-medium text-neutral-900">
                {formatTime(selectedSale.saleTime)}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                Cliente
              </p>
              <p className="font-medium text-neutral-900">
                {selectedSale.customerFullName}
              </p>
              <p className="text-sm text-neutral-500">
                DNI: {selectedSale.customerDni}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                Vendedor
              </p>
              <p className="font-medium text-neutral-900">
                {selectedSale.sellerFullName}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                Estado
              </p>
              <SaleStatusBadge status={selectedSale.status} />
            </div>

            {selectedSale.observation && (
              <div className="col-span-2">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                  Observaciones
                </p>
                <p className="text-sm text-neutral-700 italic">
                  {selectedSale.observation}
                </p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Productos
            </h3>
            <SaleItemsTable items={selectedSale.items} />
          </div>

          {/* Pagos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Pagos
            </h3>
            <SalePaymentsDisplay
              payments={selectedSale.payments}
              total={selectedSale.total}
            />
          </div>

          {/* Total destacado */}
          <div className="border-t-2 border-neutral-300 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold text-neutral-900">
                Total:
              </span>
              <span className="text-3xl font-bold text-green-700">
                {formatCurrency(selectedSale.total)}
              </span>
            </div>
          </div>

          {/* Footer del ticket */}
          <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
            <p className="text-sm text-neutral-500">¡Gracias por su compra!</p>
            <p className="text-xs text-neutral-400 mt-2">
              Este documento no tiene valor tributario
            </p>
          </div>
        </Card>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};
