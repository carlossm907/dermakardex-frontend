import { DiscountType } from "@/modules/products/domain/models/discount.type";
import type { SaleItem } from "../../domain/models/sale-item.model";
import type { SaleItemResponse } from "../api/sales.api";
import type { ProductPresentation } from "@/modules/products/domain/models/product.model";

export const saleItemMapper = {
  toDomain: (response: SaleItemResponse): SaleItem => {
    let discountType: DiscountType;
    const upperType = response.discountType.toUpperCase();

    if (upperType === "NONE") {
      discountType = DiscountType.NONE;
    } else if (upperType === "PERCENTAGE") {
      discountType = DiscountType.PERCENTAGE;
    } else if (upperType === "AMOUNT") {
      discountType = DiscountType.AMOUNT;
    } else {
      discountType = DiscountType.NONE;
    }

    return {
      productId: response.productId,
      productName: response.productName,
      presentation: response.presentation as ProductPresentation,
      quantity: response.quantity,
      baseUnitPrice: response.baseUnitPrice,
      unitPrice: response.unitPrice,
      discountType,
      discountValue: response.discountValue,
      lineTotal: response.lineTotal,
    };
  },

  toDomainList: (responses: SaleItemResponse[]): SaleItem[] => {
    return responses.map(saleItemMapper.toDomain);
  },
};
