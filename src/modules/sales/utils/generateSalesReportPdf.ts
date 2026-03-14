import { jsPDF } from "jspdf";
import type { SalesGroupedByCustomerReport } from "../domain/models/sales-report.model";

type ReportInfo = {
  type: "day" | "month";
  date?: string;
  year?: number;
  month?: number;
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date + "T00:00:00"));

const formatMonth = (year: number, month: number) =>
  new Intl.DateTimeFormat("es-PE", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1));

export function generateSalesReportPdf(
  report: SalesGroupedByCustomerReport[],
  info: ReportInfo,
) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();

  let y = 18;

  const drawLine = () => {
    doc.setDrawColor(200);
    doc.line(10, y, pageWidth - 10, y);
    y += 4;
  };

  const addPageIfNeeded = () => {
    if (y > 270) {
      doc.addPage();
      y = 18;
    }
  };

  // TITULO
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");

  const title =
    info.type === "day"
      ? "REPORTE DE VENTAS DIARIO"
      : "REPORTE DE VENTAS MENSUAL";

  doc.text(title, pageWidth / 2, y, { align: "center" });

  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  if (info.type === "day" && info.date) {
    doc.text(`Fecha: ${formatDate(info.date)}`, pageWidth / 2, y, {
      align: "center",
    });
  }

  if (info.type === "month" && info.year && info.month) {
    doc.text(
      `Periodo: ${formatMonth(info.year, info.month)}`,
      pageWidth / 2,
      y,
      { align: "center" },
    );
  }

  y += 6;

  drawLine();

  let totalGeneral = 0;

  for (const customer of report) {
    y += 4;

    addPageIfNeeded();

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");

    doc.text(customer.customerFullName, 10, y);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    doc.text(`DNI: ${customer.customerDni}`, pageWidth - 10, y, {
      align: "right",
    });

    y += 5;

    drawLine();

    for (const sale of customer.sales) {
      addPageIfNeeded();

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");

      doc.text(
        `Ticket ${sale.ticketNumber} • ${sale.saleDate} ${sale.saleTime}`,
        12,
        y,
      );

      doc.text(formatCurrency(sale.finalAmount), pageWidth - 10, y, {
        align: "right",
      });

      y += 4;

      doc.setFont("helvetica", "normal");

      for (const item of sale.items) {
        addPageIfNeeded();

        doc.setFontSize(8);

        doc.text(
          `${item.quantity}x ${item.productName} ${item.presentation}`,
          16,
          y,
        );

        doc.text(formatCurrency(item.lineTotal), pageWidth - 10, y, {
          align: "right",
        });

        y += 3.5;
      }

      y += 3;
    }

    doc.setFont("helvetica", "bold");

    doc.text("Total Cliente:", 12, y);

    doc.text(formatCurrency(customer.customerTotalAmount), pageWidth - 10, y, {
      align: "right",
    });

    totalGeneral += customer.customerTotalAmount;

    y += 8;

    drawLine();
  }

  y += 4;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");

  doc.text("TOTAL GENERAL", 10, y);

  doc.text(formatCurrency(totalGeneral), pageWidth - 10, y, {
    align: "right",
  });

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  window.open(url, "_blank");

  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
