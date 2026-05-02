"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = require("../../../utils/sendResponse");
class PaymentController {
}
exports.PaymentController = PaymentController;
_a = PaymentController;
PaymentController.getAllPayments = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await payment_service_1.PaymentService.getAllPayments(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Payments retrieved successfully',
        data: result.payments,
        meta: result.pagination,
    });
});
PaymentController.getPaymentStats = (0, catchAsync_1.default)(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const stats = await payment_service_1.PaymentService.getPaymentStats(startDate, endDate);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Payment statistics retrieved successfully',
        data: stats,
    });
});
PaymentController.getOverduePayments = (0, catchAsync_1.default)(async (req, res, next) => {
    const payments = await payment_service_1.PaymentService.getOverduePayments();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Overdue payments retrieved successfully',
        data: payments,
    });
});
PaymentController.createPayment = (0, catchAsync_1.default)(async (req, res, next) => {
    const createdBy = req.user?.id;
    const payment = await payment_service_1.PaymentService.createPayment(req.body, createdBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: 'Payment processed successfully',
        data: payment,
    });
});
PaymentController.initiatePayment = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await payment_service_1.PaymentService.initiatePayment(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Payment initiated successfully',
        data: result,
    });
});
PaymentController.handleSSLCommerzSuccess = (0, catchAsync_1.default)(async (req, res, next) => {
    const { tran_id } = req.body;
    const payment = await payment_service_1.PaymentService.handlePaymentSuccess(tran_id, req.body);
    res.redirect(`${process.env.FRONTEND_URL}/payment/success?id=${payment.id}`);
});
PaymentController.handleSSLCommerzFail = (0, catchAsync_1.default)(async (req, res, next) => {
    const { tran_id } = req.body;
    await payment_service_1.PaymentService.handlePaymentFailure(tran_id, req.body);
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail`);
});
PaymentController.handleSSLCommerzCancel = (0, catchAsync_1.default)(async (req, res, next) => {
    const { tran_id } = req.body;
    await payment_service_1.PaymentService.handlePaymentFailure(tran_id, req.body);
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancel`);
});
PaymentController.getPaymentById = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const payment = await payment_service_1.PaymentService.getPaymentById(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Payment retrieved successfully',
        data: payment,
    });
});
PaymentController.updatePaymentStatus = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const updatedBy = req.user?.id;
    const payment = await payment_service_1.PaymentService.updatePaymentStatus(id, req.body, updatedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Payment status updated successfully',
        data: payment,
    });
});
PaymentController.processRefund = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const processedBy = req.user?.id;
    const payment = await payment_service_1.PaymentService.processRefund(id, req.body, processedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Refund processed successfully',
        data: payment,
    });
});
PaymentController.getInvoice = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const payment = await payment_service_1.PaymentService.getPaymentById(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Invoice retrieved successfully',
        data: {
            invoiceNumber: payment.invoiceNumber,
            invoiceUrl: payment.invoiceUrl,
            payment,
        },
    });
});
PaymentController.getMemberPayments = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const result = await payment_service_1.PaymentService.getAllPayments({
        page,
        limit,
        memberId,
        sortBy: 'createdAt',
        order: 'desc',
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Member payments retrieved successfully',
        data: result.payments,
        meta: result.pagination,
    });
});
