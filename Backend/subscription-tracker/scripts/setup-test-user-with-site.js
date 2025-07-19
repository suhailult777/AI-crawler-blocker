#!/usr/bin/env node

/**
 * Set up a test user with the blogging site
 */

console.log('🔧 Setting up Test User with Blogging Site\n');

const API_BASE = 'http://localhost:3001/api/v1';

// Test user that will be easy to log in with
const testUser = {
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'demo123'
};

// The blogging site data
const bloggingSite = {
    siteUrl: 'https://blogging-website-s.netlify.app',
    siteName: 'My Blogging Website',
    siteType: 'manual',
    adminEmail: 'admin@blogging-website-s.netlify.app'
};

try {
    // Step 1: Create or sign in the demo user
    console.log('👤 Setting up demo user...');
    
    let authToken = null;
    let userId = null;
    
    // Try to sign up first
    const signUpResponse = await fetch(`${API_BASE}/auth/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
    });
    
    const signUpData = await signUpResponse.json();
    
    if (signUpData.success) {
        console.log('  ✅ Demo user created successfully');
        authToken = signUpData.data.token;
        userId = signUpData.data.user.id;
    } else {
        // User might already exist, try to sign in
        console.log('  ℹ️  User might exist, trying sign in...');
        
        const signInResponse = await fetch(`${API_BASE}/auth/sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });
        
        const signInData = await signInResponse.json();
        
        if (signInData.success) {
            console.log('  ✅ Demo user signed in successfully');
            authToken = signInData.data.token;
            userId = signInData.data.user.id;
        } else {
            throw new Error('Failed to create or sign in demo user');
        }
    }
    
    console.log(`  🆔 User ID: ${userId}`);
    console.log(`  🔑 Token: ${authToken.substring(0, 20)}...`);
    
    // Step 2: Check if the site already exists for this user
    console.log('\n🔍 Checking existing sites...');
    
    const sitesResponse = await fetch(`${API_BASE}/wordpress/sites`, {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    });
    
    const sitesData = await sitesResponse.json();
    
    if (sitesData.success) {
        const existingSite = sitesData.data.sites.find(site => 
            site.siteUrl === bloggingSite.siteUrl
        );
        
        if (existingSite) {
            console.log('  ✅ Blogging site already exists for this user');
            console.log(`     Site ID: ${existingSite.id}`);
            console.log(`     Site Name: ${existingSite.siteName}`);
            console.log(`     API Key: ${existingSite.apiKey}`);
        } else {
            // Step 3: Add the blogging site
            console.log('  ➕ Adding blogging site...');
            
            const addSiteResponse = await fetch(`${API_BASE}/wordpress/sites`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(bloggingSite)
            });
            
            const addSiteData = await addSiteResponse.json();
            
            if (addSiteData.success) {
                console.log('  ✅ Blogging site added successfully');
                console.log(`     Site ID: ${addSiteData.data.site.id}`);
                console.log(`     Site Name: ${addSiteData.data.site.siteName}`);
                console.log(`     API Key: ${addSiteData.data.site.apiKey}`);
            } else {
                console.log('  ❌ Failed to add site:', addSiteData.message);
            }
        }
    }
    
    // Step 4: Final verification
    console.log('\n✅ Final verification...');
    
    const finalSitesResponse = await fetch(`${API_BASE}/wordpress/sites`, {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    });
    
    const finalSitesData = await finalSitesResponse.json();
    
    if (finalSitesData.success) {
        console.log(`  📊 Total sites for demo user: ${finalSitesData.data.sites.length}`);
        
        finalSitesData.data.sites.forEach((site, index) => {
            console.log(`    ${index + 1}. ${site.siteName} - ${site.siteUrl}`);
        });
        
        const bloggingSiteExists = finalSitesData.data.sites.find(site => 
            site.siteUrl === bloggingSite.siteUrl
        );
        
        if (bloggingSiteExists) {
            console.log('\n🎉 SUCCESS! Setup completed successfully');
            console.log('\n📋 Frontend Login Instructions:');
            console.log(`   Email: ${testUser.email}`);
            console.log(`   Password: ${testUser.password}`);
            console.log('\n🌐 Expected Site in Dashboard:');
            console.log(`   Name: ${bloggingSiteExists.siteName}`);
            console.log(`   URL: ${bloggingSiteExists.siteUrl}`);
            console.log(`   Status: ${bloggingSiteExists.status}`);
        } else {
            console.log('\n❌ Site verification failed - site not found');
        }
    }
    
} catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
}

console.log('\n🏁 Setup completed!');
