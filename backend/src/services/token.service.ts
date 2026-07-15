import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import { db } from '../config/database';
import { signAccessToken, signRefreshToken } from '../config/jwt';
import { sessions } from '../db/schema';

interface TokenUser {
  id: string;
  email: string;
}

export class TokenService {
  async issueTokenPair(user: TokenUser) {
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = signRefreshToken({ sub: user.id });

    const decodedRefresh = jwt.decode(refreshToken) as { exp: number };
    const decodedAccess = jwt.decode(accessToken) as { exp: number; iat: number };

    await db.insert(sessions).values({
      userId: user.id,
      refreshToken,
      expiresAt: new Date(decodedRefresh.exp * 1000),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: decodedAccess.exp - decodedAccess.iat,
    };
  }

  async findActiveSession(refreshToken: string) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshToken, refreshToken));

    if (!session || session.deletedAt || session.expiresAt < new Date()) {
      return null;
    }

    return session;
  }

  async revokeSession(refreshToken: string) {
    await db
      .update(sessions)
      .set({ deletedAt: new Date() })
      .where(eq(sessions.refreshToken, refreshToken));
  }
}
