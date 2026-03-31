import { jsPDF } from "jspdf";
import type { SalesTimelineByDay } from "../domain/models/sales-timeline.model";
import { getTopSeller } from "../presentation/pages/SalesTimelinePage";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);

const formatDate = (date: string): string => {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const formatMonth = (year: number, month: number): string =>
  new Intl.DateTimeFormat("es-PE", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1));

const formatTime = (time: string): string => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  YAPE: "Yape",
  PLIN: "Plin",
};

export function generateSalesTimelinePdf(
  timeline: SalesTimelineByDay[],
  year: number,
  month: number,
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  const drawLine = (thickness = 0.2, color = 200) => {
    doc.setDrawColor(color);
    doc.setLineWidth(thickness);
    doc.line(10, y, pageWidth - 10, y);
    y += 4;
  };

  const addPageIfNeeded = (needed = 12) => {
    if (y > 280 - needed) {
      doc.addPage();
      y = 18;
    }
  };

  // ── ENCABEZADO ──────────────────────────────────────────────────────────────
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LÍNEA DE TIEMPO DE VENTAS", pageWidth / 2, y, { align: "center" });

  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Período: ${formatMonth(year, month)}`, pageWidth / 2, y, {
    align: "center",
  });

  y += 5;

  // Estadísticas globales
  const grandTotal = timeline.reduce(
    (sum, day) =>
      sum +
      day.blocks.reduce(
        (s, block) => s + block.sales.reduce((ss, sale) => ss + sale.total, 0),
        0,
      ),
    0,
  );
  const totalSales = timeline.reduce(
    (sum, day) => sum + day.blocks.reduce((s, b) => s + b.sales.length, 0),
    0,
  );

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    `${timeline.length} día(s)  ·  ${totalSales} venta(s)  ·  Total: ${formatCurrency(grandTotal)}`,
    pageWidth / 2,
    y,
    { align: "center" },
  );
  doc.setTextColor(0);

  y += 7;

  // ── VENDEDOR DEL MES ────────────────────────────────────────────────────────
  const topSeller = getTopSeller(timeline);
  if (topSeller) {
    // Caja destacada
    doc.setFillColor(255, 251, 235); // amber-50
    doc.setDrawColor(253, 191, 74); // amber-300
    doc.setLineWidth(0.4);
    doc.roundedRect(10, y, pageWidth - 20, 14, 2, 2, "FD");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 120, 0);
    doc.text("★  VENDEDOR DEL MES", 16, y + 5);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text(topSeller.name, 16, y + 10.5);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(
      `${topSeller.salesCount} ventas  ·  ${formatCurrency(topSeller.total)}`,
      pageWidth - 14,
      y + 10.5,
      { align: "right" },
    );

    doc.setTextColor(0);
    y += 18;
  }

  drawLine(0.5, 60);

  // ── DÍAS ────────────────────────────────────────────────────────────────────
  for (const day of timeline) {
    addPageIfNeeded(20);

    const dayTotal = day.blocks.reduce(
      (sum, block) => sum + block.sales.reduce((s, sale) => s + sale.total, 0),
      0,
    );
    const daySales = day.blocks.reduce((s, b) => s + b.sales.length, 0);

    // Cabecera del día
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(10, y - 1, pageWidth - 20, 8, 1, 1, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);

    const dateLabel = formatDate(day.date);
    const dateCapitalized =
      dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
    doc.text(dateCapitalized, 14, y + 4.5);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`${daySales} venta(s)`, pageWidth / 2, y + 4.5, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text(formatCurrency(dayTotal), pageWidth - 14, y + 4.5, {
      align: "right",
    });

    y += 12;

    // ── BLOQUES DE VENDEDOR ────────────────────────────────────────────────
    for (const block of day.blocks) {
      addPageIfNeeded(14);

      const blockTotal = block.sales.reduce((s, sale) => s + sale.total, 0);
      const isTop = topSeller?.name === block.sellerFullName;

      // Fila vendedor — destacar si es el top seller
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(isTop ? 180 : 60, isTop ? 120 : 60, isTop ? 0 : 60);
      doc.text(`${isTop ? "★" : "▸"} ${block.sellerFullName}`, 14, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(120);
      doc.text(
        `${block.sales.length} venta(s)  ·  ${formatCurrency(blockTotal)}`,
        pageWidth - 14,
        y,
        { align: "right" },
      );
      doc.setTextColor(0);

      y += 5;

      // ── VENTAS DEL BLOQUE ────────────────────────────────────────────────
      for (const sale of block.sales) {
        addPageIfNeeded(10);

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30);
        doc.text(`${formatTime(sale.saleTime)}  #${sale.ticketNumber}`, 18, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        doc.text(sale.customerFullName, pageWidth / 2, y, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setTextColor(30);
        doc.text(formatCurrency(sale.total), pageWidth - 14, y, {
          align: "right",
        });

        y += 4;

        // Productos
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);

        for (const item of sale.items) {
          addPageIfNeeded(5);
          doc.text(
            `${item.quantity}x ${item.productName} (${item.presentation})`,
            22,
            y,
          );
          doc.text(formatCurrency(item.lineTotal), pageWidth - 14, y, {
            align: "right",
          });
          y += 3.5;
        }

        // Pagos
        const paymentsText = sale.payments
          .map(
            (p) =>
              `${PAYMENT_LABELS[p.method] ?? p.method}: ${formatCurrency(p.amount)}`,
          )
          .join("  ·  ");

        doc.setFontSize(7);
        doc.setTextColor(130);
        doc.text(paymentsText, 22, y);

        y += 5;

        // Separador sutil entre ventas
        doc.setDrawColor(230);
        doc.setLineWidth(0.1);
        doc.line(18, y - 1.5, pageWidth - 14, y - 1.5);
      }

      y += 2;
    }

    y += 3;
    drawLine(0.4, 180);
  }

  // ── TOTAL GENERAL ───────────────────────────────────────────────────────────
  addPageIfNeeded(14);
  y += 2;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("TOTAL GENERAL", 10, y);
  doc.text(formatCurrency(grandTotal), pageWidth - 10, y, { align: "right" });

  // Abrir en nueva pestaña
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
