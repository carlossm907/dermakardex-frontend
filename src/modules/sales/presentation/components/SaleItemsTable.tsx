import { DiscountType } from "@/modules/products/domain/models/discount.type";
import type { SaleItem } from "../../domain/models/sale-item.model";

interface SaleItemsTableProps {
  items: SaleItem[];
  className?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

export const SaleItemsTable: React.FC<SaleItemsTableProps> = ({
  items,
  className = "",
}) => {
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            <th className="text-left p-3 font-semibold text-neutral-700">
              Producto
            </th>
            <th className="text-center p-3 font-semibold text-neutral-700">
              Cantidad
            </th>
            <th className="text-right p-3 font-semibold text-neutral-700">
              P. Base
            </th>
            <th className="text-center p-3 font-semibold text-neutral-700">
              Descuento
            </th>
            <th className="text-right p-3 font-semibold text-neutral-700">
              P. Unit.
            </th>
            <th className="text-right p-3 font-semibold text-neutral-700">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const hasDiscount = item.discountType !== DiscountType.NONE;
            return (
              <tr
                key={index}
                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                <td className="p-3">
                  <div className="font-medium text-neutral-900">
                    {item.productName}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {item.presentation}
                  </div>
                </td>
                <td className="p-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 font-semibold text-neutral-700">
                    {item.quantity}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {hasDiscount ? (
                    <span className="line-through text-neutral-400">
                      {formatCurrency(item.baseUnitPrice)}
                    </span>
                  ) : (
                    <span className="text-neutral-700">
                      {formatCurrency(item.baseUnitPrice)}
                    </span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {hasDiscount ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      {item.discountType === DiscountType.PERCENTAGE
                        ? `${item.discountValue}% OFF`
                        : `-S/ ${item.discountValue.toFixed(2)}`}
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-xs">—</span>
                  )}
                </td>
                <td className="p-3 text-right font-medium text-neutral-900">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="p-3 text-right font-semibold text-green-700">
                  {formatCurrency(item.lineTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-neutral-300 bg-neutral-50">
            <td
              colSpan={5}
              className="p-3 text-right font-semibold text-neutral-700"
            >
              Total:
            </td>
            <td className="p-3 text-right text-lg font-bold text-green-700">
              {formatCurrency(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
