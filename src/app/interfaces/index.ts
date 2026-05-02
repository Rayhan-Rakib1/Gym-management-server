import { Role } from "@prisma/client";

export interface IUser {
  id: string;
  email: string;
  role: Role;
  name?: string;
  phone?: string;
  profileImage?: string;
}

export interface ITrainer {
  userId: string;
  employeeId: string;
  certifications: string[];
  bio?: string | null;
  languages: string[];

  successRate: number;
  totalClients: number;
  currentClients: number;
  maxCapacity: number;
  rating: number;
  reviewCount: number;

  joinedDate: Date;
  salary?: number | null;
  isAvailable: boolean;
}

export interface IMember {
  userId: string;
  employeeId: string;
}

