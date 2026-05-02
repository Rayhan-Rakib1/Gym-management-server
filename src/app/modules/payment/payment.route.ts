import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validateRequest } from '../../middlewares/validateRequest';
import { Role } from '@prisma/client';
import {
    createPaymentSchema,
    initiatePaymentSchema,
    updatePaymentStatusSchema,
    processRefundSchema,
    getPaymentsQuerySchema,
} from './payment.validation';

const router = Router();

//    Get payment statistics
router.get(
    '/stats',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    PaymentController.getPaymentStats
);

//    Get overdue payments
router.get(
    '/overdue',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    PaymentController.getOverduePayments
);

//    SSLCommerz success callback
router.post('/sslcommerz/success', PaymentController.handleSSLCommerzSuccess);

//    SSLCommerz fail callback
router.post('/sslcommerz/fail', PaymentController.handleSSLCommerzFail);

//    SSLCommerz cancel callback

router.post('/sslcommerz/cancel', PaymentController.handleSSLCommerzCancel);

//    Initiate online payment
router.post(
    '/initiate',
    authenticate,
    validateRequest(initiatePaymentSchema),
    PaymentController.initiatePayment
);

//    Get member payments
router.get(
    '/member/:memberId',
    authenticate,
    PaymentController.getMemberPayments
);

//    Get all payments
router.get(
    '/',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    validateRequest(getPaymentsQuerySchema),
    PaymentController.getAllPayments
);

//    Create new payment
router.post(
    '/',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    validateRequest(createPaymentSchema),
    PaymentController.createPayment
);

//    Get invoice for a payment
router.get(
    '/:id/invoice',
    authenticate,
    PaymentController.getInvoice
);

//    Get payment by ID
router.get(
    '/:id',
    authenticate,
    PaymentController.getPaymentById
);

//    Update payment status
router.put(
    '/:id/status',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    validateRequest(updatePaymentStatusSchema),
    PaymentController.updatePaymentStatus
);

//    Process refund
router.post(
    '/:id/refund',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    validateRequest(processRefundSchema),
    PaymentController.processRefund
);

export const paymentRoutes = router;
