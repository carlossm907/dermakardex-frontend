import apiClient from "@/shared/config/api.config";
import type { DiscountType } from "../../domain/models/discount.type";
import type { ProductPresentation } from "../../domain/models/product.model";

export interface ProductResponse {
  id: number;
  code: string;
  name: string;
  brandId: number;
  categoryId: number;
  laboratoryId: number;
  supplierId: number;
  presentation: ProductPresentation;
  purchasePrice: number;
  finalPrice: number;
  salePrice: number;
  maxDiscountAmount: number;
  discountType: DiscountType;
  discountValue: number;
  stock: number;
  stockAlertThreshold: number;
  isActive: boolean;
}

export interface BrandResponse {
  id: number;
  name: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
}

export interface LaboratoryResponse {
  id: number;
  name: string;
}

export interface SupplierResponse {
  id: number;
  name: string;
}

export interface StockEntryResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  expirationDate: string;
  unitPurchasePrice: number;
  totalInvestment: number;
  reason: string;
  userFullName: string;
  registeredAt: string;
}

export interface CreateProductRequest {
  code: string;
  name: string;
  brandId: number;
  laboratoryId: number;
  categoryId: number;
  supplierId: number;
  presentation: ProductPresentation;
  purchasePrice: number;
  salePrice: number;
  maxDiscountAmount: number;
  initialStock: number;
  stockAlertThreshold: number;
}

export interface UpdateProductRequest {
  code: string;
  name: string;
  brandId: number;
  laboratoryId: number;
  categoryId: number;
  supplierId: number;
  presentation: ProductPresentation;
  purchasePrice: number;
  salePrice: number;
  maxDiscountAmount: number;
  stockAlertThreshold: number;
  isActive: boolean;
}

export interface CreateStockEntryRequest {
  quantity: number;
  expirationDate: string;
  unitPurchasePrice: number;
  reason: string;
}

export interface ApplyDiscountRequest {
  type: DiscountType;
  value: number;
}

export interface CreateCatalogItemRequest {
  name: string;
}

export interface UpdateCatalogItemRequest {
  name: string;
}

