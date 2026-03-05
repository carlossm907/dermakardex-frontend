import type { StockEntry } from "../../domain/models/stock-entry.model";
import type { StockEntryResponse } from "../api/products.api";

export const stockEntryMapper = {
  toDomain: (response: StockEntryResponse): StockEntry => ({
    id: response.id,
    productId: response.productId,
    productName: response.productName,
    quantity: response.quantity,
    expirationDate: response.expirationDate,
    unitPurchasePrice: response.unitPurchasePrice,
    totalInvestment: response.totalInvestment,
    reason: response.reason,
    userFullName: response.userFullName,
    registeredAt: new Date(response.registeredAt),
  }),

  toDomainList: (responses: StockEntryResponse[]): StockEntry[] => {
    return responses.map(stockEntryMapper.toDomain);
  },
};
