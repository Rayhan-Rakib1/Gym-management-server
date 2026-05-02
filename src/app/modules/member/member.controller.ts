import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { sendResponse } from '../../../utils/sendResponse';
import { MemberService } from './member.service';

export class MemberController {

    static getAllMembers = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const result = await MemberService.getAllMembers(req.query as any);

            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: 'Members retrieved successfully',
                data: result.members,
                meta: result.pagination,
            });
        }
    );

    static getMemberById = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const member = await MemberService.getMemberById(id);

            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: 'Member retrieved successfully',
                data: member,
            });
        }
    );

    static createMember = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const createdBy = req.user?.id!;
            const member = await MemberService.createMember(req.body, createdBy);

            sendResponse(res, {
                statusCode: httpStatus.CREATED,
                success: true,
                message: 'Member created successfully',
                data: member,
            });
        }
    );

    static updateMember = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const updatedBy = req.user?.id!;
            const member = await MemberService.updateMember(id, req.body, updatedBy);

            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: 'Member updated successfully',
                data: member,
            });
        }
    );

    static updateFitnessProfile = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const member = await MemberService.updateFitnessProfile(id, req.body);

            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: 'Fitness profile updated successfully',
                data: member,
            });
        }
    );

    static assignTrainer = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const assignedBy = req.user?.id!;
            const member = await MemberService.assignTrainer(id, req.body, assignedBy);

            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: 'Trainer assigned successfully',
                data: member,
            });
        }
    );

    static updateMemberPlan = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const updatedBy = req.user?.id!;
            const member = await MemberService.updateMemberPlan(id, req.body, updatedBy);
            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: 'Membership plan updated successfully',
                data: member,
            });
        }
    );

    static renewMembership = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const result = await MemberService.renewMembership(id, req.body);
            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: 'Membership renewed successfully',
                data: result,
            });
        }
    );

    static deleteMember = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const deletedBy = req.user?.id!;
            const result = await MemberService.deleteMember(id, deletedBy);
            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: result.message,
                data: null,
            });
        }
    );

    static getMemberDashboard = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const dashboard = await MemberService.getMemberDashboard(id);
            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: 'Dashboard data retrieved successfully',
                data: dashboard,
            });
        }
    );

    static getExpiringMembers = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const days = parseInt(req.query.days as string) || 7;
            const members = await MemberService.getExpiringMembers(days);
            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: 'Expiring members retrieved successfully',
                data: members,
            });
        }
    );

    static getMemberStats = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const stats = await MemberService.getMemberStats();
            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: 'Member statistics retrieved successfully',
                data: stats,
            });
        }
    );
}