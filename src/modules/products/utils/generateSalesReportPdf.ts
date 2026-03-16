import jsPDF from "jspdf";
import type { StockReport } from "../domain/models/stock-report.model";

const COLOR = {
  primary: [37, 99, 235] as [number, number, number],
  primaryLight: [239, 246, 255] as [number, number, number],
  headerBg: [30, 58, 138] as [number, number, number],
  headerText: [255, 255, 255] as [number, number, number],
  rowAlt: [248, 250, 252] as [number, number, number],
  rowNormal: [255, 255, 255] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  textDark: [15, 23, 42] as [number, number, number],
  textMid: [71, 85, 105] as [number, number, number],
  textLight: [148, 163, 184] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  greenBg: [240, 253, 244] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  redBg: [254, 242, 242] as [number, number, number],
  accent: [99, 102, 241] as [number, number, number],
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

const buildCols = (
  pageWidth: number,
  isSingleDay: boolean,
): {
  label: string;
  x: number;
  w: number;
  align: "left" | "center" | "right";
}[] => {
  const usable = pageWidth - MARGIN * 2;

  if (isSingleDay) {
    return [
      { label: "Producto", x: MARGIN, w: usable * 0.4, align: "left" },
      {
        label: "Stock Inicial",
        x: MARGIN + usable * 0.4,
        w: usable * 0.15,
        align: "center",
      },
      {
        label: "Entradas",
        x: MARGIN + usable * 0.55,
        w: usable * 0.15,
        align: "center",
      },
      {
        label: "Ventas",
        x: MARGIN + usable * 0.7,
        w: usable * 0.15,
        align: "center",
      },
      {
        label: "Stock Final",
        x: MARGIN + usable * 0.85,
        w: usable * 0.15,
        align: "center",
      },
    ];
  }

  return [
    { label: "Producto", x: MARGIN, w: usable * 0.35, align: "left" },
    {
      label: "Fecha",
      x: MARGIN + usable * 0.35,
      w: usable * 0.12,
      align: "center",
    },
    {
      label: "Stock Inicial",
      x: MARGIN + usable * 0.47,
      w: usable * 0.13,
      align: "center",
    },
    {
      label: "Entradas",
      x: MARGIN + usable * 0.6,
      w: usable * 0.13,
      align: "center",
    },
    {
      label: "Ventas",
      x: MARGIN + usable * 0.73,
      w: usable * 0.13,
      align: "center",
    },
    {
      label: "Stock Final",
      x: MARGIN + usable * 0.86,
      w: usable * 0.14,
      align: "center",
    },
  ];
};

export function generateStockReportPdf(
  report: StockReport[],
  from: string,
  to: string,
) {
  const isSingleDay = from === to;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const cols = buildCols(pageWidth, isSingleDay);

  const ROW_H = 9;
  const HEADER_ROW_H = 10;

  let y = 0;
  let pageNumber = 1;

  const drawPageHeader = () => {
    setFill(doc, COLOR.headerBg);
    doc.rect(0, 0, pageWidth, 18, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    setTextColor(doc, COLOR.headerText);
    doc.text("REPORTE DE STOCK", MARGIN, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setTextColor(doc, [186, 230, 253]);

    const subtitle = isSingleDay
      ? `Día: ${formatDateLong(from)}`
      : `Período: ${formatDate(from)} — ${formatDate(to)}`;

    doc.text(subtitle, MARGIN, 15.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor(doc, [186, 230, 253]);
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

  const drawColumnHeaders = () => {
    setFill(doc, COLOR.primary);
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

      doc.text(col.label.toUpperCase(), textX, y + 6.5, {
        align: col.align,
      });
    }

    y += HEADER_ROW_H;
  };

  const drawSummary = () => {
    const totalEntries = report.reduce((s, r) => s + r.entries, 0);
    const totalSold = report.reduce((s, r) => s + r.sold, 0);
    const avgInitial =
      report.length > 0
        ? Math.round(
            report.reduce((s, r) => s + r.initialStock, 0) / report.length,
          )
        : 0;
    const avgFinal =
      report.length > 0
        ? Math.round(
            report.reduce((s, r) => s + r.finalStock, 0) / report.length,
          )
        : 0;

    // Check space
    if (y + 24 > pageHeight - 10) {
      doc.addPage();
      pageNumber++;
      drawPageHeader();
    }

    y += 6;

    setFill(doc, COLOR.primaryLight);
    setDraw(doc, COLOR.primary);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, y, pageWidth - MARGIN * 2, 18, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTextColor(doc, COLOR.primary);
    doc.text("RESUMEN DEL PERÍODO", MARGIN + 4, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor(doc, COLOR.textMid);

    const summaryItems = [
      { label: "Productos", value: String(report.length) },
      { label: "Total entradas", value: `+${totalEntries}` },
      { label: "Total ventas", value: `-${totalSold}` },
      { label: "Stock inicial promedio", value: String(avgInitial) },
      { label: "Stock final promedio", value: String(avgFinal) },
    ];

    const itemW = (pageWidth - MARGIN * 2 - 4) / summaryItems.length;

    summaryItems.forEach((item, i) => {
      const ix = MARGIN + 4 + i * itemW;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setTextColor(doc, COLOR.textDark);
      doc.text(item.value, ix, y + 13);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      setTextColor(doc, COLOR.textLight);
      doc.text(item.label, ix, y + 17);
    });

    y += 24;
  };

  const drawRow = (item: StockReport, rowIndex: number) => {
    const isAlt = rowIndex % 2 === 1;
    setFill(doc, isAlt ? COLOR.rowAlt : COLOR.rowNormal);
    doc.rect(MARGIN, y, pageWidth - MARGIN * 2, ROW_H, "F");

    setDraw(doc, COLOR.border);
    doc.setLineWidth(0.1);
    doc.line(MARGIN, y + ROW_H, pageWidth - MARGIN, y + ROW_H);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTextColor(doc, COLOR.textDark);
    const nameCol = cols[0];

    const maxChars = Math.floor(nameCol.w / 2.1);
    const name =
      item.productName.length > maxChars
        ? item.productName.slice(0, maxChars - 1) + "…"
        : item.productName;
    doc.text(name, nameCol.x + 2, y + 5.8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    setTextColor(doc, COLOR.textLight);
    doc.text(`#${item.productId}`, nameCol.x + 2, y + 8.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    setTextColor(doc, COLOR.textLight);
    doc.text(`#${item.productId}`, nameCol.x + 2, y + 8.2);

    let colOffset = 1;

    if (!isSingleDay) {
      const dateCol = cols[colOffset++];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setTextColor(doc, COLOR.textMid);
      doc.text(formatDate(item.date), dateCol.x + dateCol.w / 2, y + 5.8, {
        align: "center",
      });
    }

    const initCol = cols[colOffset++];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor(doc, COLOR.textMid);
    doc.text(String(item.initialStock), initCol.x + initCol.w / 2, y + 5.8, {
      align: "center",
    });

    const entryCol = cols[colOffset++];
    if (item.entries > 0) {
      const bw = 14;
      const bx = entryCol.x + entryCol.w / 2 - bw / 2;
      setFill(doc, COLOR.greenBg);
      doc.roundedRect(bx, y + 1.5, bw, 6, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      setTextColor(doc, COLOR.green);
      doc.text(`+${item.entries}`, entryCol.x + entryCol.w / 2, y + 5.8, {
        align: "center",
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setTextColor(doc, COLOR.textLight);
      doc.text("0", entryCol.x + entryCol.w / 2, y + 5.8, { align: "center" });
    }

    const soldCol = cols[colOffset++];
    if (item.sold > 0) {
      const bw = 14;
      const bx = soldCol.x + soldCol.w / 2 - bw / 2;
      setFill(doc, COLOR.redBg);
      doc.roundedRect(bx, y + 1.5, bw, 6, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      setTextColor(doc, COLOR.red);
      doc.text(`-${item.sold}`, soldCol.x + soldCol.w / 2, y + 5.8, {
        align: "center",
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setTextColor(doc, COLOR.textLight);
      doc.text("0", soldCol.x + soldCol.w / 2, y + 5.8, { align: "center" });
    }

    const finalCol = cols[colOffset];
    const diff = item.finalStock - item.initialStock;
    const finalColor =
      diff > 0 ? COLOR.green : diff < 0 ? COLOR.red : COLOR.textDark;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTextColor(doc, finalColor);
    doc.text(String(item.finalStock), finalCol.x + finalCol.w / 2, y + 5.8, {
      align: "center",
    });

    y += ROW_H;
  };

  const drawTableBorder = (startY: number, endY: number) => {
    setDraw(doc, COLOR.border);
    doc.setLineWidth(0.3);
    doc.rect(MARGIN, startY, pageWidth - MARGIN * 2, endY - startY);
  };
  drawPageHeader();
  drawColumnHeaders();
  const tableStartY = y;

  report.forEach((item, index) => {
    if (y + ROW_H > pageHeight - 16) {
      drawTableBorder(tableStartY, y);
      doc.addPage();
      pageNumber++;
      drawPageHeader();
      drawColumnHeaders();
    }
    drawRow(item, index);
  });

  drawTableBorder(tableStartY, y);
  drawSummary();

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
