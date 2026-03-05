import { jsPDF } from "jspdf";
import type { Sale } from "../domain/models/sale.model";
import { PaymentMethodLabels } from "../domain/models/payment-method.model";

const LOGO_BASE64 =
  "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";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);

const formatDate = (date: string): string =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date + "T00:00:00"));

const formatTime = (time: string): string => {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

function buildTicket(doc: jsPDF, sale: Sale): number {
  const PAGE_W = 80;
  const MARGIN = 5;
  const INNER_W = PAGE_W - MARGIN * 2;

  let y = MARGIN + 2;

  const drawLine = () => {
    doc.setLineDashPattern([], 0);
    doc.setLineWidth(0.2);
    doc.setDrawColor(150, 150, 150);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 3;
  };

  const drawDashedLine = () => {
    doc.setLineDashPattern([1, 1], 0);
    doc.setLineWidth(0.2);
    doc.setDrawColor(180, 180, 180);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    doc.setLineDashPattern([], 0);
    y += 3;
  };

  const center = (text: string, fontSize: number, bold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(text, PAGE_W / 2, y, { align: "center" });
    y += fontSize * 0.38 + 1.2;
  };

  const twoCol = (
    left: string,
    right: string,
    fontSize = 7,
    boldLeft = false,
    boldRight = false,
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", boldLeft ? "bold" : "normal");
    doc.text(left, MARGIN, y);
    doc.setFont("helvetica", boldRight ? "bold" : "normal");
    doc.text(right, PAGE_W - MARGIN, y, { align: "right" });
    y += fontSize * 0.38 + 1.5;
  };

  const logoW = 52;
  const logoH = 22;
  const logoX = (PAGE_W - logoW) / 2;
  doc.addImage(LOGO_BASE64, "JPEG", logoX, y, logoW, logoH);
  y += logoH + 2;

  center("RUC 20605178414", 6.5, true);
  center("BIOSALUD PATRON S.A.C.", 7, true);
  center("AV. AREQUIPA NRO. 1295 INT. 501 - LIMA", 6.5);
  center("LIMA - LIMA", 6.5);
  center("Telf : 989 093 766", 6.5);
  center("Email : biosaludpatron@gmail.com", 6.5);
  y += 1;
  drawLine();

  center("TICKET DE VENTA", 8, true);
  center(sale.ticketNumber, 13, true);
  y += 1;
  drawLine();

  twoCol(
    "F.Emision:",
    `${formatDate(sale.saleDate)} ${formatTime(sale.saleTime)}`,
  );
  twoCol("Cajero(a):", sale.sellerFullName);
  twoCol("Vendedor(a):", sale.sellerFullName);
  y += 0.5;
  drawLine();

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENTE :", MARGIN, y);
  doc.setFont("helvetica", "normal");
  doc.text(sale.customerFullName, MARGIN + 19, y);
  y += 4.5;

  twoCol("Nro. DOC:", sale.customerDni);

  if (sale.observation) {
    y += 0.5;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("Obs.:", MARGIN, y);
    doc.setFont("helvetica", "normal");
    const obsLines = doc.splitTextToSize(sale.observation, INNER_W - 14);
    doc.text(obsLines, MARGIN + 13, y);
    y += obsLines.length * 3.8 + 1;
  }

  y += 0.5;
  drawLine();

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text("Cant", MARGIN, y);
  doc.text("Descripcion", MARGIN + 11, y);
  doc.text("P.U", PAGE_W - MARGIN - 14, y, { align: "right" });
  doc.text("Importe", PAGE_W - MARGIN, y, { align: "right" });
  y += 4.5;
  drawDashedLine();

  for (const item of sale.items) {
    const fullName = `${item.productName} ${item.presentation}`;
    const nameLines = doc.splitTextToSize(fullName, INNER_W - 29);

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(String(item.quantity), MARGIN + 4, y, { align: "center" });
    doc.text(nameLines, MARGIN + 11, y);
    doc.text(formatCurrency(item.unitPrice), PAGE_W - MARGIN - 14, y, {
      align: "right",
    });
    doc.text(formatCurrency(item.lineTotal), PAGE_W - MARGIN, y, {
      align: "right",
    });

    y += nameLines.length * 3.8 + 2;
  }

  drawDashedLine();

  twoCol("Total a Pagar : S/", formatCurrency(sale.total), 7.5, false, true);
  y += 1;
  drawLine();

  twoCol("Total : S/", formatCurrency(sale.total), 7);
  twoCol("Descuento : S/", formatCurrency(0), 7);
  twoCol("Total a Pagar : S/", formatCurrency(sale.total), 7, false, true);
  y += 1;
  drawLine();

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Forma de Pago: Contado", MARGIN, y);
  y += 5;

  center("Metodo Pago.", 7, true);

  for (const payment of sale.payments) {
    const label = PaymentMethodLabels[payment.method] ?? String(payment.method);
    twoCol(
      `${label.toUpperCase()} S/`,
      formatCurrency(payment.amount),
      7,
      true,
      true,
    );
  }

  y += 1;
  drawLine();

  y += 1;
  center("!NO HAY CAMBIOS NI DEVOLUCIONES!", 6.5, true);
  y += 0.5;
  center("!GRACIAS POR SU COMPRA!", 7.5, true);
  y += 2;
  center("Este documento no tiene valor tributario", 6);

  y += MARGIN;

  return y;
}

export function generateSaleTicketPdf(sale: Sale): void {
  const PAGE_W = 80;

  const measureDoc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [PAGE_W, 500],
  });

  const totalHeight = buildTicket(measureDoc, sale);

  const finalDoc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [PAGE_W, totalHeight],
  });

  buildTicket(finalDoc, sale);

  const blob = finalDoc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
