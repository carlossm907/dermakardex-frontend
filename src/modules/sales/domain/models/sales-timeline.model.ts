export interface SaleTimelinePayment {
  method: string;
  amount: number;
}

export interface SaleTimelineProduct {
  productId: number;
  productName: string;
  presentation: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SaleTimelineItem {
  saleId: number;
  ticketNumber: string;
  customerFullName: string;
  saleDate: string;
  saleTime: string;
  total: number;
  items: SaleTimelineProduct[];
  payments: SaleTimelinePayment[];
}

export interface SaleTimelineSellerBlock {
  sellerUserId: number;
  sellerFullName: string;
  sales: SaleTimelineItem[];
}

export interface SalesTimelineByDay {
  date: string;
  blocks: SaleTimelineSellerBlock[];
}
