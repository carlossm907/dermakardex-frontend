/* eslint-disable react-refresh/only-export-components */
import { useEffect } from "react";
import { DiscountType } from "../../domain/models/discount.type";
import {
  isCurrentlyActive,
  isExpired,
  isPending,
  type ScheduledDiscount,
} from "../../domain/models/scheduled-discount.model";

export interface DiscountCampaign {
  key: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  representative: ScheduledDiscount;
  items: ScheduledDiscount[];
}

export const groupIntoCampaigns = (
  discounts: ScheduledDiscount[],
): DiscountCampaign[] => {
  const map = new Map<string, DiscountCampaign>();
  for (const d of discounts) {
    const key = `${d.name}__${d.startsAt}__${d.endsAt}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        name: d.name,
        discountType: d.discountType,
        discountValue: d.discountValue,
        startsAt: d.startsAt,
        endsAt: d.endsAt,
        representative: d,
        items: [],
      });
    }
    map.get(key)!.items.push(d);
  }
  return Array.from(map.values());
};

export const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));

export const discountLabel = (type: DiscountType, value: number): string => {
  if (type === DiscountType.PERCENTAGE) return `${value}%`;
  if (type === DiscountType.AMOUNT) return `S/ ${value.toFixed(2)}`;
  return "—";
};

export const StatusChip: React.FC<{ discount: ScheduledDiscount }> = ({
  discount,
}) => {
  if (!discount.isActive)
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
        Desactivado
      </span>
    );
  if (isExpired(discount))
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Vencido
      </span>
    );
  if (isCurrentlyActive(discount))
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Activo ahora
      </span>
    );
  if (isPending(discount))
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        Pendiente
      </span>
    );
  return null;
};

interface CampaignProductsModalProps {
  campaign: DiscountCampaign;
  getProductName: (id: number) => string;
  getBrandName: (id: number) => string;
  onClose: () => void;
}

export const CampaignProductsModal: React.FC<CampaignProductsModalProps> = ({
  campaign,
  getProductName,
  getBrandName,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
          <div className="flex-1 pr-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 mb-1">
              Campaña de Descuento
            </p>
            <h2 className="text-xl font-bold text-neutral-900 leading-tight">
              {campaign.name}
            </h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {discountLabel(campaign.discountType, campaign.discountValue)}
              </span>
              <StatusChip discount={campaign.representative} />
              <span className="text-xs text-neutral-400">
                {formatDate(campaign.startsAt)} → {formatDate(campaign.endsAt)}
              </span>
            </div>
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
          <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Productos implicados ({campaign.items.length})
          </h3>

          <div className="space-y-2">
            {campaign.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 bg-neutral-50 border border-neutral-100 rounded-xl hover:border-neutral-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {getProductName(item.productId)}
                  </p>
                  {getBrandName(item.productId) && (
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {getBrandName(item.productId)}
                    </p>
                  )}
                </div>
                <span className="text-xs text-neutral-400 shrink-0">
                  ID #{item.productId}
                </span>
              </div>
            ))}
          </div>
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
