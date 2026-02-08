import type { Brand } from "../../domain/models/brand.model";
import type { Category } from "../../domain/models/category.model";
import type { Laboratory } from "../../domain/models/laboratory.model";
import type { Supplier } from "../../domain/models/supplier.model";
import type {
  BrandResponse,
  CategoryResponse,
  LaboratoryResponse,
  SupplierResponse,
} from "../api/products.api";

export const brandMapper = {
  toDomain: (response: BrandResponse): Brand => ({
    id: response.id,
    name: response.name,
  }),

  toDomainList: (responses: BrandResponse[]): Brand[] => {
    return responses.map(brandMapper.toDomain);
  },
};

export const categoryMapper = {
  toDomain: (response: CategoryResponse): Category => ({
    id: response.id,
    name: response.name,
  }),

  toDomainList: (responses: CategoryResponse[]): Category[] => {
    return responses.map(categoryMapper.toDomain);
  },
};

export const supplierMapper = {
  toDomain: (response: SupplierResponse): Supplier => ({
    id: response.id,
    name: response.name,
  }),

  toDomainList: (responses: SupplierResponse[]): Supplier[] => {
    return responses.map(supplierMapper.toDomain);
  },
};

export const laboratoryMapper = {
  toDomain: (response: LaboratoryResponse): Laboratory => ({
    id: response.id,
    name: response.name,
  }),

  toDomainList: (responses: LaboratoryResponse[]): Laboratory[] => {
    return responses.map(laboratoryMapper.toDomain);
  },
};
