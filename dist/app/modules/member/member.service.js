"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = require("../../errors/ApiError");
const http_status_1 = __importDefault(require("http-status"));
const idGenerator_1 = require("../../../utils/idGenerator");
class MemberService {
    static async getAllMembers(query) {
        const { page = '1', limit = '10', search, planId, trainerId, isActive, workoutExperience, sortBy = 'createdAt', order = 'desc' } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search) {
            where.OR = [
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { employeeId: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (planId)
            where.currentPlanId = planId;
        if (trainerId)
            where.assignedTrainerId = trainerId;
        if (isActive !== undefined)
            where.user = { isActive };
        if (workoutExperience)
            where.workoutExperience = workoutExperience;
        const total = await prisma_1.default.member.count({ where });
        const members = await prisma_1.default.member.findMany({
            where, skip, take: limitNum, orderBy: { [sortBy]: order },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, profileImage: true, isActive: true, isVerified: true, createdAt: true } },
                currentPlan: { select: { id: true, name: true, price: true, durationDays: true } },
                assignedTrainer: { include: { user: { select: { name: true, profileImage: true } } } },
            },
        });
        return { members, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum), hasNext: pageNum < Math.ceil(total / limitNum), hasPrev: pageNum > 1 } };
    }
    static async getMemberById(memberId) {
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, profileImage: true, isActive: true, isVerified: true, createdAt: true } },
                currentPlan: true,
                assignedTrainer: { include: { user: { select: { name: true, email: true, profileImage: true } }, specializations: true } },
                payments: { orderBy: { createdAt: 'desc' }, take: 5 },
                attendance: { orderBy: { date: 'desc' }, take: 10 },
                bodyMetrics: { orderBy: { recordDate: 'desc' }, take: 10 },
                workoutPlans: { where: { isActive: true }, include: { trainer: { include: { user: { select: { name: true } } } } } },
            },
        });
        if (!member)
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        return member;
    }
    static async createMember(data, createdBy) {
        const { name, email, password, phone, dateOfBirth, gender, height, currentWeight, targetWeight, bloodGroup, emergencyContact, emergencyContactName, address, currentPlanId } = data;
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser)
            throw new ApiError_1.AppError('Email already registered', http_status_1.default.BAD_REQUEST);
        if (phone) {
            const existingPhone = await prisma_1.default.user.findFirst({ where: { phone } });
            if (existingPhone)
                throw new ApiError_1.AppError('Phone number already registered', http_status_1.default.BAD_REQUEST);
        }
        if (currentPlanId) {
            const plan = await prisma_1.default.membershipPlan.findUnique({ where: { id: currentPlanId } });
            if (!plan)
                throw new ApiError_1.AppError('Membership plan not found', http_status_1.default.NOT_FOUND);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const employeeId = (0, idGenerator_1.idGenerator)('MEM');
        let membershipStartDate, membershipEndDate;
        if (currentPlanId) {
            const plan = await prisma_1.default.membershipPlan.findUnique({ where: { id: currentPlanId } });
            membershipStartDate = new Date();
            membershipEndDate = new Date();
            membershipEndDate.setDate(membershipEndDate.getDate() + plan.durationDays);
        }
        const member = await prisma_1.default.$transaction(async (tx) => {
            const user = await tx.user.create({ data: { name, email, password: hashedPassword, phone, role: 'MEMBER', isActive: true, isVerified: true } });
            const newMember = await tx.member.create({
                data: { userId: user.id, employeeId, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, gender, height, currentWeight, targetWeight, bloodGroup, emergencyContact, emergencyContactName, address, currentPlanId, membershipStartDate, membershipEndDate },
                include: { user: { select: { id: true, name: true, email: true, phone: true, profileImage: true } }, currentPlan: true },
            });
            return newMember;
        });
        return member;
    }
    static async updateMember(memberId, data, updatedBy) {
        const member = await prisma_1.default.member.findUnique({ where: { id: memberId }, include: { user: true } });
        if (!member)
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        if (data.phone) {
            const existingPhone = await prisma_1.default.user.findFirst({ where: { phone: data.phone, NOT: { id: member.userId } } });
            if (existingPhone)
                throw new ApiError_1.AppError('Phone number already in use', http_status_1.default.BAD_REQUEST);
        }
        const updatedMember = await prisma_1.default.$transaction(async (tx) => {
            if (data.name || data.phone) {
                await tx.user.update({ where: { id: member.userId }, data: { name: data.name, phone: data.phone } });
            }
            const updated = await tx.member.update({
                where: { id: memberId },
                data: { dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined, gender: data.gender, height: data.height, currentWeight: data.currentWeight, targetWeight: data.targetWeight, bloodGroup: data.bloodGroup, emergencyContact: data.emergencyContact, emergencyContactName: data.emergencyContactName, address: data.address },
                include: { user: { select: { id: true, name: true, email: true, phone: true, profileImage: true } }, currentPlan: true },
            });
            return updated;
        });
        return updatedMember;
    }
    static async updateFitnessProfile(memberId, data) {
        const member = await prisma_1.default.member.findUnique({ where: { id: memberId } });
        if (!member)
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        const updated = await prisma_1.default.member.update({
            where: { id: memberId },
            data: { fitnessGoals: data.fitnessGoals, healthConditions: data.healthConditions, workoutExperience: data.workoutExperience, preferredWorkoutStyle: data.preferredWorkoutStyle, weeklyFrequency: data.weeklyFrequency, preferredTime: data.preferredTime },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        return updated;
    }
    static async assignTrainer(memberId, data, assignedBy) {
        const member = await prisma_1.default.member.findUnique({ where: { id: memberId } });
        if (!member)
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        const trainer = await prisma_1.default.trainer.findUnique({ where: { id: data.trainerId } });
        if (!trainer)
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        if (trainer.currentClients >= trainer.maxCapacity)
            throw new ApiError_1.AppError('Trainer has reached maximum capacity', http_status_1.default.BAD_REQUEST);
        const updated = await prisma_1.default.$transaction(async (tx) => {
            if (member.assignedTrainerId) {
                await tx.trainer.update({ where: { id: member.assignedTrainerId }, data: { currentClients: { decrement: 1 } } });
            }
            await tx.trainer.update({ where: { id: data.trainerId }, data: { currentClients: { increment: 1 } } });
            const updatedMember = await tx.member.update({
                where: { id: memberId },
                data: { assignedTrainerId: data.trainerId, trainerAssignedDate: new Date() },
                include: { assignedTrainer: { include: { user: { select: { name: true, email: true, profileImage: true } } } } },
            });
            return updatedMember;
        });
        return updated;
    }
    static async updateMemberPlan(memberId, data, updatedBy) {
        const member = await prisma_1.default.member.findUnique({ where: { id: memberId } });
        if (!member)
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        const plan = await prisma_1.default.membershipPlan.findUnique({ where: { id: data.planId } });
        if (!plan)
            throw new ApiError_1.AppError('Membership plan not found', http_status_1.default.NOT_FOUND);
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.durationDays);
        const updated = await prisma_1.default.member.update({
            where: { id: memberId },
            data: { currentPlanId: data.planId, membershipStartDate: startDate, membershipEndDate: endDate },
            include: { currentPlan: true },
        });
        return updated;
    }
    static async renewMembership(memberId, data) {
        const member = await prisma_1.default.member.findUnique({ where: { id: memberId } });
        if (!member)
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        const plan = await prisma_1.default.membershipPlan.findUnique({ where: { id: data.planId } });
        if (!plan)
            throw new ApiError_1.AppError('Membership plan not found', http_status_1.default.NOT_FOUND);
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.durationDays);
        const amount = plan.price;
        const discount = plan.discount;
        const finalAmount = amount - (amount * discount) / 100;
        const result = await prisma_1.default.$transaction(async (tx) => {
            const updatedMember = await tx.member.update({ where: { id: memberId }, data: { currentPlanId: data.planId, membershipStartDate: startDate, membershipEndDate: endDate } });
            const invoiceNumber = `INV${Date.now()}`;
            const payment = await tx.payment.create({ data: { memberId, planId: data.planId, amount, discount, finalAmount, paymentMethod: data.paymentMethod, invoiceNumber, status: 'PAID', paymentDate: new Date() } });
            return { member: updatedMember, payment };
        });
        return result;
    }
    static async deleteMember(memberId, deletedBy) {
        const member = await prisma_1.default.member.findUnique({ where: { id: memberId }, include: { user: true } });
        if (!member)
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        await prisma_1.default.$transaction(async (tx) => {
            await tx.user.update({ where: { id: member.userId }, data: { isActive: false } });
            if (member.assignedTrainerId) {
                await tx.trainer.update({ where: { id: member.assignedTrainerId }, data: { currentClients: { decrement: 1 } } });
            }
        });
        return { message: 'Member deleted successfully' };
    }
    static async getMemberDashboard(memberId) {
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
            include: { currentPlan: true, assignedTrainer: { include: { user: { select: { name: true, profileImage: true } } } } },
        });
        if (!member)
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        const [totalAttendance, thisMonthAttendance, upcomingClasses, latestMetrics] = await Promise.all([
            prisma_1.default.attendance.count({ where: { memberId } }),
            prisma_1.default.attendance.count({ where: { memberId, date: { gte: new Date(new Date().setDate(1)) } } }),
            prisma_1.default.classBooking.count({ where: { memberId, status: 'CONFIRMED', bookingDate: { gte: new Date() } } }),
            prisma_1.default.bodyMetric.findFirst({ where: { memberId }, orderBy: { recordDate: 'desc' } }),
        ]);
        let daysRemaining = 0;
        if (member.membershipEndDate) {
            const now = new Date();
            const end = new Date(member.membershipEndDate);
            daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }
        return { member, stats: { totalAttendance, thisMonthAttendance, upcomingClasses, daysRemaining }, latestMetrics };
    }
    static async getExpiringMembers(days = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const members = await prisma_1.default.member.findMany({
            where: { membershipEndDate: { lte: futureDate, gte: new Date() }, user: { isActive: true } },
            include: { user: { select: { name: true, email: true, phone: true } }, currentPlan: true },
        });
        return members;
    }
    static async getMemberStats() {
        const [totalMembers, activeMembers, newMembersThisMonth, membersWithTrainer, membersWithPlan] = await Promise.all([
            prisma_1.default.member.count(),
            prisma_1.default.member.count({ where: { user: { isActive: true } } }),
            prisma_1.default.member.count({ where: { createdAt: { gte: new Date(new Date().setDate(1)) } } }),
            prisma_1.default.member.count({ where: { assignedTrainerId: { not: null } } }),
            prisma_1.default.member.count({ where: { currentPlanId: { not: null } } }),
        ]);
        const membersByExperience = await prisma_1.default.member.groupBy({ by: ['workoutExperience'], _count: true });
        return {
            totalMembers, activeMembers, inactiveMembers: totalMembers - activeMembers, newMembersThisMonth, membersWithTrainer, membersWithoutTrainer: totalMembers - membersWithTrainer, membersWithPlan, membersWithoutPlan: totalMembers - membersWithPlan,
            membersByExperience: membersByExperience.map((item) => ({ experience: item.workoutExperience, count: item._count })),
        };
    }
}
exports.MemberService = MemberService;
