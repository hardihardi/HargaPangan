import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { prisma } from "../config/prisma";

export type ReportFormat = "pdf" | "xlsx";

export interface CommodityReportFilter {
  commodityId: number;
  provinceId?: number;
  startDate: Date;
  endDate: Date;
}

export async function generateWeeklyReport(filter: CommodityReportFilter) {
  const { commodityId, provinceId, startDate, endDate } = filter;

  const prices = await prisma.dailyPrice.findMany({
    where: {
      commodityId,
      provinceId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: [{ date: "asc" }],
    include: {
      province: true,
      regency: true,
      commodity: true,
    },
  });

  return prices;
}

export async function exportReportToPdf(
  filter: CommodityReportFilter,
): Promise<Buffer> {
  const prices = await generateWeeklyReport(filter);

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk as Buffer));

  const title = "Laporan Harga Komoditas";
  doc.fontSize(16).text(title, { align: "center" });
  doc.moveDown();

  if (prices[0]) {
    doc
      .fontSize(12)
      .text(
        `Komoditas: ${prices[0].commodity.name} (${prices[0].commodity.unit})`,
      );
  }
  doc
    .fontSize(10)
    .text(
      `Periode: ${filter.startDate.toISOString().slice(0, 10)} s/d ${filter.endDate.toISOString().slice(0, 10)}`,
    );
  doc.moveDown();

  doc.fontSize(10).text("Tanggal        Provinsi / Kab/Kota             Harga", {
    underline: true,
  });

  for (const row of prices) {
    const line = `${row.date.toISOString().slice(0, 10)}   ${row.province.name} / ${
      row.regency.name
    }   Rp${Number(row.price).toLocaleString("id-ID")}`;
    doc.text(line);
  }

  doc.end();

  return await new Promise<Buffer>((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(chunks))),
  );
}

export async function exportReportToExcel(
  filter: CommodityReportFilter,
): Promise<Buffer> {
  const prices = await generateWeeklyReport(filter);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Laporan Harga");

  sheet.columns = [
    { header: "Tanggal", key: "date", width: 15 },
    { header: "Provinsi", key: "province", width: 20 },
    { header: "Kabupaten/Kota", key: "regency", width: 25 },
    { header: "Komoditas", key: "commodity", width: 25 },
    { header: "Harga", key: "price", width: 15 },
    { header: "Satuan", key: "unit", width: 10 },
  ];

  for (const row of prices) {
    sheet.addRow({
      date: row.date,
      province: row.province.name,
      regency: row.regency.name,
      commodity: row.commodity.name,
      price: Number(row.price),
      unit: row.commodity.unit,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}