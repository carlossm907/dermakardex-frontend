import { create } from "zustand";
import type { StockReport } from "../../domain/models/stock-report.model";
import { stockReportMapper } from "../../infrastructure/mappers/stock-report.mapper";
import { productsApi } from "../../infrastructure/api/products.api";

interface StockReportState {
  report: StockReport[];
  isLoading: boolean;
  error: string | null;

  fetchSingleProductReport: (
    productId: number,
    from: string,
    to: string,
  ) => Promise<void>;

  fetchAllProductsReport: (from: string, to: string) => Promise<void>;

  fetchSelectedProductsReport: (
    productIds: number[],
    from: string,
    to: string,
  ) => Promise<void>;

  clearReport: () => void;
  clearError: () => void;
}

export const useStockReportStore = create<StockReportState>((set) => ({
  report: [],
  isLoading: false,
  error: null,

  fetchSingleProductReport: async (productId, from, to) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getSingleProductReport(
        productId,
        from,
        to,
      );
      set({
        report: stockReportMapper.toDomainList(response),
        isLoading: false,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al generar el reporte";
      set({ error: message, isLoading: false });
    }
  },

  fetchAllProductsReport: async (from, to) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getAllProductsReport(from, to);
      set({
        report: stockReportMapper.toDomainList(response),
        isLoading: false,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al generar el reporte";
      set({ error: message, isLoading: false });
    }
  },

  fetchSelectedProductsReport: async (productIds, from, to) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getSelectedProductsReport(
        productIds,
        from,
        to,
      );
      set({
        report: stockReportMapper.toDomainList(response),
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
