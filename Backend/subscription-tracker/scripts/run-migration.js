#!/usr/bin/env node

/**
 * Script to run the WordPress migration manually
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.development.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🗄️ Running WordPress Migration\n');

try {
    // Connect to database
    const connectionString = process.env.DB_URI;
    if (!connectionString) {
        throw new Error('DB_URI not found in environment variables');
    }

    console.log('📡 Connecting to database...');
    const sql = postgres(connectionString);
    const db = drizzle(sql);

    // Read migration file
    const migrationPath = join(__dirname, '../migrations/001_wordpress_simple.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration SQL...');

    // Execute the migration
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!');

    // Test if tables were created
    console.log('\n🔍 Verifying tables...');

    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('wordpress_sites', 'bot_requests', 'site_analytics', 'plugin_configurations')
        ORDER BY table_name;
    `;

    console.log('📊 Created tables:');
    for (const table of tables) {
        console.log(`  ✅ ${table.table_name}`);
    }

    // Close connection
    await sql.end();

    console.log('\n🎉 WordPress plugin database setup complete!');

} catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
}
