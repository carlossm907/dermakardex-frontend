import { create } from "zustand";
import type {
  CreateStockEntryData,
  StockEntry,
} from "../../domain/models/stock-entry.model";
import { productsApi } from "../../infrastructure/api/products.api";
import { stockEntryMapper } from "../../infrastructure/mappers/stock-entry.mapper";

interface StockEntryState {
  entries: StockEntry[];
  isLoading: boolean;
  error: string | null;

  fetchAllEntries: () => Promise<void>;
  fetchProductEntries: (productId: number) => Promise<void>;

  createEntry: (productId: number, data: CreateStockEntryData) => Promise<void>;

  clearError: () => void;

  clearEntries: () => void;
}

export const useStockEntryStore = create<StockEntryState>((set) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchAllEntries: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await productsApi.getAllStockEntries();
      const entries = stockEntryMapper.toDomainList(response);

      entries.sort(
        (a, b) => b.registeredAt.getTime() - a.registeredAt.getTime(),
      );

      set({ entries, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cargar entradas de stock";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchProductEntries: async (productId: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await productsApi.getProductStockEntries(productId);
      const entries = stockEntryMapper.toDomainList(response);

      entries.sort(
        (a, b) => b.registeredAt.getTime() - a.registeredAt.getTime(),
      );

      set({ entries, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cargar entradas del producto";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  createEntry: async (id: number, data: CreateStockEntryData) => {
    set({ isLoading: true, error: null });
    try {
      await productsApi.createStockEntry(id, {
        quantity: data.quantity,
        unitPurchasePrice: data.unitPurchasePrice,
        reason: data.reason,
      });

      set({ isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al registrar entrada de stock";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: async () => {
    set({
      error: null,
    });
  },

  clearEntries: async () => {
    set({
      entries: [],
    });
  },
}));
