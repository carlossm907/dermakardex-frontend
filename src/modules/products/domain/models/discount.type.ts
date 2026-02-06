export enum DiscountType {
  NONE = "NONE",
  AMOUNT = "AMOUNT",
  PERCENTAGE = "PERCENTAGE",
}

export interface Discount {
  type: DiscountType;
  value: number;
}

export const createNoDiscount = (): Discount => ({
  type: DiscountType.NONE,
  value: 0,
});

export const createAmountDiscount = (value: number): Discount => ({
  type: DiscountType.AMOUNT,
  value,
});

export const createPercentageAmount = (value: number): Discount => ({
  type: DiscountType.PERCENTAGE,
  value,
});
