#!/usr/bin/env node

/**
 * Test the sites API endpoint specifically
 */

console.log('🔍 Testing Sites API Endpoint\n');

const API_BASE = 'http://localhost:3001/api/v1';

try {
    // First, authenticate to get a token
    console.log('🔐 Authenticating...');
    
    const signInResponse = await fetch(`${API_BASE}/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test123@gmail.com',  // User who owns the blogging site
            password: 'testpassword123'
        })
    });
    
    const signInData = await signInResponse.json();
    
    if (!signInData.success) {
        // Try the other test user
        console.log('  Trying other test user...');
        const signInResponse2 = await fetch(`${API_BASE}/auth/sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword123'
            })
        });
        
        const signInData2 = await signInResponse2.json();
        if (signInData2.success) {
            console.log('  ✅ Authenticated as test@example.com');
            var authToken = signInData2.data.token;
            var userId = signInData2.data.user.id;
        } else {
            throw new Error('Authentication failed for both users');
        }
    } else {
        console.log('  ✅ Authenticated as test123@gmail.com');
        var authToken = signInData.data.token;
        var userId = signInData.data.user.id;
    }
    
    console.log(`  👤 User ID: ${userId}`);
    console.log(`  🔑 Token: ${authToken.substring(0, 20)}...`);
    
    // Test the sites endpoint
    console.log('\n📋 Testing /wordpress/sites endpoint...');
    
    const sitesResponse = await fetch(`${API_BASE}/wordpress/sites`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    });
    
    console.log(`  📊 Response Status: ${sitesResponse.status}`);
    console.log(`  📊 Response Headers:`, Object.fromEntries(sitesResponse.headers.entries()));
    
    const sitesData = await sitesResponse.json();
    
    console.log('\n📄 Raw API Response:');
    console.log(JSON.stringify(sitesData, null, 2));
    
    if (sitesData.success) {
        console.log('\n✅ API Response Analysis:');
        console.log(`  📈 Sites count: ${sitesData.data.sites?.length || 0}`);
        
        if (sitesData.data.sites && sitesData.data.sites.length > 0) {
            console.log('\n📋 Sites Details:');
            sitesData.data.sites.forEach((site, index) => {
                console.log(`  ${index + 1}. ${site.siteName || site.siteUrl}`);
                console.log(`     URL: ${site.siteUrl}`);
                console.log(`     Type: ${site.siteType}`);
                console.log(`     Status: ${site.status}`);
                console.log(`     API Key: ${site.apiKey?.substring(0, 20)}...`);
            });
        } else {
            console.log('  ⚠️  No sites in API response');
        }
    } else {
        console.log('\n❌ API Error:');
        console.log(`  Message: ${sitesData.message}`);
        console.log(`  Error: ${sitesData.error}`);
    }
    
    // Test with curl-like request to see raw response
    console.log('\n🔧 Testing with different approach...');
    
    const rawResponse = await fetch(`${API_BASE}/wordpress/sites`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
            'User-Agent': 'Test-Script/1.0'
        }
    });
    
    const rawText = await rawResponse.text();
    console.log('📄 Raw Response Text:');
    console.log(rawText);
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
}

console.log('\n🏁 API test completed!');
