import { useEffect, useState } from "react";
import { useCatalogStore } from "../../application/stores/catalog.store";
import { useProductStore } from "../../application/stores/product.store";
import { useScheduledDiscountStore } from "../../application/stores/scheduled-discount.store";
import { DiscountType } from "../../domain/models/discount.type";
import {
  isCurrentlyActive,
  isExpired,
  isPending,
} from "../../domain/models/scheduled-discount.model";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ScheduledDiscountFormModal } from "../components/ScheduledDiscountFormModal";
import {
  CampaignProductsModal,
  groupIntoCampaigns,
  StatusChip,
  type DiscountCampaign,
} from "../components/CampaignProductsModal";

type TabType = "all" | "active" | "pending" | "expired";

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));

const discountLabel = (type: DiscountType, value: number) => {
  if (type === DiscountType.PERCENTAGE) return `${value}%`;
  if (type === DiscountType.AMOUNT) return `S/ ${value.toFixed(2)}`;
  return "—";
};

export const ScheduledDiscountsPage: React.FC = () => {
  const {
    discounts,
    isLoading,
    fetchAll,
    remove,
    cleanupExpired,
    expiredDiscounts,
  } = useScheduledDiscountStore();

  const { products, fetchProducts } = useProductStore();
  const { brands, fetchAll: fetchCatalogs } = useCatalogStore();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingDiscount] =
    useState<DiscountCampaign | null>(null);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<DiscountCampaign | null>(null);

  useEffect(() => {
    fetchAll();
    fetchProducts();
    fetchCatalogs();
  }, []);

  const getProductName = (productId: number) =>
    products.find((p) => p.id === productId)?.name ?? `Producto #${productId}`;

  const getBrandName = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return "";
    return brands.find((b) => b.id === product.brandId)?.name ?? "";
  };

  const expired = expiredDiscounts();

  const filteredDiscounts = discounts.filter((d) => {
    if (activeTab === "active") return isCurrentlyActive(d);
    if (activeTab === "pending") return isPending(d);
    if (activeTab === "expired") return isExpired(d);
    return true;
  });

  const campaigns = groupIntoCampaigns(filteredDiscounts);

  const handleDeleteCampaign = async (ids: number[]) => {
    if (!window.confirm("¿Eliminar esta campaña de descuentos?")) return;

    try {
      await Promise.all(ids.map((id) => remove(id)));
    } catch {
      /* handled in store */
    }
  };
  const handleCleanup = async () => {
    if (
      !window.confirm(
        `¿Deshabilitar los ${expired.length} descuentos vencidos?`,
      )
    )
      return;
    setCleaningUp(true);
    try {
      await cleanupExpired();
    } finally {
      setCleaningUp(false);
    }
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: discounts.length },
    {
      key: "active",
      label: "Activos ahora",
      count: discounts.filter(isCurrentlyActive).length,
    },
    {
      key: "pending",
      label: "Pendientes",
      count: discounts.filter(isPending).length,
    },
    { key: "expired", label: "Vencidos", count: expired.length },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Descuentos Programados
            </h1>
            <p className="text-neutral-600 mt-1">
              Administra descuentos con fechas de inicio y fin
            </p>
          </div>
          <div className="flex gap-3">
            {expired.length > 0 && (
              <Button
                variant="secondary"
                onClick={handleCleanup}
                isLoading={cleaningUp}
                className="flex items-center gap-2 text-amber-700 border-amber-300 hover:bg-amber-50"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Limpiar Vencidos ({expired.length})
              </Button>
            )}
            <Button
              onClick={() => {
                setEditingDiscount(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nuevo Descuento
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Activos ahora</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {
                    groupIntoCampaigns(discounts.filter(isCurrentlyActive))
                      .length
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Pendientes</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {groupIntoCampaigns(discounts.filter(isPending)).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-600"
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
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {groupIntoCampaigns(expired).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
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
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total campañas</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {groupIntoCampaigns(discounts).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
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
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white border border-neutral-200 rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Alert for expired */}
        {activeTab === "expired" && expired.length > 0 && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Tienes {expired.length} descuentos vencidos
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                Usa el botón "Limpiar Vencidos" para deshabilitarlos del
                sistema.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleCleanup}
              isLoading={cleaningUp}
              className="text-sm text-amber-700 border-amber-300 hover:bg-amber-100"
            >
              Limpiar ahora
            </Button>
          </div>
        )}

        {/* Campaigns table */}
        <Card>
          {isLoading ? (
            <LoadingSpinner message="Cargando descuentos programados..." />
          ) : campaigns.length === 0 ? (
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              title="No hay descuentos programados"
              description="Crea un nuevo descuento programado para uno o varios productos."
              actionLabel="Nuevo Descuento"
              onAction={() => {
                setEditingDiscount(null);
                setShowModal(true);
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                      Campaña
                    </th>
                    <th className="text-center p-4 text-sm font-semibold text-neutral-700">
                      Descuento
                    </th>
                    <th className="text-center p-4 text-sm font-semibold text-neutral-700">
                      Productos
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                      Inicio
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                      Fin
                    </th>
                    <th className="text-center p-4 text-sm font-semibold text-neutral-700">
                      Estado
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.key}
                      className={`border-b border-neutral-100 transition-colors cursor-pointer ${
                        isExpired(campaign.representative)
                          ? "bg-red-50/40 hover:bg-red-50"
                          : "hover:bg-neutral-50"
                      }`}
                      onClick={() => setSelectedCampaign(campaign)}
                      title="Click para ver productos"
                    >
                      <td className="p-4">
                        <span className="font-medium text-neutral-900">
                          {campaign.name}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {discountLabel(
                            campaign.discountType,
                            campaign.discountValue,
                          )}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <svg
                            className="w-3 h-3"
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
                          {campaign.items.length}{" "}
                          {campaign.items.length === 1
                            ? "producto"
                            : "productos"}
                        </span>
                      </td>

                      <td className="p-4 text-sm text-neutral-600">
                        {formatDate(campaign.startsAt)}
                      </td>
                      <td className="p-4 text-sm text-neutral-600">
                        {formatDate(campaign.endsAt)}
                      </td>

                      <td className="p-4 text-center">
                        <StatusChip discount={campaign.representative} />
                      </td>

                      <td
                        className="p-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            className="text-sm"
                            onClick={() => setSelectedCampaign(campaign)}
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </Button>
                          {!isExpired(campaign.representative) && (
                            <Button
                              variant="secondary"
                              className="text-sm"
                              onClick={() => {
                                setEditingDiscount(campaign);
                                setShowModal(true);
                              }}
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            className="text-sm text-red-600 hover:bg-red-50"
                            onClick={() =>
                              handleDeleteCampaign(
                                campaign.items.map((d) => d.id),
                              )
                            }
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Campaign products modal */}
      {selectedCampaign && (
        <CampaignProductsModal
          campaign={selectedCampaign}
          getProductName={getProductName}
          getBrandName={getBrandName}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {/* Create / edit form modal */}
      {showModal && (
        <ScheduledDiscountFormModal
          editingCampaign={editingCampaign}
          products={products}
          onClose={() => {
            setShowModal(false);
            setEditingDiscount(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingDiscount(null);
          }}
        />
      )}
    </div>
  );
};
