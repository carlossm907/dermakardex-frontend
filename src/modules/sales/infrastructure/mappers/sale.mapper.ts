import { parseSaleStatus } from "../../domain/models/sale-status.model";
import type { Sale, SaleListItem } from "../../domain/models/sale.model";
import type { SaleDetailResponse, SaleResponse } from "../api/sales.api";
import { saleItemMapper } from "./sale-item.mapper";
import { salePaymentMapper } from "./sale-payment.mapper";

export const saleListMapper = {
  toDomain: (response: SaleResponse): SaleListItem => ({
    id: response.id,
    ticketNumber: response.ticketNumber,
    customerFullName: response.customerFullName,
    sellerFullName: response.sellerFullName,
    saleDate: response.saleDate,
    saleTime: response.saleTime,
    total: response.total,
    status: parseSaleStatus(response.status),
  }),

  toDomainList: (responses: SaleResponse[]): SaleListItem[] => {
    return responses.map(saleListMapper.toDomain);
  },
};

export const saleMapper = {
  toDomain: (response: SaleDetailResponse): Sale => ({
    id: response.id,
    ticketNumber: response.ticketNumber,
    customerDni: response.customerDni,
    customerFullName: response.customerFullName,
    sellerUserId: response.sellerUserId,
    sellerFullName: response.sellerFullName,
    saleDate: response.saleDate,
    saleTime: response.saleTime,
    observation: response.observation,
    total: response.total,
    status: parseSaleStatus(response.status),
    items: saleItemMapper.toDomainList(response.items),
    payments: salePaymentMapper.toDomainList(response.payments),
  }),
};
