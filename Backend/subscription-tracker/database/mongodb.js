import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DB_URI, NODE_ENV } from "../config/env.js";

if (!DB_URI) {
    throw new Error('Please define the DB_URI environment variable inside .env.<development/production>.local');
}

// Create the connection
const client = postgres(DB_URI);
export const db = drizzle(client);

const connectToDatabase = async () => {
    try {
        // Test the connection
        await client`SELECT 1`;
        console.log(`Connected to PostgreSQL database in ${NODE_ENV} mode`);
    } catch (error) {
        console.error('Error connecting to database: ', error);
        process.exit(1);
    }
}

export default connectToDatabase;