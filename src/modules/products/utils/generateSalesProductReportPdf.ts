import { jsPDF } from "jspdf";
import type { SalesReport } from "../domain/models/sales-report.model";

// ─── Colors ────────────────────────────────────────────────────────────────
const COLOR = {
  headerBg: [21, 128, 61] as [number, number, number], // green-700
  headerText: [255, 255, 255] as [number, number, number],
  colHeader: [22, 163, 74] as [number, number, number], // green-600
  rowAlt: [240, 253, 244] as [number, number, number], // green-50
  rowNormal: [255, 255, 255] as [number, number, number],
  border: [187, 247, 208] as [number, number, number], // green-200
  textDark: [15, 23, 42] as [number, number, number],
  textMid: [71, 85, 105] as [number, number, number],
  textLight: [148, 163, 184] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  greenBg: [240, 253, 244] as [number, number, number],
  greenDark: [21, 128, 61] as [number, number, number],
  footerBg: [220, 252, 231] as [number, number, number], // green-100
};

const setFill = (doc: jsPDF, rgb: [number, number, number]) =>
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);

const setDraw = (doc: jsPDF, rgb: [number, number, number]) =>
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);

const setTextColor = (doc: jsPDF, rgb: [number, number, number]) =>
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const formatDateLong = (dateStr: string): string =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr + "T00:00:00"));

const MARGIN = 14;
const ROW_H = 10;
const HEADER_ROW_H = 10;

const buildCols = (
  pageWidth: number,
): {
  label: string;
  x: number;
  w: number;
  align: "left" | "center" | "right";
}[] => {
  const usable = pageWidth - MARGIN * 2;
  return [
    { label: "Producto", x: MARGIN, w: usable * 0.5, align: "left" },
    {
      label: "Período",
      x: MARGIN + usable * 0.5,
      w: usable * 0.3,
      align: "center",
    },
    {
      label: "Unidades Vendidas",
      x: MARGIN + usable * 0.8,
      w: usable * 0.2,
      align: "center",
    },
  ];
};

