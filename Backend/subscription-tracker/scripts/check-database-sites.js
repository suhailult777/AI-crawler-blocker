#!/usr/bin/env node

/**
 * Check if sites are actually saved in the database
 */

import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.development.local' });

console.log('🔍 Checking Database for Sites\n');

try {
    const connectionString = process.env.DB_URI;
    if (!connectionString) {
        throw new Error('DB_URI not found in environment variables');
    }

    const sql = postgres(connectionString);

    // Check if wordpress_sites table exists
    console.log('📋 Checking if wordpress_sites table exists...');
    const tableExists = await sql`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'wordpress_sites'
        );
    `;
    
    if (tableExists[0].exists) {
        console.log('  ✅ wordpress_sites table exists');
        
        // Get all sites
        console.log('\n📊 Fetching all sites from database...');
        const sites = await sql`
            SELECT 
                id, user_id, site_url, site_name, site_type, status, 
                api_key, created_at, monetization_enabled
            FROM wordpress_sites 
            ORDER BY created_at DESC;
        `;
        
        console.log(`  📈 Found ${sites.length} sites in database:`);
        
        if (sites.length > 0) {
            sites.forEach((site, index) => {
                console.log(`\n  ${index + 1}. Site Details:`);
                console.log(`     ID: ${site.id}`);
                console.log(`     User ID: ${site.user_id}`);
                console.log(`     URL: ${site.site_url}`);
                console.log(`     Name: ${site.site_name || 'N/A'}`);
                console.log(`     Type: ${site.site_type}`);
                console.log(`     Status: ${site.status}`);
                console.log(`     API Key: ${site.api_key.substring(0, 20)}...`);
                console.log(`     Monetization: ${site.monetization_enabled}`);
                console.log(`     Created: ${site.created_at}`);
            });
        } else {
            console.log('  ⚠️  No sites found in database');
        }
        
        // Check users table to see if user exists
        console.log('\n👤 Checking users...');
        const users = await sql`
            SELECT id, name, email, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 5;
        `;
        
        console.log(`  👥 Found ${users.length} users:`);
        users.forEach((user, index) => {
            console.log(`    ${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`);
        });
        
    } else {
        console.log('  ❌ wordpress_sites table does not exist');
    }

    await sql.end();

} catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error(error);
}

console.log('\n🏁 Database check completed!');
