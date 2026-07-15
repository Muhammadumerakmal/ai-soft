import { eq } from 'drizzle-orm';

import { db } from '../config/database';
import { users } from '../db/schema';
import { NotFoundError } from '../utils/errors';
import { toUserResponse } from '../utils/user-mapper';

export class UserService {
  async getById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user || user.deletedAt) {
      throw new NotFoundError('User');
    }
    return toUserResponse(user);
  }
}
