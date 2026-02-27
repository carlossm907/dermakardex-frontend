export interface StockEntry {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPurchasePrice: number;
  totalInvestment: number;
  reason: string;
  registeredByUserId: number;
  registeredByUserName: string;
  registeredAt: Date;
}

export interface CreateStockEntryData {
  productId: number;
  quantity: number;
  unitPurchasePrice: number;
  reason: string;
}
