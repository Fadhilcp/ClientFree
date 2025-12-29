import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

interface InvoicePdfData {
  invoiceNumber: string;
  type: string;
  amount: number;
  currency: string;
  date?: Date;
  direction: "credit" | "debit";
}

export function generateInvoicePdf(
  invoice: InvoicePdfData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = new PassThrough();
      const buffers: Buffer[] = [];

      // pipe PDF output
      doc.pipe(stream);

      // collect chunks
      stream.on("data", (chunk) => buffers.push(chunk));

      // 🔴 MUST be `finish`, not `end`
      stream.on("finish", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      /* =====================
         CONTENT
      ====================== */

      doc
        .fontSize(20)
        .text("INVOICE", { align: "center" })
        .moveDown();

      doc
        .fontSize(12)
        .text(`Invoice Number: ${invoice.invoiceNumber}`)
        .text(
          `Date: ${
            invoice.date
              ? invoice.date.toLocaleDateString()
              : "-"
          }`
        )
        .moveDown();

      doc
        .fontSize(12)
        .text(
          `Transaction Type: ${invoice.type
            .replace("_", " ")
            .toUpperCase()}`
        )
        .text(
          `Direction: ${
            invoice.direction === "credit" ? "Credit" : "Debit"
          }`
        )
        .moveDown();

      doc
        .fontSize(14)
        .text("Amount", { underline: true })
        .moveDown(0.5);

      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(`${invoice.currency} ${invoice.amount.toFixed(2)}`)
        .font("Helvetica")
        .moveDown();

      doc
        .fontSize(10)
        .text(
          "This is a system-generated invoice. No signature required.",
          { align: "center" }
        );

      // 🔴 REQUIRED
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
