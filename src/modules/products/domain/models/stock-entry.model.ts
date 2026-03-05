export interface StockEntry {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  expirationDate: string;
  unitPurchasePrice: number;
  totalInvestment: number;
  reason: string;
  userFullName: string;
  registeredAt: Date;
}

export interface CreateStockEntryData {
  productId: number;
  quantity: number;
  expirationDate: string;
  unitPurchasePrice: number;
  reason: string;
}
