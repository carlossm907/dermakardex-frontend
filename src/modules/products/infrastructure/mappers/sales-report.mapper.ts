import type { SalesReport } from "../../domain/models/sales-report.model";
import type { SalesReportResponse } from "../api/products.api";

export const salesReportMapper = {
  toDomain: (response: SalesReportResponse): SalesReport => ({
    productId: response.productId,
    productName: response.productName,
    from: response.from,
    to: response.to,
    quantity: response.quantity,
  }),

  toDomainList: (responses: SalesReportResponse[]): SalesReport[] =>
    responses.map(salesReportMapper.toDomain),
};
