import { create } from "zustand";
import type {
  ApplyDiscountData,
  CreateProductData,
  Product,
  UpdateProductData,
} from "../../domain/models/product.model";
import { productsApi } from "../../infrastructure/api/products.api";
import { productMapper } from "../../infrastructure/mappers/product.mapper";

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  lowStockProducts: Product[];
  isLoading: boolean;
  error: string | null;

  fetchProducts: (name?: string) => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;
  fetchLowStockProducts: () => Promise<void>;

  createProduct: (data: CreateProductData) => Promise<Product>;
  updateProduct: (id: number, data: UpdateProductData) => Promise<Product>;

  applyDiscount: (id: number, data: ApplyDiscountData) => Promise<void>;
  removeDiscount: (id: number) => Promise<void>;
  applyDiscountToMultiple: (
    productIds: number[],
    data: ApplyDiscountData,
  ) => Promise<void>;
  applyDiscountToAll: (data: ApplyDiscountData) => Promise<void>;
  removeDiscountFromAll: () => Promise<void>;

  clearError: () => void;
  clearSelectedProduct: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  lowStockProducts: [],
  isLoading: false,
  error: null,

  fetchProducts: async (name?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getProducts(name);
      const products = productMapper.toDomainList(response);
      set({ products, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cargar los productos";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchProductById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getProductById(id);
      const product = productMapper.toDomain(response);
      set({ selectedProduct: product, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al cargar producto";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchLowStockProducts: async () => {
    set({ isLoading: false, error: null });
    try {
      const response = await productsApi.getLowStockProducts();
      const lowStockProducts = productMapper.toDomainList(response);
      set({ lowStockProducts, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cargar productos con stock bajo";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  createProduct: async (data: CreateProductData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.createProduct(data);
      const product = productMapper.toDomain(response);

      set((state) => ({
        products: [...state.products, product],
        isLoading: false,
      }));

      return product;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al crear producto";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  updateProduct: async (id: number, data: UpdateProductData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.updateProduct(id, data);
      const updatedProduct = productMapper.toDomain(response);

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        selectedProduct:
          state.selectedProduct?.id === id
            ? updatedProduct
            : state.selectedProduct,
        isLoading: false,
      }));

      return updatedProduct;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar el producto";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  applyDiscount: async (id: number, data: ApplyDiscountData) => {
    set({ isLoading: true, error: null });
    try {
      await productsApi.applyDiscountToProduct(id, data);
      await get().fetchProductById(id);
      await get().fetchProducts();

      set({ isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al aplicar descuento";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  removeDiscount: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      await productsApi.removeDiscountFromProduct(id);

      await get().fetchProducts();

      set({ isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al quitar el descuento";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  applyDiscountToMultiple: async (
    productsId: number[],
    data: ApplyDiscountData,
  ) => {
    set({ isLoading: true, error: null });
    try {
      await productsApi.applyDiscountToProducts(productsId, data);
      await get().fetchProducts();

      set({ isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al aplicar descuentos";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  applyDiscountToAll: async (data: ApplyDiscountData) => {
    set({ isLoading: true, error: null });

    try {
      await productsApi.aplyDiscountToAllProducts(data);
      await get().fetchProducts();

      set({ isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al aplicar todos los descuentos";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  removeDiscountFromAll: async () => {
    set({ isLoading: true, error: null });

    try {
      await productsApi.removeDiscountFromAllProducts();

      await get().fetchProducts();

      set({ isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al eliminar el descuento";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  clearSelectedProduct: () => set({ selectedProduct: null }),
}));
