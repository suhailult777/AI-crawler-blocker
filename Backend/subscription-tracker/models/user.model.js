import { eq } from 'drizzle-orm';
import { db } from '../database/mongodb.js';
import { users } from '../database/schema.js';

export class User {
    static async create(userData) {
        const [user] = await db.insert(users).values({
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: userData.password,
        }).returning();
        return user;
    }

    static async findOne(filter) {
        if (filter.email) {
            const [user] = await db.select().from(users).where(eq(users.email, filter.email.toLowerCase()));
            return user;
        }
        return null;
    }

    static async findById(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }

    static async find() {
        return await db.select().from(users);
    }
}

export default User;