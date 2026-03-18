import { jsPDF } from "jspdf";
import type { EntriesReport } from "../domain/models/entries-report.model";

const C = {
  headerBg: [55, 48, 163] as [number, number, number],
  colHeader: [79, 70, 229] as [number, number, number],
  headerTxt: [255, 255, 255] as [number, number, number],
  rowAlt: [238, 242, 255] as [number, number, number],
  rowNorm: [255, 255, 255] as [number, number, number],
  border: [199, 210, 254] as [number, number, number],
  textDark: [15, 23, 42] as [number, number, number],
  textMid: [71, 85, 105] as [number, number, number],
  textLight: [148, 163, 184] as [number, number, number],
  indigo: [79, 70, 229] as [number, number, number],
  indigoBg: [238, 242, 255] as [number, number, number],
  indigoDark: [55, 48, 163] as [number, number, number],
  footerBg: [224, 231, 255] as [number, number, number],
};

const sf = (d: jsPDF, c: [number, number, number]) =>
  d.setFillColor(c[0], c[1], c[2]);
const sd = (d: jsPDF, c: [number, number, number]) =>
  d.setDrawColor(c[0], c[1], c[2]);
const st = (d: jsPDF, c: [number, number, number]) =>
  d.setTextColor(c[0], c[1], c[2]);

const fmtDate = (s: string) => {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};
const fmtLong = (s: string) =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(s + "T00:00:00"));

const MARGIN = 14;
const ROW_H = 10;
const HDR_H = 10;

const buildCols = (pw: number) => {
  const u = pw - MARGIN * 2;
  return [
    { label: "Producto", x: MARGIN, w: u * 0.52, align: "left" as const },
    {
      label: "Período",
      x: MARGIN + u * 0.52,
      w: u * 0.28,
      align: "center" as const,
    },
    {
      label: "Unidades Ingresadas",
      x: MARGIN + u * 0.8,
      w: u * 0.2,
      align: "center" as const,
    },
  ];
};

const fmtPeriod = (from: string, to: string) =>
  from === to ? fmtDate(from) : `${fmtDate(from)} – ${fmtDate(to)}`;

