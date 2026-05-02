import bcrypt from 'bcryptjs';
import prisma from '../../../shared/prisma';
import { AppError } from '../../errors/ApiError';
import httpStatus from 'http-status';
import { idGenerator } from '../../../utils/idGenerator';

export class MemberService {
    static async getAllMembers(query: any) {
        const { page = '1', limit = '10', search, planId, trainerId, isActive, workoutExperience, sortBy = 'createdAt', order = 'desc' } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where: any = {};

        if (search) {
            where.OR = [
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { employeeId: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (planId) where.currentPlanId = planId;
        if (trainerId) where.assignedTrainerId = trainerId;
        if (isActive !== undefined) where.user = { isActive };
        if (workoutExperience) where.workoutExperience = workoutExperience;

        const total = await prisma.member.count({ where });
        const members = await prisma.member.findMany({
            where, skip, take: limitNum, orderBy: { [sortBy]: order },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, profileImage: true, isActive: true, isVerified: true, createdAt: true } },
                currentPlan: { select: { id: true, name: true, price: true, durationDays: true } },
                assignedTrainer: { include: { user: { select: { name: true, profileImage: true } } } },
            },
        });

        return { members, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum), hasNext: pageNum < Math.ceil(total / limitNum), hasPrev: pageNum > 1 } };
    }

    static async getMemberById(memberId: string) {
        const member = await prisma.member.findUnique({
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
        if (!member) throw new AppError('Member not found', httpStatus.NOT_FOUND);
        return member;
    }

    static async createMember(data: any, createdBy: string) {
        const { name, email, password, phone, dateOfBirth, gender, height, currentWeight, targetWeight, bloodGroup, emergencyContact, emergencyContactName, address, currentPlanId } = data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new AppError('Email already registered', httpStatus.BAD_REQUEST);

        if (phone) {
            const existingPhone = await prisma.user.findFirst({ where: { phone } });
            if (existingPhone) throw new AppError('Phone number already registered', httpStatus.BAD_REQUEST);
        }

        if (currentPlanId) {
            const plan = await prisma.membershipPlan.findUnique({ where: { id: currentPlanId } });
            if (!plan) throw new AppError('Membership plan not found', httpStatus.NOT_FOUND);
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const employeeId = idGenerator('MEM');
        let membershipStartDate, membershipEndDate;

        if (currentPlanId) {
            const plan = await prisma.membershipPlan.findUnique({ where: { id: currentPlanId } });
            membershipStartDate = new Date();
            membershipEndDate = new Date();
            membershipEndDate.setDate(membershipEndDate.getDate() + plan!.durationDays);
        }

        const member = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({ data: { name, email, password: hashedPassword, phone, role: 'MEMBER', isActive: true, isVerified: true } });
            const newMember = await tx.member.create({
                data: { userId: user.id, employeeId, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, gender, height, currentWeight, targetWeight, bloodGroup, emergencyContact, emergencyContactName, address, currentPlanId, membershipStartDate, membershipEndDate },
                include: { user: { select: { id: true, name: true, email: true, phone: true, profileImage: true } }, currentPlan: true },
            });
            return newMember;
        });
        return member;
    }

    static async updateMember(memberId: string, data: any, updatedBy: string) {
        const member = await prisma.member.findUnique({ where: { id: memberId }, include: { user: true } });
        if (!member) throw new AppError('Member not found', httpStatus.NOT_FOUND);

        if (data.phone) {
            const existingPhone = await prisma.user.findFirst({ where: { phone: data.phone, NOT: { id: member.userId } } });
            if (existingPhone) throw new AppError('Phone number already in use', httpStatus.BAD_REQUEST);
        }

        const updatedMember = await prisma.$transaction(async (tx) => {
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

    static async updateFitnessProfile(memberId: string, data: any) {
        const member = await prisma.member.findUnique({ where: { id: memberId } });
        if (!member) throw new AppError('Member not found', httpStatus.NOT_FOUND);

        const updated = await prisma.member.update({
            where: { id: memberId },
            data: { fitnessGoals: data.fitnessGoals, healthConditions: data.healthConditions, workoutExperience: data.workoutExperience, preferredWorkoutStyle: data.preferredWorkoutStyle, weeklyFrequency: data.weeklyFrequency, preferredTime: data.preferredTime },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        return updated;
    }

    static async assignTrainer(memberId: string, data: any, assignedBy: string) {
        const member = await prisma.member.findUnique({ where: { id: memberId } });
        if (!member) throw new AppError('Member not found', httpStatus.NOT_FOUND);

        const trainer = await prisma.trainer.findUnique({ where: { id: data.trainerId } });
        if (!trainer) throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
        if (trainer.currentClients >= trainer.maxCapacity) throw new AppError('Trainer has reached maximum capacity', httpStatus.BAD_REQUEST);

        const updated = await prisma.$transaction(async (tx) => {
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

    static async updateMemberPlan(memberId: string, data: any, updatedBy: string) {
        const member = await prisma.member.findUnique({ where: { id: memberId } });
        if (!member) throw new AppError('Member not found', httpStatus.NOT_FOUND);

        const plan = await prisma.membershipPlan.findUnique({ where: { id: data.planId } });
        if (!plan) throw new AppError('Membership plan not found', httpStatus.NOT_FOUND);

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.durationDays);

        const updated = await prisma.member.update({
            where: { id: memberId },
            data: { currentPlanId: data.planId, membershipStartDate: startDate, membershipEndDate: endDate },
            include: { currentPlan: true },
        });
        return updated;
    }

    static async renewMembership(memberId: string, data: any) {
        const member = await prisma.member.findUnique({ where: { id: memberId } });
        if (!member) throw new AppError('Member not found', httpStatus.NOT_FOUND);

        const plan = await prisma.membershipPlan.findUnique({ where: { id: data.planId } });
        if (!plan) throw new AppError('Membership plan not found', httpStatus.NOT_FOUND);

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.durationDays);
        const amount = plan.price;
        const discount = plan.discount;
        const finalAmount = amount - (amount * discount) / 100;

        const result = await prisma.$transaction(async (tx) => {
            const updatedMember = await tx.member.update({ where: { id: memberId }, data: { currentPlanId: data.planId, membershipStartDate: startDate, membershipEndDate: endDate } });
            const invoiceNumber = `INV${Date.now()}`;
            const payment = await tx.payment.create({ data: { memberId, planId: data.planId, amount, discount, finalAmount, paymentMethod: data.paymentMethod, invoiceNumber, status: 'PAID', paymentDate: new Date() } });
            return { member: updatedMember, payment };
        });
        return result;
    }

    static async deleteMember(memberId: string, deletedBy: string) {
        const member = await prisma.member.findUnique({ where: { id: memberId }, include: { user: true } });
        if (!member) throw new AppError('Member not found', httpStatus.NOT_FOUND);

        await prisma.$transaction(async (tx) => {
            await tx.user.update({ where: { id: member.userId }, data: { isActive: false } });
            if (member.assignedTrainerId) {
                await tx.trainer.update({ where: { id: member.assignedTrainerId }, data: { currentClients: { decrement: 1 } } });
            }
        });
        return { message: 'Member deleted successfully' };
    }

    static async getMemberDashboard(memberId: string) {
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: { currentPlan: true, assignedTrainer: { include: { user: { select: { name: true, profileImage: true } } } } },
        });
        if (!member) throw new AppError('Member not found', httpStatus.NOT_FOUND);

        const [totalAttendance, thisMonthAttendance, upcomingClasses, latestMetrics] = await Promise.all([
            prisma.attendance.count({ where: { memberId } }),
            prisma.attendance.count({ where: { memberId, date: { gte: new Date(new Date().setDate(1)) } } }),
            prisma.classBooking.count({ where: { memberId, status: 'CONFIRMED', bookingDate: { gte: new Date() } } }),
            prisma.bodyMetric.findFirst({ where: { memberId }, orderBy: { recordDate: 'desc' } }),
        ]);

        let daysRemaining = 0;
        if (member.membershipEndDate) {
            const now = new Date();
            const end = new Date(member.membershipEndDate);
            daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        return { member, stats: { totalAttendance, thisMonthAttendance, upcomingClasses, daysRemaining }, latestMetrics };
    }

    static async getExpiringMembers(days: number = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const members = await prisma.member.findMany({
            where: { membershipEndDate: { lte: futureDate, gte: new Date() }, user: { isActive: true } },
            include: { user: { select: { name: true, email: true, phone: true } }, currentPlan: true },
        });
        return members;
    }

    static async getMemberStats() {
        const [totalMembers, activeMembers, newMembersThisMonth, membersWithTrainer, membersWithPlan] = await Promise.all([
            prisma.member.count(),
            prisma.member.count({ where: { user: { isActive: true } } }),
            prisma.member.count({ where: { createdAt: { gte: new Date(new Date().setDate(1)) } } }),
            prisma.member.count({ where: { assignedTrainerId: { not: null } } }),
            prisma.member.count({ where: { currentPlanId: { not: null } } }),
        ]);
        const membersByExperience = await prisma.member.groupBy({ by: ['workoutExperience'], _count: true });
        return {
            totalMembers, activeMembers, inactiveMembers: totalMembers - activeMembers, newMembersThisMonth, membersWithTrainer, membersWithoutTrainer: totalMembers - membersWithTrainer, membersWithPlan, membersWithoutPlan: totalMembers - membersWithPlan,
            membersByExperience: membersByExperience.map((item) => ({ experience: item.workoutExperience, count: item._count })),
        };
    }
}
