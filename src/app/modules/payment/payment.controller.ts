import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import catchAsync from '../../../utils/catchAsync';
import { sendResponse } from '../../../utils/sendResponse';

export class PaymentController {
    static getAllPayments = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const result = await PaymentService.getAllPayments(req.query as any);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Payments retrieved successfully',
                data: result.payments,
                meta: result.pagination,
            });
        }
    );

    static getPaymentStats = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { startDate, endDate } = req.query;
            const stats = await PaymentService.getPaymentStats(
                startDate as string,
                endDate as string
            );

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Payment statistics retrieved successfully',
                data: stats,
            });
        }
    );

    static getOverduePayments = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const payments = await PaymentService.getOverduePayments();

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Overdue payments retrieved successfully',
                data: payments,
            });
        }
    );

    static createPayment = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const createdBy = req.user?.id!;
            const payment = await PaymentService.createPayment(req.body, createdBy);

            sendResponse(res, {
                statusCode: 201,
                success: true,
                message: 'Payment processed successfully',
                data: payment,
            });
        }
    );

    static initiatePayment = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const result = await PaymentService.initiatePayment(req.body);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Payment initiated successfully',
                data: result,
            });
        }
    );

    static handleSSLCommerzSuccess = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { tran_id } = req.body;
            const payment = await PaymentService.handlePaymentSuccess(tran_id, req.body);

            res.redirect(`${process.env.FRONTEND_URL}/payment/success?id=${payment.id}`);
        }
    );

    static handleSSLCommerzFail = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { tran_id } = req.body;
            await PaymentService.handlePaymentFailure(tran_id, req.body);

            res.redirect(`${process.env.FRONTEND_URL}/payment/fail`);
        }
    );

    static handleSSLCommerzCancel = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { tran_id } = req.body;
            await PaymentService.handlePaymentFailure(tran_id, req.body);

            res.redirect(`${process.env.FRONTEND_URL}/payment/cancel`);
        }
    );

    static getPaymentById = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const payment = await PaymentService.getPaymentById(id);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Payment retrieved successfully',
                data: payment,
            });
        }
    );

    static updatePaymentStatus = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const updatedBy = req.user?.id!;
            const payment = await PaymentService.updatePaymentStatus(id, req.body, updatedBy);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Payment status updated successfully',
                data: payment,
            });
        }
    );

    static processRefund = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const processedBy = req.user?.id!;
            const payment = await PaymentService.processRefund(id, req.body, processedBy);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Refund processed successfully',
                data: payment,
            });
        }
    );

    static getInvoice = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const payment = await PaymentService.getPaymentById(id);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Invoice retrieved successfully',
                data: {
                    invoiceNumber: payment.invoiceNumber,
                    invoiceUrl: payment.invoiceUrl,
                    payment,
                },
            });
        }
    );

    static getMemberPayments = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { memberId } = req.params;
            const { page = '1', limit = '10' } = req.query;

            const result = await PaymentService.getAllPayments({
                page,
                limit,
                memberId,
                sortBy: 'createdAt',
                order: 'desc',
            } as any);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Member payments retrieved successfully',
                data: result.payments,
                meta: result.pagination,
            });
        }
    );
}
