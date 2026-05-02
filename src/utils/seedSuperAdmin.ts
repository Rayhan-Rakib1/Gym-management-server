
import { Role } from "@prisma/client";
import prisma from "../shared/prisma";
import bcrypt from "bcryptjs";
import config from "../config";


export const seedSuperAdmin = async () => {
  try {
    console.log("👤 Checking for existing Super Admin...");

    const superAdminEmail = config.super_admin_email;

    if (!superAdminEmail || !config.super_admin_password) {
      console.error("❌ Super Admin email/password missing in environment variables.");
      return;
    }

    // Check if Super Admin already exists
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });

    if (existingSuperAdmin) {
      console.log("⚠️  Super Admin already exists. Skipping seeding.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.super_admin_password,
      Number(config.bcrypt_saltRounds)
    );

    console.log("🚀 Creating Super Admin...");

    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: config.super_admin_name || "Abu Saiyed Joy",
        password: hashedPassword,
        phone: config.super_admin_phone || "+8801823567254",
        role: Role.SUPER_ADMIN,
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
  } catch (error) {
    console.error("❌ Error seeding Super Admin:", error);
  }
};
