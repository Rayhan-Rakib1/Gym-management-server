"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoiceNumber = generateInvoiceNumber;
const prisma_1 = __importDefault(require("../shared/prisma"));
async function generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const prefix = `INV${year}${month}`;
    // Get last invoice for current month
    const lastInvoice = await prisma_1.default.payment.findFirst({
        where: {
            invoiceNumber: {
                startsWith: prefix,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    let nextNumber = 1;
    if (lastInvoice) {
        const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-4));
        nextNumber = lastNumber + 1;
    }
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}
