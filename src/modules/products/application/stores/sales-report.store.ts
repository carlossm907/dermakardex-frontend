import { create } from "zustand";
import type { SalesReport } from "../../domain/models/sales-report.model";
import { productsApi } from "../../infrastructure/api/products.api";
import { salesReportMapper } from "../../infrastructure/mappers/sales-report.mapper";

interface SalesReportState {
  report: SalesReport[];
  isLoading: boolean;
  error: string | null;

  fetchSingleProductSalesReport: (
    productId: number,
    from: string,
    to: string,
  ) => Promise<void>;

  fetchAllProductsSalesReport: (from: string, to: string) => Promise<void>;

  fetchSelectedProductsSalesReport: (
    productIds: number[],
    from: string,
    to: string,
  ) => Promise<void>;

  clearReport: () => void;
  clearError: () => void;
}

export const useSalesReportStore = create<SalesReportState>((set) => ({
  report: [],
  isLoading: false,
  error: null,

  fetchSingleProductSalesReport: async (productId, from, to) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getSingleProductSalesReport(
        productId,
        from,
        to,
      );
      set({
        report: salesReportMapper.toDomainList(response),
        isLoading: false,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al generar el reporte";
      set({ error: message, isLoading: false });
    }
  },

  fetchSelectedProductsSalesReport: async (productIds, from, to) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getSelectedProductsSalesReport(
        productIds,
        from,
        to,
      );
      set({
        report: salesReportMapper.toDomainList(response),
        isLoading: false,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al generar el reporte";
      set({ error: message, isLoading: false });
    }
  },

  fetchAllProductsSalesReport: async (from, to) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getAllProductsSalesReport(from, to);
      set({
        report: salesReportMapper.toDomainList(response),
        isLoading: false,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al generar el reporte";
      set({ error: message, isLoading: false });
    }
  },

  clearReport: () => set({ report: [] }),
  clearError: () => set({ error: null }),
}));
