import { DiscountType } from "@/modules/products/domain/models/discount.type";

export interface CartProduct {
  productId: number;
  productName: string;
  presentation: string;
  quantity: number;
  baseUnitPrice: number;
  unitPrice: number;
  discountType: DiscountType;
  discountValue: number;
  availableStock: number;
  lineTotal: number;
}

interface CardItemProps {
  item: CartProduct;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  onRemove: (productId: number) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

export const CartItem: React.FC<CardItemProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const hasDiscount = item.discountType !== DiscountType.NONE;

  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors">
      {/* Info del producto */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 text-sm truncate">
          {item.productName}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">{item.presentation}</p>

        {/* Precio con descuento */}
        <div className="flex items-center gap-2 mt-1">
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              {formatCurrency(item.baseUnitPrice)}
            </span>
          )}
          <span className="text-sm font-semibold text-green-700">
            {formatCurrency(item.unitPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">
              {item.discountType === DiscountType.PERCENTAGE
                ? `${item.discountValue}%`
                : `-S/${item.discountValue}`}
            </span>
          )}
        </div>

        {/* Stock disponible */}
        {item.availableStock <= 10 && (
          <p className="text-xs text-amber-600 mt-1">
            Solo {item.availableStock} en stock
          </p>
        )}
      </div>

      {/* Controles de cantidad */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDecrement(item.productId)}
            className="w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M20 12H4"
              />
            </svg>
          </button>
          <span className="w-8 text-center font-bold text-sm">
            {item.quantity}
          </span>
          <button
            onClick={() => onIncrement(item.productId)}
            disabled={item.quantity >= item.availableStock}
            className="w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Subtotal */}
        <span className="text-sm font-bold text-neutral-900">
          {formatCurrency(item.lineTotal)}
        </span>

        {/* Eliminar */}
        <button
          onClick={() => onRemove(item.productId)}
          className="text-neutral-300 hover:text-red-500 transition-colors"
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
        </button>
      </div>
    </div>
  );
};
