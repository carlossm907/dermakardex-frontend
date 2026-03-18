import type { EntriesReport } from "../../domain/models/entries-report.model";
import type { EntriesReportResponse } from "../api/products.api";

export const entriesReportMapper = {
  toDomain: (response: EntriesReportResponse): EntriesReport => ({
    productId: response.productId,
    productName: response.productName,
    from: response.from,
    to: response.to,
    quantity: response.quantity,
  }),

  toDomainList: (responses: EntriesReportResponse[]): EntriesReport[] =>
    responses.map(entriesReportMapper.toDomain),
};
