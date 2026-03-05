import type { CreateSaleItemData, SaleItem } from "./sale-item.model";
import type { CreateSalePaymentData, SalePayment } from "./sale-payment.model";
import type { SaleStatus } from "./sale-status.model";

export interface Sale {
  id: number;
  ticketNumber: string;
  customerDni: string;
  customerFullName: string;
  sellerUserId: number;
  sellerFullName: string;
  saleDate: string;
  saleTime: string;
  observation: string | null;
  total: number;
  status: SaleStatus;
  items: SaleItem[];
  payments: SalePayment[];
}

export interface CreateSaleData {
  customerDni: string;
  observation: string;
  items: CreateSaleItemData[];
  payments: CreateSalePaymentData[];
}

export interface SaleListItem {
  id: number;
  ticketNumber: string;
  customerFullName: string;
  sellerFullName: string;
  saleDate: string;
  saleTime: string;
  total: number;
  status: SaleStatus;
}
