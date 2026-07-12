import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';

import { db } from '../db/index.js';
import { usersTable } from '../db/schema.js';
import { hashPassword } from '../lib/auth.js';

const DEMO_PASSWORD = 'demo123';

const demoUsers = [
  { name: 'Alok Sharma', email: 'alok@tms.com', role: 'ADMIN' as const },
  { name: 'Rajesh Kumar', email: 'rajesh@tms.com', role: 'DRIVER' as const },
];

async function seedDemoUsers() {
  const { hash } = hashPassword(DEMO_PASSWORD);

  for (const demoUser of demoUsers) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, demoUser.email)).limit(1);

    if (existing.length > 0) {
      console.log(`Skipped ${demoUser.email} — already exists`);
      continue;
    }

    await db.insert(usersTable).values({
      id: randomUUID(),
      name: demoUser.name,
      email: demoUser.email,
      passwordHash: hash,
      role: demoUser.role,
    });

    console.log(`Created demo ${demoUser.role.toLowerCase()}: ${demoUser.email}`);
  }

  console.log(`Demo password for all accounts: ${DEMO_PASSWORD}`);
}

seedDemoUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed demo users:', error);
    process.exit(1);
  });
