export interface SalesReport {
  productId: number;
  productName: string;
  from: string;
  to: string;
  quantity: number;
}

export type SalesReportScope = "all" | "single" | "multiple";
