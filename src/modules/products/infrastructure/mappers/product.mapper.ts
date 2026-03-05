import type { Product } from "../../domain/models/product.model";
import type { ProductResponse } from "../api/products.api";

export const productMapper = {
  toDomain: (response: ProductResponse): Product => ({
    id: response.id,
    code: response.code,
    name: response.name,
    brandId: response.brandId,
    categoryId: response.categoryId,
    laboratoryId: response.laboratoryId,
    supplierId: response.supplierId,
    presentation: response.presentation,
    purchasePrice: response.purchasePrice,
    salePrice: response.salePrice,
    finalPrice: response.finalPrice,
    maxDiscountAmount: response.maxDiscountAmount,
    discountType: response.discountType,
    discountValue: response.discountValue,
    stock: response.stock,
    stockAlertThreshold: response.stockAlertThreshold,
    isActive: response.isActive,
  }),

  toDomainList: (responses: ProductResponse[]): Product[] => {
    return responses.map(productMapper.toDomain);
  },
};
