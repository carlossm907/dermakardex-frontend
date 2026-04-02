import { jsPDF } from "jspdf";
import type { SaleListItem } from "../domain/models/sale.model";

type ReportInfo =
  | { type: "all" }
  | { type: "day"; date: string }
  | { type: "month"; year: number; month: number }
  | { type: "customer"; dni: string };

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

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

const formatTime = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

const getReportTitle = (info: ReportInfo): string => {
  switch (info.type) {
    case "day":
      return "REPORTE DE VENTAS DIARIO";
    case "month":
      return "REPORTE DE VENTAS MENSUAL";
    case "customer":
      return "REPORTE DE VENTAS POR CLIENTE";
    default:
      return "REPORTE DE VENTAS GENERAL";
  }
};

const getReportSubtitle = (info: ReportInfo): string => {
  switch (info.type) {
    case "day":
      return `Fecha: ${formatDate(info.date)}`;
    case "month":
      return `Período: ${MONTHS[info.month - 1]} ${info.year}`;
    case "customer":
      return `DNI del cliente: ${info.dni}`;
    default:
      return `Generado el: ${new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date())}`;
  }
};

export function generateSalesTableReportPdf(
  sales: SaleListItem[],
  info: ReportInfo,
) {
  const doc = new jsPDF({ orientation: "landscape" });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297
  const pageHeight = doc.internal.pageSize.getHeight(); // 210
  const marginX = 12;
  const contentWidth = pageWidth - marginX * 2;

  let y = 18;
  let pageNumber = 1;

  // ── helpers ──────────────────────────────────────────────────────────────

  const drawLine = (color = 200) => {
    doc.setDrawColor(color);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 4;
  };

  const addPageIfNeeded = (requiredSpace = 10) => {
    if (y + requiredSpace > pageHeight - 14) {
      // footer on current page
      drawFooter();
      doc.addPage();
      pageNumber++;
      y = 18;
      drawTableHeader();
    }
  };

  const drawFooter = () => {
    const footerY = pageHeight - 8;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160);
    doc.text(`Página ${pageNumber}`, pageWidth / 2, footerY, {
      align: "center",
    });
    doc.setTextColor(0);
  };

  // ── column layout ─────────────────────────────────────────────────────────
  // Ticket | Cliente | Fecha | Hora | Vendido por | Estado | Total
  const cols = {
    ticket: { x: marginX, w: 26 },
    customer: { x: marginX + 26, w: 62 },
    date: { x: marginX + 88, w: 34 },
    time: { x: marginX + 122, w: 22 },
    seller: { x: marginX + 144, w: 58 },
    status: { x: marginX + 202, w: 28 },
    total: { x: marginX + 230, w: contentWidth - 230 },
  };

  const drawTableHeader = () => {
    doc.setFillColor(245, 245, 245);
    doc.rect(marginX, y - 1, contentWidth, 8, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60);

    doc.text("Ticket", cols.ticket.x, y + 5);
    doc.text("Cliente", cols.customer.x, y + 5);
    doc.text("Fecha", cols.date.x, y + 5);
    doc.text("Hora", cols.time.x, y + 5);
    doc.text("Vendido por", cols.seller.x, y + 5);
    doc.text("Estado", cols.status.x, y + 5);
    doc.text("Total", pageWidth - marginX, y + 5, { align: "right" });

    doc.setTextColor(0);
    y += 9;
    doc.setDrawColor(200);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 2;
  };

  // ── HEADER ────────────────────────────────────────────────────────────────

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(getReportTitle(info), pageWidth / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(getReportSubtitle(info), pageWidth / 2, y, { align: "center" });
  y += 5;

  drawLine(180);

  // ── SUMMARY ROW ───────────────────────────────────────────────────────────

  const totalAmount = sales.reduce((sum, s) => sum + s.total, 0);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Total de ventas: ${sales.length}`, marginX, y);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Monto total: ${formatCurrency(totalAmount)}`,
    pageWidth - marginX,
    y,
    { align: "right" },
  );
  doc.setFont("helvetica", "normal");
  y += 6;

  drawLine(200);

  // ── TABLE ─────────────────────────────────────────────────────────────────

  drawTableHeader();

  const statusLabel: Record<string, string> = {
    completed: "Completada",
    cancelled: "Cancelada",
    pending: "Pendiente",
  };

  for (let i = 0; i < sales.length; i++) {
    addPageIfNeeded(9);

    const sale = sales[i];
    const rowY = y + 5;

    // zebra stripe
    if (i % 2 === 0) {
      doc.setFillColor(252, 252, 252);
      doc.rect(marginX, y, contentWidth, 8, "F");
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30);

    // Ticket — monospace feel with bold
    doc.setFont("helvetica", "bold");
    doc.text(String(sale.ticketNumber), cols.ticket.x, rowY);
    doc.setFont("helvetica", "normal");

    // Cliente — truncate if too long
    const customerText = doc.splitTextToSize(
      sale.customerFullName,
      cols.customer.w - 2,
    )[0];
    doc.text(customerText, cols.customer.x, rowY);

    doc.text(formatDate(sale.saleDate), cols.date.x, rowY);
    doc.text(formatTime(sale.saleTime), cols.time.x, rowY);

    const sellerText = doc.splitTextToSize(
      sale.sellerFullName,
      cols.seller.w - 2,
    )[0];
    doc.text(sellerText, cols.seller.x, rowY);

    // Status with color
    const status = sale.status as string;
    if (status === "completed") doc.setTextColor(22, 163, 74);
    else if (status === "cancelled") doc.setTextColor(220, 38, 38);
    else doc.setTextColor(202, 138, 4);
    doc.text(statusLabel[status] ?? status, cols.status.x, rowY);
    doc.setTextColor(30);

    // Total — right aligned, green
    doc.setTextColor(22, 163, 74);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(sale.total), pageWidth - marginX, rowY, {
      align: "right",
    });
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");

    y += 8;

    // subtle row separator
    doc.setDrawColor(235);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 0.5;
  }

  // ── GRAND TOTAL FOOTER ────────────────────────────────────────────────────

  addPageIfNeeded(14);
  y += 4;

  doc.setDrawColor(100);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, pageWidth - marginX, y);
  doc.setLineWidth(0.2);
  y += 5;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL GENERAL", marginX, y);
  doc.setTextColor(22, 163, 74);
  doc.text(formatCurrency(totalAmount), pageWidth - marginX, y, {
    align: "right",
  });
  doc.setTextColor(0);

  // footer last page
  drawFooter();

  // ── OUTPUT ────────────────────────────────────────────────────────────────

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
