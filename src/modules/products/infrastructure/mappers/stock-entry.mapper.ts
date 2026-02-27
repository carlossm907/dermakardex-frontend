import type { StockEntry } from "../../domain/models/stock-entry.model";
import type { StockEntryResponse } from "../api/products.api";

export const stockEntryMapper = {
  toDomain: (response: StockEntryResponse): StockEntry => ({
    id: response.id,
    productId: response.productId,
    productName: response.productName,
    quantity: response.quantity,
    unitPurchasePrice: response.unitPurchasePrice,
    totalInvestment: response.totalInvestment,
    reason: response.reason,
    registeredByUserId: response.registeredByUserId,
    registeredByUserName: response.registeredByUserName,
    registeredAt: new Date(response.registeredAt),
  }),

  toDomainList: (responses: StockEntryResponse[]): StockEntry[] => {
    return responses.map(stockEntryMapper.toDomain);
  },
};
