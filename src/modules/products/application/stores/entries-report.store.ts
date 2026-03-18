import { create } from "zustand";
import type { EntriesReport } from "../../domain/models/entries-report.model";
import { entriesReportMapper } from "../../infrastructure/mappers/entries-report.mapper";
import { productsApi } from "../../infrastructure/api/products.api";

interface EntriesReportState {
  report: EntriesReport[];
  isLoading: boolean;
  error: string | null;

  fetchSingleProductEntriesReport: (
    productId: number,
    from: string,
    to: string,
  ) => Promise<void>;

  fetchAllProductsEntriesReport: (from: string, to: string) => Promise<void>;

  fetchSelectedProductsEntriesReport: (
    productIds: number[],
    from: string,
    to: string,
  ) => Promise<void>;

  clearReport: () => void;
  clearError: () => void;
}

export const useEntriesReportStore = create<EntriesReportState>((set) => ({
  report: [],
  isLoading: false,
  error: null,

  fetchSingleProductEntriesReport: async (productId, from, to) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getSingleProductEntriesReport(
        productId,
        from,
        to,
      );
      set({
        report: entriesReportMapper.toDomainList(response),
        isLoading: false,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al generar el reporte";
      set({ error: message, isLoading: false });
    }
  },

  fetchAllProductsEntriesReport: async (from, to) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getAllProductsEntriesReport(from, to);
      set({
        report: entriesReportMapper.toDomainList(response),
        isLoading: false,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al generar el reporte";
      set({ error: message, isLoading: false });
    }
  },

  fetchSelectedProductsEntriesReport: async (productIds, from, to) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getSelectedProductsEntriesReport(
        productIds,
        from,
        to,
      );
      set({
        report: entriesReportMapper.toDomainList(response),
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
