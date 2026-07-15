import { migrate } from 'drizzle-orm/neon-http/migrator';

import { db } from '../config/database';
import { logger } from '../utils/logger';

migrate(db, { migrationsFolder: './src/db/migrations' })
  .then(() => {
    logger.info('Migrations applied successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error({ error }, 'Migration failed');
    process.exit(1);
  });
