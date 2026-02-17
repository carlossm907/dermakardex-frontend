export enum DiscountType {
  NONE = 0,
  AMOUNT = 1,
  PERCENTAGE = 2,
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
