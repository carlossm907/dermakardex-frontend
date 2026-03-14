export interface SaleReportProduct {
  productId: number;
  productName: string;
  presentation: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SaleReportItem {
  saleId: number;
  ticketNumber: string;
  saleDate: string;
  saleTime: string;
  finalAmount: number;
  items: SaleReportProduct[];
}

export interface SalesGroupedByCustomerReport {
  customerFullName: string;
  customerDni: string;
  customerTotalAmount: number;
  sales: SaleReportItem[];
}
