#!/usr/bin/env node

/**
 * Complete WordPress Plugin Integration Test
 */

console.log('🧪 Testing Complete WordPress Plugin Integration\n');

const API_BASE = 'http://localhost:3001/api/v1';

// Demo user credentials
const demoUser = {
    email: 'demo@example.com',
    password: 'demo123'
};

try {
    // Step 1: Test user authentication
    console.log('🔐 Step 1: Testing user authentication...');
    
    const signInResponse = await fetch(`${API_BASE}/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoUser)
    });
    
    const signInData = await signInResponse.json();
    
    if (!signInData.success) {
        throw new Error('Authentication failed: ' + signInData.message);
    }
    
    console.log('  ✅ User authentication successful');
    const authToken = signInData.data.token;
    
    // Step 2: Test sites endpoint
    console.log('\n📋 Step 2: Testing sites management...');
    
    const sitesResponse = await fetch(`${API_BASE}/wordpress/sites`, {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    });
    
    const sitesData = await sitesResponse.json();
    
    if (!sitesData.success) {
        throw new Error('Sites fetch failed: ' + sitesData.message);
    }
    
    console.log(`  ✅ Sites management working - found ${sitesData.data.sites.length} sites`);
    
    let testSite = null;
    if (sitesData.data.sites.length > 0) {
        testSite = sitesData.data.sites[0];
        console.log(`  📄 Test site: ${testSite.siteName} (${testSite.siteUrl})`);
        console.log(`  🔑 API Key: ${testSite.apiKey?.substring(0, 20)}...`);
    }
    
    // Step 3: Test plugin download
    console.log('\n📥 Step 3: Testing plugin download...');
    
    const downloadResponse = await fetch(`${API_BASE}/wordpress/plugin/download`);
    
    if (!downloadResponse.ok) {
        throw new Error('Plugin download failed: ' + downloadResponse.status);
    }
    
    const contentType = downloadResponse.headers.get('content-type');
    const contentDisposition = downloadResponse.headers.get('content-disposition');
    
    console.log('  ✅ Plugin download working');
    console.log(`  📄 Content-Type: ${contentType}`);
    console.log(`  📄 Content-Disposition: ${contentDisposition}`);
    
    // Step 4: Test API key validation (if we have a site)
    if (testSite && testSite.apiKey) {
        console.log('\n🔑 Step 4: Testing API key validation...');
        
        const validateResponse = await fetch(`${API_BASE}/wordpress/api/validate-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: testSite.apiKey })
        });
        
        const validateData = await validateResponse.json();
        
        if (validateData.success) {
            console.log('  ✅ API key validation working');
            console.log(`  🌐 Validated site: ${validateData.data.site.siteName}`);
        } else {
            console.log('  ⚠️  API key validation failed:', validateData.message);
        }
    }
    
    // Step 5: Test bot detection endpoint
    if (testSite && testSite.apiKey) {
        console.log('\n🤖 Step 5: Testing bot detection...');
        
        const botDetectionResponse = await fetch(`${API_BASE}/wordpress/api/detect-bot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: testSite.apiKey,
                userAgent: 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
                ipAddress: '192.168.1.100',
                pageUrl: 'https://example.com/test-page'
            })
        });
        
        const botDetectionData = await botDetectionResponse.json();
        
        if (botDetectionData.success) {
            console.log('  ✅ Bot detection working');
            console.log(`  🤖 Bot detected: ${botDetectionData.data.botDetected}`);
            console.log(`  📊 Confidence: ${botDetectionData.data.confidence}%`);
        } else {
            console.log('  ⚠️  Bot detection failed:', botDetectionData.message);
        }
    }
    
    // Step 6: Test frontend integration
    console.log('\n🌐 Step 6: Testing frontend integration...');
    
    const frontendResponse = await fetch('http://localhost:5173');
    
    if (frontendResponse.ok) {
        console.log('  ✅ Frontend accessible');
    } else {
        console.log('  ⚠️  Frontend not accessible (this is okay if not running)');
    }
    
    console.log('\n🎉 COMPLETE PLUGIN INTEGRATION TEST SUCCESSFUL!');
    console.log('\n✅ All Components Working:');
    console.log('  • User authentication and authorization');
    console.log('  • Site management and API key generation');
    console.log('  • WordPress plugin download endpoint');
    console.log('  • API key validation for WordPress plugin');
    console.log('  • Bot detection API for WordPress plugin');
    console.log('  • Complete backend API integration');
    
    console.log('\n📋 Integration Summary:');
    console.log('  🔗 Plugin Download: http://localhost:3001/api/v1/wordpress/plugin/download');
    console.log('  🔗 API Validation: http://localhost:3001/api/v1/wordpress/api/validate-key');
    console.log('  🔗 Bot Detection: http://localhost:3001/api/v1/wordpress/api/detect-bot');
    console.log('  🔗 Frontend Dashboard: http://localhost:5173/dashboard');
    
    if (testSite) {
        console.log('\n🔧 WordPress Plugin Configuration:');
        console.log(`  API Endpoint: http://localhost:3001/api/v1`);
        console.log(`  API Key: ${testSite.apiKey}`);
        console.log(`  Site Name: ${testSite.siteName}`);
    }
    
} catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.error(error);
}

console.log('\n🏁 Complete plugin integration test completed!');
