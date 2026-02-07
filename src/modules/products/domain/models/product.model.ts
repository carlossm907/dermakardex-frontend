import type { DiscountType } from "./discount.type";

export interface Product {
  id: number;
  name: string;
  brandId: number;
  categoryId: number;
  laboratoryId: number;
  supplierId: number;
  presentation: ProductPresentation;
  purchasePrice: number;
  salePrice: number;
  finalPrice: number;
  maxDiscountAmount: number;
  discountType: DiscountType;
  discountValue: number;
  stock: number;
  isActive: boolean;
}

export interface CreateProductData {
  name: string;
  brandId: number;
  laboratoryId: number;
  categoryId: number;
  supplierId: number;
  presentation: ProductPresentation;
  purchasePrice: number;
  salePrice: number;
  maxDiscountAmount: number;
  stockAlertThreshold: number;
  isActive: boolean;
}

export interface ApplyDiscountData {
  type: DiscountType;
  value: number;
}

export enum ProductPresentation {
  UNITS = "UNITS",
  HALFDOZEN = "HALFDOZEN",
  DOZEN = "DOZEN",
}
