import type { StockReport } from "../../domain/models/stock-report.model";
import type { StockReportResponse } from "../api/products.api";

export const stockReportMapper = {
  toDomain: (response: StockReportResponse): StockReport => ({
    productId: response.productId,
    productName: response.productName,
    date: response.date,
    initialStock: response.initialStock,
    entries: response.entries,
    sold: response.sold,
    finalStock: response.finalStock,
  }),

  toDomainList: (responses: StockReportResponse[]): StockReport[] =>
    responses.map(stockReportMapper.toDomain),
};
