import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import type { RegisterInput, LoginInput } from '@aisoftco/shared';
import { db } from '../config/database';
import { users } from '../db/schema';
import { TokenService } from './token.service';
import { verifyRefreshToken } from '../config/jwt';
import { AuthenticationError, ConflictError } from '../utils/errors';
import { toUserResponse } from '../utils/user-mapper';

const BCRYPT_ROUNDS = 12;

const tokenService = new TokenService();

export class AuthService {
  async register(input: RegisterInput) {
    const [existing] = await db.select().from(users).where(eq(users.email, input.email));
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const [user] = await db
      .insert(users)
      .values({ email: input.email, passwordHash, name: input.name })
      .returning();

    if (!user) {
      throw new Error('Failed to create user');
    }

    const tokens = await tokenService.issueTokenPair(user);
    return { user: toUserResponse(user), ...tokens };
  }

  async login(input: LoginInput) {
    const [user] = await db.select().from(users).where(eq(users.email, input.email));
    if (!user || user.deletedAt) {
      throw new AuthenticationError('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AuthenticationError('Invalid email or password');
    }

    const tokens = await tokenService.issueTokenPair(user);
    return { user: toUserResponse(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const session = await tokenService.findActiveSession(refreshToken);
    if (!session) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const [user] = await db.select().from(users).where(eq(users.id, payload.sub));
    if (!user || user.deletedAt) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    await tokenService.revokeSession(refreshToken);
    const tokens = await tokenService.issueTokenPair(user);
    return { user: toUserResponse(user), ...tokens };
  }

  async logout(refreshToken: string) {
    await tokenService.revokeSession(refreshToken);
  }
}
