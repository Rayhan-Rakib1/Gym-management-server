"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const validateRequest_1 = require("../../middlewares/validateRequest");
const client_1 = require("@prisma/client");
const payment_validation_1 = require("./payment.validation");
const router = (0, express_1.Router)();
//    Get payment statistics
router.get('/stats', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), payment_controller_1.PaymentController.getPaymentStats);
//    Get overdue payments
router.get('/overdue', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), payment_controller_1.PaymentController.getOverduePayments);
//    SSLCommerz success callback
router.post('/sslcommerz/success', payment_controller_1.PaymentController.handleSSLCommerzSuccess);
//    SSLCommerz fail callback
router.post('/sslcommerz/fail', payment_controller_1.PaymentController.handleSSLCommerzFail);
//    SSLCommerz cancel callback
router.post('/sslcommerz/cancel', payment_controller_1.PaymentController.handleSSLCommerzCancel);
//    Initiate online payment
router.post('/initiate', auth_1.authenticate, (0, validateRequest_1.validateRequest)(payment_validation_1.initiatePaymentSchema), payment_controller_1.PaymentController.initiatePayment);
//    Get member payments
router.get('/member/:memberId', auth_1.authenticate, payment_controller_1.PaymentController.getMemberPayments);
//    Get all payments
router.get('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(payment_validation_1.getPaymentsQuerySchema), payment_controller_1.PaymentController.getAllPayments);
//    Create new payment
router.post('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(payment_validation_1.createPaymentSchema), payment_controller_1.PaymentController.createPayment);
//    Get invoice for a payment
router.get('/:id/invoice', auth_1.authenticate, payment_controller_1.PaymentController.getInvoice);
//    Get payment by ID
router.get('/:id', auth_1.authenticate, payment_controller_1.PaymentController.getPaymentById);
//    Update payment status
router.put('/:id/status', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(payment_validation_1.updatePaymentStatusSchema), payment_controller_1.PaymentController.updatePaymentStatus);
//    Process refund
router.post('/:id/refund', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(payment_validation_1.processRefundSchema), payment_controller_1.PaymentController.processRefund);
exports.paymentRoutes = router;
