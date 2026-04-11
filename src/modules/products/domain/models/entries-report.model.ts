export interface EntriesReport {
  productId: number;
  productName: string;
  from: string;
  to: string;
  quantity: number;
}

export type EntriesReportScope = "all" | "single" | "multiple" | "affected";

export type EntriesReportDateMode = "day" | "month" | "range";
