"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idGenerator = exports.generateEmployeeId = exports.generateMembershipId = void 0;
const prisma_1 = __importDefault(require("../shared/prisma"));
const generateMembershipId = async () => {
    const year = new Date().getFullYear();
    const prefix = `MEM${year}`;
    // Get last membership ID
    const lastMember = await prisma_1.default.member.findFirst({
        where: {
            employeeId: {
                startsWith: prefix,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    let nextNumber = 1;
    if (lastMember) {
        const lastNumber = parseInt(lastMember.employeeId.slice(-4));
        nextNumber = lastNumber + 1;
    }
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};
exports.generateMembershipId = generateMembershipId;
const generateEmployeeId = async () => {
    const year = new Date().getFullYear();
    const prefix = `TRN${year}`;
    // Get last employee ID
    const lastTrainer = await prisma_1.default.trainer.findFirst({
        where: {
            employeeId: {
                startsWith: prefix,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    let nextNumber = 1;
    if (lastTrainer) {
        const lastNumber = parseInt(lastTrainer.employeeId.slice(-4));
        nextNumber = lastNumber + 1;
    }
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};
exports.generateEmployeeId = generateEmployeeId;
const idGenerator = (prefix) => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${year}${randomNum}`;
};
exports.idGenerator = idGenerator;
