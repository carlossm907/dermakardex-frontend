import { parsePaymentMethod } from "../../domain/models/payment-method.model";
import type { SalePayment } from "../../domain/models/sale-payment.model";
import type { SalePaymentResponse } from "../api/sales.api";

export const salePaymentMapper = {
  toDomain: (response: SalePaymentResponse): SalePayment => ({
    method: parsePaymentMethod(response.method),
    amount: response.amount,
  }),

  toDomainList: (responses: SalePaymentResponse[]): SalePayment[] => {
    return responses.map(salePaymentMapper.toDomain);
  },
};
