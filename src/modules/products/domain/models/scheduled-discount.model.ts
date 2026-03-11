import type { DiscountType } from "./discount.type";

export interface ScheduledDiscount {
  id: number;
  productId: number;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface CreateScheduledDiscountData {
  productId: number;
  name: string;
  type: DiscountType;
  value: number;
  startsAt: string;
  endsAt: string;
}

export interface CreateScheduledDiscountToProductsData {
  productIds: number[];
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
}

export interface CreateScheduledDiscountToAllData {
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
}

export interface UpdateScheduledDiscountData {
  name: string;
  type: DiscountType;
  value: number;
  startsAt: string;
  endsAt: string;
}

export const isExpired = (discount: ScheduledDiscount): boolean => {
  return new Date(discount.endsAt) < new Date();
};

export const isCurrentlyActive = (discount: ScheduledDiscount): boolean => {
  const now = new Date();
  return (
    discount.isActive &&
    new Date(discount.startsAt) <= now &&
    new Date(discount.endsAt) > now
  );
};

export const isPending = (discount: ScheduledDiscount): boolean => {
  return discount.isActive && new Date(discount.startsAt) > new Date();
};
