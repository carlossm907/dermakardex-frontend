import type { PaymentMethod } from "./payment-method.model";

export interface SalePayment {
  method: PaymentMethod;
  amount: number;
}

export interface CreateSalePaymentData {
  method: PaymentMethod;
  amount: number;
}
