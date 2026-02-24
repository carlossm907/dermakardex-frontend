import apiClient from "@/shared/config/api.config";

export interface SaleResponse {
  id: number;
  ticketNumber: string;
  customerFullName: string;
  saleDate: string;
  saleTime: string;
  total: number;
  status: string;
}

export interface SaleDetailResponse {
  id: number;
  ticketNumber: string;
  customerDni: string;
  customerFullName: string;
  sellerUserId: number;
  sellerFullName: string;
  saleDate: string;
  saleTime: string;
  observation: string;
  total: number;
  status: string;
  items: SaleItemResponse[];
  payments: SalePaymentResponse[];
}

export interface SaleItemResponse {
  productId: number;
  productName: string;
  presentation: string;
  quantity: number;
  baseUnitPrice: number;
  unitPrice: number;
  discountType: string;
  discountValue: number;
  lineTotal: number;
}

export interface SalePaymentResponse {
  method: string;
  amount: number;
}

export interface RegisterSaleRequest {
  customerDni: string;
  observation?: string;
  items: RegisterSaleItemRequest[];
  payments: RegisterSalePaymentRequest[];
}

export interface RegisterSaleItemRequest {
  productId: number;
  quantity: number;
}

export interface RegisterSalePaymentRequest {
  method: string;
  amount: number;
}

export const salesApi = {
  getAllSales: async (): Promise<SaleResponse[]> => {
    const response = await apiClient.get<SaleResponse[]>("/sales");
    return response.data;
  },

  getSaleById: async (saleId: number): Promise<SaleDetailResponse> => {
    const response = await apiClient.get<SaleDetailResponse>(
      `/sales/${saleId}`,
    );
    return response.data;
  },

  getSalesByCustomerDni: async (dni: string): Promise<SaleResponse[]> => {
    const response = await apiClient.get<SaleResponse[]>(
      `/sales/customer/${dni}`,
    );
    return response.data;
  },

  getSalesBySellerId: async (userId: number): Promise<SaleResponse[]> => {
    const response = await apiClient.get<SaleResponse[]>(
      `/sales/seller/${userId}`,
    );
    return response.data;
  },

  getSalesByProductId: async (productId: number): Promise<SaleResponse[]> => {
    const response = await apiClient.get<SaleResponse[]>(
      `/sales/product/${productId}`,
    );
    return response.data;
  },

  getSalesByDay: async (date: string): Promise<SaleResponse[]> => {
    const response = await apiClient.get<SaleResponse[]>(`/sales/day/${date}`);
    return response.data;
  },

  getSalesByMonth: async (
    year: number,
    month: number,
  ): Promise<SaleResponse[]> => {
    const response = await apiClient.get<SaleResponse[]>(
      `/sales/month/${year}/${month}`,
    );
    return response.data;
  },

  registerSale: async (
    data: RegisterSaleRequest,
  ): Promise<SaleDetailResponse> => {
    const response = await apiClient.post<SaleDetailResponse>(`/sales`, data);
    return response.data;
  },
};
