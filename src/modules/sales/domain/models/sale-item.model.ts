import type { DiscountType } from "@/modules/products/domain/models/discount.type";
import type { ProductPresentation } from "@/modules/products/domain/models/product.model";

export interface SaleItem {
  productId: number;
  productName: string;
  presentation: ProductPresentation;
  quantity: number;
  baseUnitPrice: number;
  unitPrice: number;
  discountType: DiscountType;
  discountValue: number;
  lineTotal: number;
}

export interface CreateSaleItemData {
  productId: number;
  quantity: number;
}
