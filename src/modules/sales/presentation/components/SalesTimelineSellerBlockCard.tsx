import type { SaleTimelineSellerBlock } from "../../domain/models/sales-timeline.model";
import { SalesTimelineSaleCard } from "./SalesTimelineSaleCard";

interface SalesTimelineSellerBlockProps {
  block: SaleTimelineSellerBlock;
  index: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

const SELLER_COLORS = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-teal-600",
  "bg-rose-600",
  "bg-orange-600",
  "bg-cyan-600",
];

export const SalesTimelineSellerBlockCard: React.FC<
  SalesTimelineSellerBlockProps
> = ({ block, index }) => {
  const avatarColor = SELLER_COLORS[index % SELLER_COLORS.length];
  const initials = block.sellerFullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const blockTotal = block.sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-2">
      {/* Seller header */}
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
        >
          {initials}
        </div>
        <span className="text-sm font-semibold text-neutral-700">
          {block.sellerFullName}
        </span>
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-xs text-neutral-500 shrink-0">
          {block.sales.length} venta{block.sales.length !== 1 ? "s" : ""}
        </span>
        <span className="text-xs font-semibold text-neutral-700 tabular-nums shrink-0">
          {formatCurrency(blockTotal)}
        </span>
      </div>

      {/* Sales in this block */}
      <div className="ml-9 space-y-2">
        {block.sales.map((sale) => (
          <SalesTimelineSaleCard key={sale.saleId} sale={sale} />
        ))}
      </div>
    </div>
  );
};
