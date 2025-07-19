#!/usr/bin/env node

/**
 * Test script to verify API endpoints are working
 */

console.log('🔍 Testing API Endpoints\n');

// Test 1: Test authentication endpoint
console.log('🔐 Testing Authentication...');

const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpassword123'
};

try {
    // Test sign up
    const signUpResponse = await fetch('http://localhost:3001/api/v1/auth/sign-up', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
    });

    const signUpData = await signUpResponse.json();
    
    if (signUpData.success) {
        console.log('  ✅ Sign up successful');
        console.log(`  📧 User: ${signUpData.data.user.email}`);
        console.log(`  🔑 Token: ${signUpData.data.token.substring(0, 20)}...`);
        
        const token = signUpData.data.token;
        
        // Test WordPress sites endpoint with authentication
        console.log('\n🌐 Testing WordPress Sites API...');
        
        const sitesResponse = await fetch('http://localhost:3001/api/v1/wordpress/sites', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const sitesData = await sitesResponse.json();
        
        if (sitesData.success) {
            console.log('  ✅ WordPress sites API working');
            console.log(`  📊 Sites count: ${sitesData.data.sites?.length || 0}`);
        } else {
            console.log('  ❌ WordPress sites API failed:', sitesData.message);
        }
        
        // Test adding a site
        console.log('\n➕ Testing Add Site...');
        
        const testSite = {
            siteUrl: 'https://test-site.example.com',
            siteName: 'Test Site',
            siteType: 'manual',
            adminEmail: 'admin@test-site.example.com'
        };
        
        const addSiteResponse = await fetch('http://localhost:3001/api/v1/wordpress/sites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testSite)
        });
        
        const addSiteData = await addSiteResponse.json();
        
        if (addSiteData.success) {
            console.log('  ✅ Site added successfully');
            console.log(`  🌐 Site ID: ${addSiteData.data.site.id}`);
            console.log(`  🔑 API Key: ${addSiteData.data.site.apiKey}`);
        } else {
            console.log('  ❌ Add site failed:', addSiteData.message);
        }
        
    } else {
        console.log('  ❌ Sign up failed:', signUpData.message);
        
        // Try sign in instead
        console.log('\n🔓 Trying Sign In...');
        
        const signInResponse = await fetch('http://localhost:3001/api/v1/auth/sign-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });
        
        const signInData = await signInResponse.json();
        
        if (signInData.success) {
            console.log('  ✅ Sign in successful');
            const token = signInData.data.token;
            
            // Test WordPress sites endpoint
            const sitesResponse = await fetch('http://localhost:3001/api/v1/wordpress/sites', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const sitesData = await sitesResponse.json();
            console.log('  📊 Sites response:', sitesData);
            
        } else {
            console.log('  ❌ Sign in failed:', signInData.message);
        }
    }
    
} catch (error) {
    console.log('  ❌ API test failed:', error.message);
}

console.log('\n🏁 API endpoint test completed!');
