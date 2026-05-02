"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmin = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../shared/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../config"));
const seedSuperAdmin = async () => {
    try {
        console.log("👤 Checking for existing Super Admin...");
        const superAdminEmail = config_1.default.super_admin_email;
        if (!superAdminEmail || !config_1.default.super_admin_password) {
            console.error("❌ Super Admin email/password missing in environment variables.");
            return;
        }
        // Check if Super Admin already exists
        const existingSuperAdmin = await prisma_1.default.user.findUnique({
            where: { email: superAdminEmail },
        });
        if (existingSuperAdmin) {
            console.log("⚠️  Super Admin already exists. Skipping seeding.");
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(config_1.default.super_admin_password, Number(config_1.default.bcrypt_saltRounds));
        console.log("🚀 Creating Super Admin...");
        const superAdmin = await prisma_1.default.user.create({
            data: {
                email: superAdminEmail,
                name: config_1.default.super_admin_name || "Abu Saiyed Joy",
                password: hashedPassword,
                phone: config_1.default.super_admin_phone || "+8801823567254",
                role: client_1.Role.SUPER_ADMIN,
                isActive: true,
                isVerified: true,
                admin: {
                    create: {
                        accessLevel: "full",
                    },
                },
            },
            include: {
                admin: true,
            },
        });
        console.log("✅ Super Admin seeded successfully:");
    }
    catch (error) {
        console.error("❌ Error seeding Super Admin:", error);
    }
};
exports.seedSuperAdmin = seedSuperAdmin;
