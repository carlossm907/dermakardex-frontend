export interface EntriesReport {
  productId: number;
  productName: string;
  from: string;
  to: string;
  quantity: number;
}

export type EntriesReportScope = "all" | "single" | "multiple";

export type EntriesReportDateMode = "day" | "month" | "range";
