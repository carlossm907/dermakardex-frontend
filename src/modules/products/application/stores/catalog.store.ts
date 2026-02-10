import { create } from "zustand";
import type {
  Brand,
  CreateBrandData,
  UpdateBrandData,
} from "../../domain/models/brand.model";
import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from "../../domain/models/category.model";
import type {
  CreateLaboratoryData,
  Laboratory,
  UpdateLaboratoryData,
} from "../../domain/models/laboratory.model";
import type {
  CreateSupplierData,
  Supplier,
  UpdateSupplierData,
} from "../../domain/models/supplier.model";
import { productsApi } from "../../infrastructure/api/products.api";
import {
  brandMapper,
  categoryMapper,
  laboratoryMapper,
  supplierMapper,
} from "../../infrastructure/mappers/catalog.mappers";

interface CatalogState {
  brands: Brand[];
  categories: Category[];
  laboratories: Laboratory[];
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;

  fetchBrands: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchLaboratories: () => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  fetchAll: () => Promise<void>;

  createBrand: (data: CreateBrandData) => Promise<Brand>;
  createCategory: (data: CreateCategoryData) => Promise<Category>;
  createLaboratory: (data: CreateLaboratoryData) => Promise<Laboratory>;
  createSupplier: (data: CreateSupplierData) => Promise<Supplier>;

  updateBrand: (id: number, data: UpdateBrandData) => Promise<Brand>;
  updateCategory: (id: number, data: UpdateCategoryData) => Promise<Category>;
  updateLaboratory: (
    id: number,
    data: UpdateLaboratoryData,
  ) => Promise<Laboratory>;
  updateSupplier: (id: number, data: UpdateSupplierData) => Promise<Supplier>;

  deleteBrand: (id: number) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  deleteLaboratory: (id: number) => Promise<void>;
  deleteSupplier: (id: number) => Promise<void>;

  clearError: () => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  brands: [],
  categories: [],
  laboratories: [],
  suppliers: [],
  isLoading: false,
  error: null,

  fetchBrands: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await productsApi.getBrands();
      const brands = await brandMapper.toDomainList(response);

      set({ brands, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al cargar marcas";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getCategories();
      const categories = categoryMapper.toDomainList(response);
      set({ categories, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al cargar categorías";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchLaboratories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getLaboratories();
      const laboratories = laboratoryMapper.toDomainList(response);
      set({ laboratories, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al cargar laboratorios";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getSuppliers();
      const suppliers = supplierMapper.toDomainList(response);
      set({ suppliers, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al cargar proveedores";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().fetchBrands(),
        get().fetchCategories(),
        get().fetchLaboratories(),
        get().fetchSuppliers(),
      ]);
      set({ isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al cargar catálogo";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  createBrand: async (data: CreateBrandData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.createBrand(data);
      const brand = brandMapper.toDomain(response);

      set((state) => ({
        brands: [...state.brands, brand],
        isLoading: false,
      }));
      return brand;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al crear marca";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  createCategory: async (data: CreateCategoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.createCategory(data);
      const category = categoryMapper.toDomain(response);
      set((state) => ({
        categories: [...state.categories, category],
        isLoading: false,
      }));
      return category;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al crear category";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  createLaboratory: async (data: CreateLaboratoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.createLaboratory(data);
      const laboratory = laboratoryMapper.toDomain(response);

      set((state) => ({
        laboratories: [...state.laboratories, laboratory],
        isLoading: false,
      }));

      return laboratory;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al crear laboratorio";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  createSupplier: async (data: CreateSupplierData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.createSupplier(data);
      const supplier = supplierMapper.toDomain(response);

      set((state) => ({
        suppliers: [...state.suppliers, supplier],
        isLoading: false,
      }));

      return supplier;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al crear proveedor";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  updateBrand: async (id: number, data: UpdateBrandData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await productsApi.updateBrand(id, data);
      const updatedBrand = brandMapper.toDomain(response);

      set((state) => ({
        brands: state.brands.map((brand) =>
          brand.id === id ? updatedBrand : brand,
        ),
        isLoading: false,
      }));

      return updatedBrand;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al actualizar marca";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  updateCategory: async (id: number, data: UpdateCategoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.updateCategory(id, data);
      const updatedCategory = categoryMapper.toDomain(response);

      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? updatedCategory : category,
        ),
        isLoading: false,
      }));

      return updatedCategory;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar categoría";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  updateLaboratory: async (id: number, data: UpdateLaboratoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.updateLaboratory(id, data);
      const updatedLaboratory = laboratoryMapper.toDomain(response);

      set((state) => ({
        laboratories: state.laboratories.map((laboratory) =>
          laboratory.id === id ? updatedLaboratory : laboratory,
        ),
        isLoading: false,
      }));

      return updatedLaboratory;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar laboratorio";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  updateSupplier: async (id: number, data: UpdateSupplierData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await productsApi.updateSupplier(id, data);
      const updatedSupplier = supplierMapper.toDomain(response);

      set((state) => ({
        suppliers: state.suppliers.map((supplier) =>
          supplier.id === id ? updatedSupplier : supplier,
        ),
        isLoading: false,
      }));

      return updatedSupplier;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : " Error al actualizar proveedor ";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteBrand: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      await productsApi.deleteBrand(id);

      set((state) => ({
        brands: state.brands.filter((brand) => brand.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar marca";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteCategory: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await productsApi.deleteCategory(id);

      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar categoría";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteLaboratory: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await productsApi.deleteLaboratory(id);

      set((state) => ({
        laboratories: state.laboratories.filter(
          (laboratory) => laboratory.id !== id,
        ),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al eliminar laboratorio";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSupplier: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await productsApi.deleteSupplier(id);

      set((state) => ({
        suppliers: state.suppliers.filter((supplier) => supplier.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar proveedor";
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
