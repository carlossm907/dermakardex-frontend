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
  stockAlertThreshold: number;
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
  initialStock: number;
  stockAlertThreshold: number;
  isActive: boolean;
}

export interface UpdateProductData {
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
  Units = "Units",
  Halfdozen = "Halfdozen",
  Dozen = "Dozen",
}

export enum StockStatus {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  OK = "OK",
}

export const getStockStatus = (
  stock: number,
  threshold: number,
): StockStatus => {
  const ratio = stock / threshold;

  if (ratio <= 0.25) return StockStatus.LOW;
  if (ratio <= 0.5) return StockStatus.MEDIUM;
  return StockStatus.OK;
};
