"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePdf = generateInvoicePdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
const stream_1 = require("stream");
function generateInvoicePdf(invoice) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
            const stream = new stream_1.PassThrough();
            const buffers = [];
            doc.pipe(stream);
            stream.on("data", (chunk) => buffers.push(chunk));
            stream.on("finish", () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            //const
            doc
                .fontSize(20)
                .text("INVOICE", { align: "center" })
                .moveDown();
            doc
                .fontSize(12)
                .text(`Invoice Number: ${invoice.invoiceNumber}`)
                .text(`Date: ${invoice.date
                ? invoice.date.toLocaleDateString()
                : "-"}`)
                .moveDown();
            doc
                .fontSize(12)
                .text(`Transaction Type: ${invoice.type
                .replace("_", " ")
                .toUpperCase()}`)
                .text(`Direction: ${invoice.direction === "credit" ? "Credit" : "Debit"}`)
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
                .text("This is a system-generated invoice. No signature required.", { align: "center" });
            doc.end();
        }
        catch (err) {
            reject(err);
        }
    });
}
