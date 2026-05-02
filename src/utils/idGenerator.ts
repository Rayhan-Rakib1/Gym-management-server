import prisma from "../shared/prisma";

export const generateMembershipId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `MEM${year}`;

  // Get last membership ID
  const lastMember = await prisma.member.findFirst({
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

export const generateEmployeeId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `TRN${year}`;

  // Get last employee ID
  const lastTrainer = await prisma.trainer.findFirst({
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

export const idGenerator = (prefix: string): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}${randomNum}`;
};
