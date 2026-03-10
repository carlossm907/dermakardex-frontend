import type { ScheduledDiscount } from "../../domain/models/scheduled-discount.model";
import type { ScheduledDiscountResponse } from "../api/products.api";

export const scheduledDiscountMapper = {
  toDomain: (response: ScheduledDiscountResponse): ScheduledDiscount => ({
    id: response.id,
    productId: response.productId,
    name: response.name,
    discountType: response.discountType,
    discountValue: response.discountValue,
    startsAt: response.startsAt,
    endsAt: response.endsAt,
    isActive: response.isActive,
  }),

  toDomainList: (responses: ScheduledDiscountResponse[]) =>
    responses.map(scheduledDiscountMapper.toDomain),
};
