#!/usr/bin/env node

/**
 * Fix site ownership and create a clean test setup
 */

import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.development.local' });

console.log('🔧 Fixing Site Ownership\n');

const API_BASE = 'http://localhost:3001/api/v1';

try {
    const connectionString = process.env.DB_URI;
    const sql = postgres(connectionString);

    // Step 1: Find the blogging site
    console.log('🔍 Finding the blogging site...');
    
    const bloggingSites = await sql`
        SELECT * FROM wordpress_sites 
        WHERE site_url = 'https://blogging-website-s.netlify.app'
    `;
    
    if (bloggingSites.length > 0) {
        const site = bloggingSites[0];
        console.log('  ✅ Found blogging site:');
        console.log(`     ID: ${site.id}`);
        console.log(`     Current User ID: ${site.user_id}`);
        console.log(`     Site Name: ${site.site_name}`);
        console.log(`     URL: ${site.site_url}`);
        
        // Step 2: Create a demo user via API
        console.log('\n👤 Creating demo user via API...');
        
        const demoUser = {
            name: 'Demo User',
            email: 'demo@example.com',
            password: 'demo123'
        };
        
        let demoUserId = null;
        
        const signUpResponse = await fetch(`${API_BASE}/auth/sign-up`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(demoUser)
        });
        
        const signUpData = await signUpResponse.json();
        
        if (signUpData.success) {
            demoUserId = signUpData.data.user.id;
            console.log(`  ✅ Demo user created: ${demoUserId}`);
        } else {
            // Try to sign in if user exists
            const signInResponse = await fetch(`${API_BASE}/auth/sign-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: demoUser.email,
                    password: demoUser.password
                })
            });
            
            const signInData = await signInResponse.json();
            
            if (signInData.success) {
                demoUserId = signInData.data.user.id;
                console.log(`  ✅ Demo user signed in: ${demoUserId}`);
            } else {
                throw new Error('Failed to create demo user');
            }
        }
        
        // Step 3: Update the site ownership
        console.log('\n🔄 Updating site ownership...');
        
        await sql`
            UPDATE wordpress_sites 
            SET user_id = ${demoUserId},
                site_name = 'My Blogging Website',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${site.id}
        `;
        
        console.log('  ✅ Site ownership updated');
        
        // Step 4: Verify the change
        console.log('\n✅ Verifying the change...');
        
        const updatedSite = await sql`
            SELECT * FROM wordpress_sites 
            WHERE id = ${site.id}
        `;
        
        if (updatedSite.length > 0) {
            const updated = updatedSite[0];
            console.log('  ✅ Site updated successfully:');
            console.log(`     ID: ${updated.id}`);
            console.log(`     New User ID: ${updated.user_id}`);
            console.log(`     Site Name: ${updated.site_name}`);
            console.log(`     URL: ${updated.site_url}`);
            console.log(`     API Key: ${updated.api_key}`);
        }
        
        // Step 5: Test API with demo user
        console.log('\n🧪 Testing API with demo user...');
        
        const signInResponse = await fetch(`${API_BASE}/auth/sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: demoUser.email,
                password: demoUser.password
            })
        });
        
        const signInData = await signInResponse.json();
        
        if (signInData.success) {
            const token = signInData.data.token;
            
            const sitesResponse = await fetch(`${API_BASE}/wordpress/sites`, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const sitesData = await sitesResponse.json();
            
            if (sitesData.success) {
                console.log(`  ✅ API test successful - found ${sitesData.data.sites.length} sites`);
                
                sitesData.data.sites.forEach((site, index) => {
                    console.log(`    ${index + 1}. ${site.siteName} - ${site.siteUrl}`);
                });
                
                const bloggingSite = sitesData.data.sites.find(s => 
                    s.siteUrl.includes('blogging-website-s.netlify.app')
                );
                
                if (bloggingSite) {
                    console.log('\n🎉 SUCCESS! Blogging site is now accessible');
                    console.log('\n📋 Frontend Login Instructions:');
                    console.log(`   Email: ${demoUser.email}`);
                    console.log(`   Password: ${demoUser.password}`);
                    console.log('\n🌐 Expected Site in Dashboard:');
                    console.log(`   Name: ${bloggingSite.siteName}`);
                    console.log(`   URL: ${bloggingSite.siteUrl}`);
                    console.log(`   Status: ${bloggingSite.status}`);
                } else {
                    console.log('❌ Blogging site still not found in API response');
                }
            } else {
                console.log('❌ API test failed:', sitesData.message);
            }
        }
        
    } else {
        console.log('❌ Blogging site not found in database');
    }

    await sql.end();

} catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error(error);
}

console.log('\n🏁 Fix completed!');