export const productsApi = {
  getProducts: async (name?: string): Promise<ProductResponse[]> => {
    const params = name ? { name } : {};
    const response = await apiClient.get<ProductResponse[]>("/products", {
      params,
    });
    return response.data;
  },

  getProductById: async (id: number): Promise<ProductResponse> => {
    const response = await apiClient.get<ProductResponse>(`/products/${id}`);
    return response.data;
  },

  getProductByCode: async (code: string): Promise<ProductResponse> => {
    const response = await apiClient.get<ProductResponse>(`/products/${code}`);
    return response.data;
  },

  getLowStockProducts: async (): Promise<ProductResponse[]> => {
    const response = await apiClient.get<ProductResponse[]>(
      "/products/low-stock",
    );
    return response.data;
  },

  createProduct: async (
    data: CreateProductRequest,
  ): Promise<ProductResponse> => {
    const response = await apiClient.post<ProductResponse>("/products", data);
    return response.data;
  },

  updateProduct: async (
    id: number,
    data: UpdateProductRequest,
  ): Promise<ProductResponse> => {
    const response = await apiClient.put<ProductResponse>(
      `/products/${id}`,
      data,
    );
    return response.data;
  },

  applyDiscountToProduct: async (
    id: number,
    data: ApplyDiscountRequest,
  ): Promise<void> => {
    await apiClient.post(`/products/${id}/discount`, data);
  },

  removeDiscountFromProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}/discount`);
  },

  applyDiscountToProducts: async (
    productIds: number[],
    data: ApplyDiscountRequest,
  ): Promise<void> => {
    await apiClient.post("/products/discounts", {
      productIds,
      type: data.type,
      value: data.value,
    });
  },

  aplyDiscountToAllProducts: async (
    data: ApplyDiscountRequest,
  ): Promise<void> => {
    await apiClient.post("/products/discounts/all", data);
  },

  removeDiscountFromAllProducts: async (): Promise<void> => {
    await apiClient.delete("/products/discounts/all");
  },

  getProductStockEntries: async (
    productId: number,
  ): Promise<StockEntryResponse[]> => {
    const response = await apiClient.get<StockEntryResponse[]>(
      `/products/${productId}/entries`,
    );
    return response.data;
  },

  getAllStockEntries: async (): Promise<StockEntryResponse[]> => {
    const response =
      await apiClient.get<StockEntryResponse[]>("/stock-entries");
    return response.data;
  },

  createStockEntry: async (
    productId: number,
    data: CreateStockEntryRequest,
  ): Promise<void> => {
    await apiClient.post(`/products/${productId}/entries`, data);
  },

  //Brands

  getBrands: async (): Promise<BrandResponse[]> => {
    const response = await apiClient.get<BrandResponse[]>("/brands");
    return response.data;
  },

  getBrandById: async (id: number): Promise<BrandResponse> => {
    const response = await apiClient.get<BrandResponse>(`/brands/${id}`);
    return response.data;
  },

  createBrand: async (
    data: CreateCatalogItemRequest,
  ): Promise<BrandResponse> => {
    const response = await apiClient.post<BrandResponse>("/brands", data);
    return response.data;
  },

  updateBrand: async (
    id: number,
    data: UpdateCatalogItemRequest,
  ): Promise<BrandResponse> => {
    const response = await apiClient.put<BrandResponse>(`/brands/${id}`, data);
    return response.data;
  },

  deleteBrand: async (id: number): Promise<void> => {
    await apiClient.delete(`/brands/${id}`);
  },

  //Categories

  getCategories: async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<CategoryResponse[]>("/categories");
    return response.data;
  },

  getCategoryById: async (id: number): Promise<CategoryResponse> => {
    const response = await apiClient.get<CategoryResponse>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (
    data: CreateCatalogItemRequest,
  ): Promise<CategoryResponse> => {
    const response = await apiClient.post<CategoryResponse>(
      "/categories",
      data,
    );
    return response.data;
  },

  updateCategory: async (
    id: number,
    data: UpdateCatalogItemRequest,
  ): Promise<CategoryResponse> => {
    const response = await apiClient.put<CategoryResponse>(
      `/categories/${id}`,
      data,
    );
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  //Laboratories

  getLaboratories: async (): Promise<LaboratoryResponse[]> => {
    const response = await apiClient.get<LaboratoryResponse[]>("/laboratories");
    return response.data;
  },

  getLaboratoryById: async (id: number): Promise<LaboratoryResponse> => {
    const response = await apiClient.get<LaboratoryResponse>(
      `/laboratories/${id}`,
    );
    return response.data;
  },

  createLaboratory: async (
    data: CreateCatalogItemRequest,
  ): Promise<LaboratoryResponse> => {
    const response = await apiClient.post<LaboratoryResponse>(
      "/laboratories",
      data,
    );
    return response.data;
  },

  updateLaboratory: async (
    id: number,
    data: UpdateCatalogItemRequest,
  ): Promise<LaboratoryResponse> => {
    const response = await apiClient.put<LaboratoryResponse>(
      `/laboratories/${id}`,
      data,
    );
    return response.data;
  },

  deleteLaboratory: async (id: number): Promise<void> => {
    await apiClient.delete(`/laboratories/${id}`);
  },

  //Suppliers

  getSuppliers: async (): Promise<SupplierResponse[]> => {
    const response = await apiClient.get<SupplierResponse[]>("/suppliers");
    return response.data;
  },

  getSupplierById: async (id: number): Promise<SupplierResponse> => {
    const response = await apiClient.get<SupplierResponse>(`/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (
    data: CreateCatalogItemRequest,
  ): Promise<SupplierResponse> => {
    const response = await apiClient.post<SupplierResponse>("/suppliers", data);
    return response.data;
  },

  updateSupplier: async (
    id: number,
    data: UpdateCatalogItemRequest,
  ): Promise<SupplierResponse> => {
    const response = await apiClient.put<SupplierResponse>(
      `/suppliers/${id}`,
      data,
    );
    return response.data;
  },

  deleteSupplier: async (id: number): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },
};
