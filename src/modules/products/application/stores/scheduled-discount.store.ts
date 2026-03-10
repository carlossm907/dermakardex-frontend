import { create } from "zustand";
import {
  isExpired,
  type CreateScheduledDiscountData,
  type CreateScheduledDiscountToAllData,
  type CreateScheduledDiscountToProductsData,
  type ScheduledDiscount,
  type UpdateScheduledDiscountData,
} from "../../domain/models/scheduled-discount.model";
import { productsApi } from "../../infrastructure/api/products.api";
import { scheduledDiscountMapper } from "../../infrastructure/mappers/scheduled-discount.mapper";

interface ScheduledDiscountState {
  discounts: ScheduledDiscount[];
  isLoading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;
  fetchActive: () => Promise<void>;

  createForProduct: (data: CreateScheduledDiscountData) => Promise<void>;
  createForProducts: (
    data: CreateScheduledDiscountToProductsData,
  ) => Promise<void>;
  createForAll: (data: CreateScheduledDiscountToAllData) => Promise<void>;

  update: (id: number, data: UpdateScheduledDiscountData) => Promise<void>;
  remove: (id: number) => Promise<void>;
  disable: (id: number) => Promise<void>;
  cleanupExpired: () => Promise<void>;

  expiredDiscounts: () => ScheduledDiscount[];
  clearError: () => void;
}

export const useScheduledDiscountStore = create<ScheduledDiscountState>(
  (set, get) => ({
    discounts: [],
    isLoading: false,
    error: null,

    fetchAll: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await productsApi.getAllScheduledDiscounts();
        const discounts = scheduledDiscountMapper.toDomainList(response);
        set({ discounts, isLoading: false });
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Error al cargar descuentos programados";
        set({ error: message, isLoading: false });
      }
    },

    fetchActive: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await productsApi.getActiveScheduledDiscounts();
        const discounts = scheduledDiscountMapper.toDomainList(response);
        set({ discounts, isLoading: false });
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Error al cargar descuentos activos";
        set({ error: message, isLoading: false });
      }
    },

    createForProduct: async (data: CreateScheduledDiscountData) => {
      set({ isLoading: true, error: null });
      try {
        await productsApi.createScheduledDiscount({
          productId: data.productId,
          name: data.name,
          type: data.type,
          value: data.value,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
        });
        await get().fetchAll();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Error al crear descuento programado";
        set({ error: message, isLoading: false });
        throw error;
      }
    },

    createForProducts: async (data: CreateScheduledDiscountToProductsData) => {
      set({ isLoading: true, error: null });
      try {
        await productsApi.createScheduledDiscountToProducts({
          productIds: data.productIds,
          name: data.name,
          discountType: data.discountType,
          discountValue: data.discountValue,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
        });
        await get().fetchAll();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Error al crear descuentos programados";
        set({ error: message, isLoading: false });
        throw error;
      }
    },

    createForAll: async (data: CreateScheduledDiscountToAllData) => {
      set({ isLoading: true, error: null });
      try {
        await productsApi.createScheduledDiscountToAllProducts({
          name: data.name,
          discountType: data.discountType,
          discountValue: data.discountValue,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
        });
        await get().fetchAll();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Error al crear descuento masivo";
        set({ error: message, isLoading: false });
        throw error;
      }
    },

    update: async (id: number, data: UpdateScheduledDiscountData) => {
      set({ isLoading: true, error: null });
      try {
        await productsApi.updateScheduledDiscount(id, {
          name: data.name,
          type: data.type,
          value: data.value,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
        });
        await get().fetchAll();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Error al actualizar descuento";
        set({ error: message, isLoading: false });
        throw error;
      }
    },

    remove: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        await productsApi.deleteScheduledDiscount(id);
        set((state) => ({
          discounts: state.discounts.filter((d) => d.id !== id),
          isLoading: false,
        }));
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Error al eliminar descuento";
        set({ error: message, isLoading: false });
        throw error;
      }
    },

    disable: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        await productsApi.disableScheduledDiscount(id);
        await get().fetchAll();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Error al deshabilitar descuento";
        set({ error: message, isLoading: false });
        throw error;
      }
    },

    cleanupExpired: async () => {
      set({ isLoading: true, error: null });
      try {
        await productsApi.cleanupExpiredScheduledDiscount();
        await get().fetchAll();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Error al limpiar descuentos expirados";
        set({ error: message, isLoading: false });
        throw error;
      }
    },

    expiredDiscounts: () => {
      return get().discounts.filter(isExpired);
    },

    clearError: () => set({ error: null }),
  }),
);
