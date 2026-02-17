export enum SaleStatus {
  COMPLETED = "COMPLETED",
}

export const SaleStatusLabels: Record<SaleStatus, string> = {
  [SaleStatus.COMPLETED]: "Completada",
};

export const parseSaleStatus = (status: string): SaleStatus => {
  const upperStatus = status.toUpperCase();
  if (Object.values(SaleStatus).includes(upperStatus as SaleStatus)) {
    return upperStatus as SaleStatus;
  }
  throw new Error(`Invalid sale status: ${status}`);
};