export function generateSalesProductReportPdf(
  report: SalesReport[],
  from: string,
  to: string,
) {
  const isSingleDay = from === to;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const cols = buildCols(pageWidth);

  let y = 0;
  let pageNumber = 1;

  const formatPeriod = (f: string, t: string) =>
    isSingleDay ? formatDate(f) : `${formatDate(f)} – ${formatDate(t)}`;

  // ── Page header ─────────────────────────────────────────────────────────
  const drawPageHeader = () => {
    setFill(doc, COLOR.headerBg);
    doc.rect(0, 0, pageWidth, 18, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    setTextColor(doc, COLOR.headerText);
    doc.text("REPORTE DE VENTAS POR PRODUCTO", MARGIN, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setTextColor(doc, [187, 247, 208]); // green-200

    const subtitle = isSingleDay
      ? `Día: ${formatDateLong(from)}`
      : `Período: ${formatDate(from)} — ${formatDate(to)}`;

    doc.text(subtitle, MARGIN, 15.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor(doc, [187, 247, 208]);
    doc.text(`Página ${pageNumber}`, pageWidth - MARGIN, 11, {
      align: "right",
    });

    const now = new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    doc.text(`Generado: ${now}`, pageWidth - MARGIN, 15.5, { align: "right" });

    y = 24;
  };

  // ── Column headers ───────────────────────────────────────────────────────
  const drawColumnHeaders = () => {
    setFill(doc, COLOR.colHeader);
    doc.rect(MARGIN, y, pageWidth - MARGIN * 2, HEADER_ROW_H, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTextColor(doc, COLOR.headerText);

    for (const col of cols) {
      const textX =
        col.align === "center"
          ? col.x + col.w / 2
          : col.align === "right"
            ? col.x + col.w - 2
            : col.x + 2;
      doc.text(col.label.toUpperCase(), textX, y + 6.5, { align: col.align });
    }

    y += HEADER_ROW_H;
  };

  // ── Summary box ──────────────────────────────────────────────────────────
  const drawSummary = (totalQuantity: number) => {
    if (y + 22 > pageHeight - 10) {
      doc.addPage();
      pageNumber++;
      drawPageHeader();
    }

    y += 6;

    setFill(doc, COLOR.footerBg);
    setDraw(doc, COLOR.colHeader);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, y, pageWidth - MARGIN * 2, 16, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTextColor(doc, COLOR.greenDark);
    doc.text("RESUMEN", MARGIN + 4, y + 6);

    const items = [
      { label: "Productos", value: String(report.length) },
      { label: "Total unidades vendidas", value: String(totalQuantity) },
      {
        label: "Promedio por producto",
        value:
          report.length > 0 ? (totalQuantity / report.length).toFixed(1) : "0",
      },
    ];

    const itemW = (pageWidth - MARGIN * 2 - 4) / items.length;
    items.forEach((item, i) => {
      const ix = MARGIN + 4 + i * itemW;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      setTextColor(doc, COLOR.textDark);
      doc.text(item.value, ix, y + 11);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      setTextColor(doc, COLOR.textLight);
      doc.text(item.label, ix, y + 15);
    });

    y += 22;
  };

  // ── Data row ─────────────────────────────────────────────────────────────
  const drawRow = (item: SalesReport, rowIndex: number) => {
    const isAlt = rowIndex % 2 === 1;
    setFill(doc, isAlt ? COLOR.rowAlt : COLOR.rowNormal);
    doc.rect(MARGIN, y, pageWidth - MARGIN * 2, ROW_H, "F");

    setDraw(doc, COLOR.border);
    doc.setLineWidth(0.1);
    doc.line(MARGIN, y + ROW_H, pageWidth - MARGIN, y + ROW_H);

    // Product name
    const nameCol = cols[0];
    const maxChars = Math.floor(nameCol.w / 2.1);
    const name =
      item.productName.length > maxChars
        ? item.productName.slice(0, maxChars - 1) + "…"
        : item.productName;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTextColor(doc, COLOR.textDark);
    doc.text(name, nameCol.x + 2, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    setTextColor(doc, COLOR.textLight);
    doc.text(`#${item.productId}`, nameCol.x + 2, y + 8.5);

    // Period
    const periodCol = cols[1];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor(doc, COLOR.textMid);
    doc.text(
      formatPeriod(item.from, item.to),
      periodCol.x + periodCol.w / 2,
      y + 6.2,
      { align: "center" },
    );

    // Quantity badge
    const qtyCol = cols[2];
    if (item.quantity > 0) {
      const bw = 16;
      const bx = qtyCol.x + qtyCol.w / 2 - bw / 2;
      setFill(doc, COLOR.greenBg);
      doc.roundedRect(bx, y + 1.5, bw, 7, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setTextColor(doc, COLOR.green);
      doc.text(String(item.quantity), qtyCol.x + qtyCol.w / 2, y + 6.5, {
        align: "center",
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setTextColor(doc, COLOR.textLight);
      doc.text("0", qtyCol.x + qtyCol.w / 2, y + 6.2, { align: "center" });
    }

    y += ROW_H;
  };

  // ── Total row ────────────────────────────────────────────────────────────
  const drawTotalRow = (totalQuantity: number) => {
    setFill(doc, COLOR.footerBg);
    doc.rect(MARGIN, y, pageWidth - MARGIN * 2, ROW_H, "F");

    setDraw(doc, COLOR.colHeader);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
    doc.line(MARGIN, y + ROW_H, pageWidth - MARGIN, y + ROW_H);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTextColor(doc, COLOR.greenDark);
    doc.text("TOTAL", cols[0].x + 2, y + 6.2);

    const qtyCol = cols[2];
    const bw = 20;
    const bx = qtyCol.x + qtyCol.w / 2 - bw / 2;
    setFill(doc, COLOR.colHeader);
    doc.roundedRect(bx, y + 1.5, bw, 7, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setTextColor(doc, [255, 255, 255]);
    doc.text(String(totalQuantity), qtyCol.x + qtyCol.w / 2, y + 6.5, {
      align: "center",
    });

    y += ROW_H;
  };

  const drawTableBorder = (startY: number, endY: number) => {
    setDraw(doc, COLOR.border);
    doc.setLineWidth(0.3);
    doc.rect(MARGIN, startY, pageWidth - MARGIN * 2, endY - startY);
  };

  // ── Build document ───────────────────────────────────────────────────────
  const totalQuantity = report.reduce((s, r) => s + r.quantity, 0);

  drawPageHeader();
  drawColumnHeaders();
  const tableStartY = y;

  report.forEach((item, index) => {
    if (y + ROW_H > pageHeight - 20) {
      drawTableBorder(tableStartY, y);
      doc.addPage();
      pageNumber++;
      drawPageHeader();
      drawColumnHeaders();
    }
    drawRow(item, index);
  });

  if (y + ROW_H <= pageHeight - 10) {
    drawTotalRow(totalQuantity);
  }

  drawTableBorder(tableStartY, y);
  drawSummary(totalQuantity);

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
