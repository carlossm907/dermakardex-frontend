import type {
  SalesTimelineByDay,
  SaleTimelineItem,
  SaleTimelinePayment,
  SaleTimelineProduct,
  SaleTimelineSellerBlock,
} from "../../domain/models/sales-timeline.model";
import type {
  SalesTimelineByDayResponse,
  SaleTimelineItemResponse,
  SaleTimelinePaymentResponse,
  SaleTimelineProductResponse,
  SaleTimelineSellerBlockResponse,
} from "../api/sales.api";

export const salesTimelineMapper = {
  toDomainList(responses: SalesTimelineByDayResponse[]): SalesTimelineByDay[] {
    return responses.map(salesTimelineMapper.toDomain);
  },

  toDomain(response: SalesTimelineByDayResponse): SalesTimelineByDay {
    return {
      date: response.date,
      blocks: response.blocks.map(salesTimelineMapper.blockToDomain),
    };
  },

  blockToDomain(
    response: SaleTimelineSellerBlockResponse,
  ): SaleTimelineSellerBlock {
    return {
      sellerUserId: response.sellerUserId,
      sellerFullName: response.sellerFullName,
      sales: response.sales.map(salesTimelineMapper.saleToDomain),
    };
  },

  saleToDomain(response: SaleTimelineItemResponse): SaleTimelineItem {
    return {
      saleId: response.saleId,
      ticketNumber: response.ticketNumber,
      customerFullName: response.customerFullName,
      saleDate: response.saleDate,
      saleTime: response.saleTime,
      total: response.total,
      items: response.items.map(salesTimelineMapper.productToDomain),
      payments: response.payments.map(salesTimelineMapper.paymentToDomain),
    };
  },

  productToDomain(response: SaleTimelineProductResponse): SaleTimelineProduct {
    return {
      productId: response.productId,
      productName: response.productName,
      presentation: response.presentation,
      quantity: response.quantity,
      unitPrice: response.unitPrice,
      lineTotal: response.lineTotal,
    };
  },

  paymentToDomain(response: SaleTimelinePaymentResponse): SaleTimelinePayment {
    return {
      method: response.method,
      amount: response.amount,
    };
  },
};
