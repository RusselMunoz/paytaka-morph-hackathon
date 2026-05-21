import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

export class AuthService {
  constructor(private readonly app: FastifyInstance) {}

  async register(input: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
    role?: "SENDER" | "RECIPIENT" | "MERCHANT";
  }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError("Email already registered", 409, "EMAIL_EXISTS");
    }

    const user = await prisma.user.create({
      data: {
        email: input.email,
        displayName: input.displayName,
        phone: input.phone,
        role: input.role ?? "RECIPIENT",
        passwordHash: await bcrypt.hash(input.password, 12)
      }
    });

    return this.withToken(user);
  }

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user?.passwordHash) {
      throw new AppError("Invalid email or password", 401, "INVALID_LOGIN");
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new AppError("Invalid email or password", 401, "INVALID_LOGIN");
    }

    return this.withToken(user);
  }

  private withToken(user: { id: string; email: string; role: string; displayName: string }) {
    const token = this.app.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName
      }
    };
  }
}
