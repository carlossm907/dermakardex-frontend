export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  YAPE = "YAPE",
  PLIN = "PLIN",
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Efectivo",
  [PaymentMethod.CARD]: "Tarjeta",
  [PaymentMethod.PLIN]: "Plin",
  [PaymentMethod.YAPE]: "Yape",
};

export const parsePaymentMethod = (method: string): PaymentMethod => {
  const upperMethod = method.toUpperCase();
  if (Object.values(PaymentMethod).includes(upperMethod as PaymentMethod)) {
    return upperMethod as PaymentMethod;
  }

  throw new Error(`Invalid payment method: ${method}`);
};
