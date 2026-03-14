import type {
  SaleReportItem,
  SaleReportProduct,
  SalesGroupedByCustomerReport,
} from "../../domain/models/sales-report.model";
import type {
  SaleReportItemResponse,
  SaleReportProductResponse,
  SalesGroupedByCustomerReportResponse,
} from "../api/sales.api";

export const salesReportMapper = {
  toDomain(
    response: SalesGroupedByCustomerReportResponse,
  ): SalesGroupedByCustomerReport {
    return {
      customerFullName: response.customerFullName,
      customerDni: response.customerDni,
      customerTotalAmount: response.customerTotalAmount,
      sales: response.sales.map(salesReportMapper.saleItemToDomain),
    };
  },

  toDomainList(
    responses: SalesGroupedByCustomerReportResponse[],
  ): SalesGroupedByCustomerReport[] {
    return responses.map(salesReportMapper.toDomain);
  },

  saleItemToDomain(response: SaleReportItemResponse): SaleReportItem {
    return {
      saleId: response.saleId,
      ticketNumber: response.ticketNumber,
      saleDate: response.saleDate,
      saleTime: response.saleTime,
      finalAmount: response.finalAmount,
      items: response.items.map(salesReportMapper.productToDomain),
    };
  },

  productToDomain(response: SaleReportProductResponse): SaleReportProduct {
    return {
      productId: response.productId,
      productName: response.productName,
      presentation: response.presentation,
      quantity: response.quantity,
      unitPrice: response.unitPrice,
      lineTotal: response.lineTotal,
    };
  },
};
