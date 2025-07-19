#!/usr/bin/env node

/**
 * Test with the correct user who owns the blogging site
 */

console.log('🔍 Testing with Correct User (test123@gmail.com)\n');

const API_BASE = 'http://localhost:3001/api/v1';

try {
    // Try to sign in with test123@gmail.com
    console.log('🔐 Authenticating as test123@gmail.com...');
    
    const signInResponse = await fetch(`${API_BASE}/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test123@gmail.com',
            password: 'testpassword123'
        })
    });
    
    const signInData = await signInResponse.json();
    
    if (signInData.success) {
        console.log('  ✅ Authentication successful');
        console.log(`  👤 User: ${signInData.data.user.name} (${signInData.data.user.email})`);
        console.log(`  🆔 User ID: ${signInData.data.user.id}`);
        
        const authToken = signInData.data.token;
        
        // Test the sites endpoint
        console.log('\n📋 Fetching sites for this user...');
        
        const sitesResponse = await fetch(`${API_BASE}/wordpress/sites`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const sitesData = await sitesResponse.json();
        
        if (sitesData.success) {
            console.log(`  ✅ Found ${sitesData.data.sites.length} sites`);
            
            if (sitesData.data.sites.length > 0) {
                console.log('\n📋 Sites for test123@gmail.com:');
                sitesData.data.sites.forEach((site, index) => {
                    console.log(`  ${index + 1}. ${site.siteName || site.siteUrl}`);
                    console.log(`     URL: ${site.siteUrl}`);
                    console.log(`     Type: ${site.siteType}`);
                    console.log(`     Status: ${site.status}`);
                    console.log(`     Created: ${site.createdAt}`);
                    console.log('');
                });
                
                // Check if the blogging site is there
                const bloggingSite = sitesData.data.sites.find(site => 
                    site.siteUrl.includes('blogging-website-s.netlify.app')
                );
                
                if (bloggingSite) {
                    console.log('🎉 FOUND THE BLOGGING SITE!');
                    console.log(`   Name: ${bloggingSite.siteName}`);
                    console.log(`   URL: ${bloggingSite.siteUrl}`);
                    console.log(`   ID: ${bloggingSite.id}`);
                } else {
                    console.log('❌ Blogging site not found in this user\'s sites');
                }
            } else {
                console.log('  ⚠️  No sites found for this user');
            }
        } else {
            console.log('  ❌ Failed to fetch sites:', sitesData.message);
        }
        
    } else {
        console.log('  ❌ Authentication failed:', signInData.message);
        
        // Try to create the user if it doesn't exist
        console.log('\n🆕 Trying to create user test123@gmail.com...');
        
        const signUpResponse = await fetch(`${API_BASE}/auth/sign-up`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'test123',
                email: 'test123@gmail.com',
                password: 'testpassword123'
            })
        });
        
        const signUpData = await signUpResponse.json();
        
        if (signUpData.success) {
            console.log('  ✅ User created successfully');
            console.log(`  👤 User: ${signUpData.data.user.name} (${signUpData.data.user.email})`);
            console.log(`  🆔 User ID: ${signUpData.data.user.id}`);
        } else {
            console.log('  ❌ User creation failed:', signUpData.message);
        }
    }
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
}

console.log('\n🏁 Test completed!');
