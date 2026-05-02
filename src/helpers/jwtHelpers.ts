import jwt from "jsonwebtoken";
import config from "../config";
import { Role } from "@prisma/client";


// Define Role type
export const generateAccessToken = (userId: string, role: Role, email: string, name: string): string => {
  const payload = { userId, role, email, name };
  const expiresIn = config.jwt.access_expiry || '15m';
  return jwt.sign(payload, config.jwt.access_secret!, { expiresIn } as any);
}

// Generate Refresh Token 
export const generateRefreshToken = (userId: string) => {
  const payload = { userId };
  const expiresIn = config.jwt.refresh_expiry || '7d';
  return jwt.sign(payload, config.jwt.refresh_secret!, { expiresIn } as any);
}
