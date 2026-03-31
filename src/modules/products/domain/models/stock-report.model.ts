export interface StockReport {
  productId: number;
  productName: string;
  date: string;
  initialStock: number;
  entries: number;
  sold: number;
  finalStock: number;
}

export type StockReportScope = "all" | "single" | "multiple";

export type StockReportDateMode = "day" | "month" | "range";
