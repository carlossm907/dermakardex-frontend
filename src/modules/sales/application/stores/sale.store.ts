import { create } from "zustand";
import type {
  CreateSaleData,
  Sale,
  SaleListItem,
} from "../../domain/models/sale.model";
import { salesApi } from "../../infrastructure/api/sales.api";
import {
  saleListMapper,
  saleMapper,
} from "../../infrastructure/mappers/sale.mapper";
import { dniLookupService } from "../../infrastructure/services/dni-lookup.service";

interface SaleState {
  sales: SaleListItem[];
  selectedSale: Sale | null;
  isLoading: boolean;
  error: string | null;

  fetchSales: () => Promise<void>;
  fetchSaleById: (id: number) => Promise<void>;
  fetchSalesByCustomerDni: (dni: string) => Promise<void>;
  fetchSalesBySellerId: (userId: number) => Promise<void>;
  fetchSalesByProductId: (productId: number) => Promise<void>;
  fetchSalesByDay: (date: string) => Promise<void>;
  fetchSalesByMonth: (year: number, month: number) => Promise<void>;

  registerSale: (data: CreateSaleData) => Promise<Sale>;

  clearError: () => void;
  clearSelectedSale: () => void;
}

export const useSaleStore = create<SaleState>((set) => ({
  sales: [],
  selectedSale: null,
  isLoading: false,
  error: null,

  fetchSales: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await salesApi.getAllSales();
      const sales = saleListMapper.toDomainList(response);
      sales.sort((a, b) => b.id - a.id);
      set({ sales, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al cargar ventas";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchSaleById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await salesApi.getSaleById(id);
      const sale = saleMapper.toDomain(response);

      dniLookupService.addToCache(sale.customerDni, sale.customerFullName);

      set({ selectedSale: sale, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al cargar venta";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchSalesByCustomerDni: async (dni: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await salesApi.getSalesByCustomerDni(dni);
      const sales = saleListMapper.toDomainList(response);

      sales.sort((a, b) => b.id - a.id);

      set({ sales, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cargar ventas del cliente";

      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchSalesBySellerId: async (userId: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await salesApi.getSalesBySellerId(userId);
      const sales = saleListMapper.toDomainList(response);

      sales.sort((a, b) => b.id - a.id);

      set({ sales, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cargar ventas del vendedor";

      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchSalesByProductId: async (productId: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await salesApi.getSalesByProductId(productId);
      const sales = saleListMapper.toDomainList(response);

      sales.sort((a, b) => b.id - a.id);

      set({ sales, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cargar ventas del producto";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchSalesByDay: async (date: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await salesApi.getSalesByDay(date);
      const sales = saleListMapper.toDomainList(response);

      sales.sort((a, b) => b.id - a.id);

      set({ sales, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cargar ventas del día";

      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchSalesByMonth: async (year: number, month: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await salesApi.getSalesByMonth(year, month);
      const sales = saleListMapper.toDomainList(response);

      sales.sort((a, b) => b.id - a.id);

      set({ sales, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cargar ventas del mes";

      set({
        error: message,
        isLoading: false,
      });
    }
  },

  registerSale: async (data: CreateSaleData) => {
    set({ isLoading: true, error: null });

    try {
      const request = {
        customerDni: data.customerDni,
        observation: data.observation || undefined,
        items: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),

        payments: data.payments.map((payment) => ({
          method: payment.method,
          amount: payment.amount,
        })),
      };

      const response = await salesApi.registerSale(request);
      const sale = saleMapper.toDomain(response);

      dniLookupService.addToCache(sale.customerDni, sale.customerFullName);

      set((state) => ({
        sales: [
          {
            id: sale.id,
            ticketNumber: sale.ticketNumber,
            customerFullName: sale.customerFullName,
            saleDate: sale.saleDate,
            saleTime: sale.saleTime,
            total: sale.total,
            status: sale.status,
          },
          ...state.sales,
        ],
        selectedSale: sale,
        isLoading: false,
      }));

      return sale;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al registrar venta";

      set({
        error: message,
        isLoading: false,
      });

      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),

  clearSelectedSale: () => set({ selectedSale: null }),
}));