export function generateEntriesReportPdf(
  report: EntriesReport[],
  from: string,
  to: string,
) {
  const isSingleDay = from === to;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const cols = buildCols(pw);
  let y = 0;
  let page = 1;

  // ── Page header ──────────────────────────────────────────────────────────
  const drawHeader = () => {
    sf(doc, C.headerBg);
    doc.rect(0, 0, pw, 18, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    st(doc, C.headerTxt);
    doc.text("REPORTE DE ENTRADAS DE PRODUCTOS", MARGIN, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    st(doc, [199, 210, 254] as [number, number, number]);
    const sub = isSingleDay
      ? `Día: ${fmtLong(from)}`
      : `Período: ${fmtDate(from)} — ${fmtDate(to)}`;
    doc.text(sub, MARGIN, 15.5);

    st(doc, [199, 210, 254] as [number, number, number]);
    doc.setFontSize(8);
    doc.text(`Página ${page}`, pw - MARGIN, 11, { align: "right" });
    const now = new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    doc.text(`Generado: ${now}`, pw - MARGIN, 15.5, { align: "right" });

    y = 24;
  };

  const drawColHeaders = () => {
    sf(doc, C.colHeader);
    doc.rect(MARGIN, y, pw - MARGIN * 2, HDR_H, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    st(doc, C.headerTxt);
    for (const col of cols) {
      const tx = col.align === "center" ? col.x + col.w / 2 : col.x + 2;
      doc.text(col.label.toUpperCase(), tx, y + 6.5, { align: col.align });
    }
    y += HDR_H;
  };

  const drawSummary = (total: number) => {
    if (y + 22 > ph - 10) {
      doc.addPage();
      page++;
      drawHeader();
    }
    y += 6;
    sf(doc, C.footerBg);
    sd(doc, C.colHeader);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, y, pw - MARGIN * 2, 16, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    st(doc, C.indigoDark);
    doc.text("RESUMEN", MARGIN + 4, y + 6);

    const items = [
      { label: "Productos", value: String(report.length) },
      { label: "Total ingresado", value: `+${total}` },
      {
        label: "Promedio por producto",
        value: report.length > 0 ? (total / report.length).toFixed(1) : "0",
      },
    ];
    const iw = (pw - MARGIN * 2 - 4) / items.length;
    items.forEach((item, i) => {
      const ix = MARGIN + 4 + i * iw;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      st(doc, C.textDark);
      doc.text(item.value, ix, y + 11);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      st(doc, C.textLight);
      doc.text(item.label, ix, y + 15);
    });
    y += 22;
  };

  // ── Data row ─────────────────────────────────────────────────────────────
  const drawRow = (item: EntriesReport, idx: number) => {
    sf(doc, idx % 2 === 1 ? C.rowAlt : C.rowNorm);
    doc.rect(MARGIN, y, pw - MARGIN * 2, ROW_H, "F");
    sd(doc, C.border);
    doc.setLineWidth(0.1);
    doc.line(MARGIN, y + ROW_H, pw - MARGIN, y + ROW_H);

    // Name
    const nc = cols[0];
    const maxChars = Math.floor(nc.w / 2.1);
    const name =
      item.productName.length > maxChars
        ? item.productName.slice(0, maxChars - 1) + "…"
        : item.productName;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    st(doc, C.textDark);
    doc.text(name, nc.x + 2, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    st(doc, C.textLight);
    doc.text(`#${item.productId}`, nc.x + 2, y + 8.5);

    // Period
    const pc = cols[1];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    st(doc, C.textMid);
    doc.text(fmtPeriod(item.from, item.to), pc.x + pc.w / 2, y + 6.2, {
      align: "center",
    });

    // Quantity badge
    const qc = cols[2];
    if (item.quantity > 0) {
      const bw = 18;
      const bx = qc.x + qc.w / 2 - bw / 2;
      sf(doc, C.indigoBg);
      doc.roundedRect(bx, y + 1.5, bw, 7, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      st(doc, C.indigo);
      doc.text(`+${item.quantity}`, qc.x + qc.w / 2, y + 6.5, {
        align: "center",
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      st(doc, C.textLight);
      doc.text("0", qc.x + qc.w / 2, y + 6.2, { align: "center" });
    }
    y += ROW_H;
  };

  // ── Total row ────────────────────────────────────────────────────────────
  const drawTotalRow = (total: number) => {
    sf(doc, C.footerBg);
    doc.rect(MARGIN, y, pw - MARGIN * 2, ROW_H, "F");
    sd(doc, C.colHeader);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, pw - MARGIN, y);
    doc.line(MARGIN, y + ROW_H, pw - MARGIN, y + ROW_H);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    st(doc, C.indigoDark);
    doc.text("TOTAL", cols[0].x + 2, y + 6.2);

    const qc = cols[2];
    const bw = 22;
    const bx = qc.x + qc.w / 2 - bw / 2;
    sf(doc, C.colHeader);
    doc.roundedRect(bx, y + 1.5, bw, 7, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    st(doc, [255, 255, 255] as [number, number, number]);
    doc.text(`+${total}`, qc.x + qc.w / 2, y + 6.5, { align: "center" });
    y += ROW_H;
  };

  const drawBorder = (sy: number, ey: number) => {
    sd(doc, C.border);
    doc.setLineWidth(0.3);
    doc.rect(MARGIN, sy, pw - MARGIN * 2, ey - sy);
  };

  const total = report.reduce((s, r) => s + r.quantity, 0);
  drawHeader();
  drawColHeaders();
  const tableStart = y;

  report.forEach((item, idx) => {
    if (y + ROW_H > ph - 20) {
      drawBorder(tableStart, y);
      doc.addPage();
      page++;
      drawHeader();
      drawColHeaders();
    }
    drawRow(item, idx);
  });

  if (y + ROW_H <= ph - 10) drawTotalRow(total);
  drawBorder(tableStart, y);
  drawSummary(total);

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
