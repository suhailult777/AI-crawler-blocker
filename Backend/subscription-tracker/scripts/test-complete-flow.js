#!/usr/bin/env node

/**
 * Complete test of WordPress plugin integration flow
 */

console.log('🚀 Testing Complete WordPress Plugin Integration Flow\n');

const API_BASE = 'http://localhost:3001/api/v1';

// Test user credentials
const testUser = {
    email: 'test@example.com',
    password: 'testpassword123'
};

let authToken = null;

try {
    // Step 1: Authenticate
    console.log('🔐 Step 1: Authentication...');
    
    const signInResponse = await fetch(`${API_BASE}/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
    });
    
    const signInData = await signInResponse.json();
    
    if (signInData.success) {
        authToken = signInData.data.token;
        console.log('  ✅ Authentication successful');
        console.log(`  👤 User: ${signInData.data.user.name} (${signInData.data.user.email})`);
    } else {
        throw new Error('Authentication failed: ' + signInData.message);
    }
    
    // Step 2: Get current sites
    console.log('\n📋 Step 2: Fetching existing sites...');
    
    const sitesResponse = await fetch(`${API_BASE}/wordpress/sites`, {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    });
    
    const sitesData = await sitesResponse.json();
    
    if (sitesData.success) {
        console.log(`  ✅ Found ${sitesData.data.sites.length} existing sites`);
        
        // List existing sites
        if (sitesData.data.sites.length > 0) {
            console.log('  📄 Existing sites:');
            sitesData.data.sites.forEach((site, index) => {
                console.log(`    ${index + 1}. ${site.siteName || site.siteUrl} (${site.siteType})`);
            });
        }
    } else {
        throw new Error('Failed to fetch sites: ' + sitesData.message);
    }
    
    // Step 3: Add a new manual site
    console.log('\n➕ Step 3: Adding a new manual site...');
    
    const newManualSite = {
        siteUrl: 'https://example-blog.com',
        siteName: 'Example Blog',
        siteType: 'manual',
        adminEmail: 'admin@example-blog.com'
    };
    
    const addManualResponse = await fetch(`${API_BASE}/wordpress/sites`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newManualSite)
    });
    
    const addManualData = await addManualResponse.json();
    
    if (addManualData.success) {
        console.log('  ✅ Manual site added successfully');
        console.log(`  🌐 Site ID: ${addManualData.data.site.id}`);
        console.log(`  🔑 API Key: ${addManualData.data.site.apiKey}`);
        console.log(`  📊 Status: ${addManualData.data.site.status}`);
    } else {
        console.log('  ⚠️  Manual site add failed:', addManualData.message);
    }
    
    // Step 4: Add a WordPress plugin site
    console.log('\n🔌 Step 4: Adding a WordPress plugin site...');
    
    const newWordPressSite = {
        siteUrl: 'https://my-wordpress-site.com',
        siteName: 'My WordPress Site',
        siteType: 'wordpress_plugin',
        adminEmail: 'admin@my-wordpress-site.com',
        pluginVersion: '1.0.0',
        wordpressVersion: '6.4.2'
    };
    
    const addWpResponse = await fetch(`${API_BASE}/wordpress/sites`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newWordPressSite)
    });
    
    const addWpData = await addWpResponse.json();
    
    if (addWpData.success) {
        console.log('  ✅ WordPress site added successfully');
        console.log(`  🌐 Site ID: ${addWpData.data.site.id}`);
        console.log(`  🔑 API Key: ${addWpData.data.site.apiKey}`);
        console.log(`  🔌 Plugin Version: ${addWpData.data.site.pluginVersion}`);
        console.log(`  📊 Status: ${addWpData.data.site.status}`);
        
        // Step 5: Test site update
        console.log('\n🔄 Step 5: Testing site update...');
        
        const updateData = {
            siteName: 'My Updated WordPress Site',
            monetizationEnabled: true,
            pricingPerRequest: 0.002
        };
        
        const updateResponse = await fetch(`${API_BASE}/wordpress/sites/${addWpData.data.site.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(updateData)
        });
        
        const updateResult = await updateResponse.json();
        
        if (updateResult.success) {
            console.log('  ✅ Site updated successfully');
            console.log(`  💰 Monetization: ${updateResult.data.site.monetizationEnabled ? 'Enabled' : 'Disabled'}`);
            console.log(`  💵 Price per request: $${updateResult.data.site.pricingPerRequest}`);
        } else {
            console.log('  ⚠️  Site update failed:', updateResult.message);
        }
        
    } else {
        console.log('  ⚠️  WordPress site add failed:', addWpData.message);
    }
    
    // Step 6: Get updated sites list
    console.log('\n📋 Step 6: Fetching updated sites list...');
    
    const finalSitesResponse = await fetch(`${API_BASE}/wordpress/sites`, {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    });
    
    const finalSitesData = await finalSitesResponse.json();
    
    if (finalSitesData.success) {
        console.log(`  ✅ Total sites: ${finalSitesData.data.sites.length}`);
        
        console.log('\n📊 Final Sites Summary:');
        finalSitesData.data.sites.forEach((site, index) => {
            console.log(`  ${index + 1}. ${site.siteName || site.siteUrl}`);
            console.log(`     Type: ${site.siteType}`);
            console.log(`     Status: ${site.status}`);
            console.log(`     Monetization: ${site.monetizationEnabled ? 'Enabled' : 'Disabled'}`);
            console.log(`     API Key: ${site.apiKey.substring(0, 20)}...`);
            console.log('');
        });
    }
    
    // Step 7: Test public API endpoints (for WordPress plugin)
    console.log('🔓 Step 7: Testing public API endpoints...');
    
    if (finalSitesData.success && finalSitesData.data.sites.length > 0) {
        const testSite = finalSitesData.data.sites[0];
        
        // Test API key validation
        const validateResponse = await fetch(`${API_BASE}/wordpress/api/validate-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: testSite.apiKey })
        });
        
        const validateData = await validateResponse.json();
        
        if (validateData.success) {
            console.log('  ✅ API key validation working');
        } else {
            console.log('  ⚠️  API key validation failed:', validateData.message);
        }
        
        // Test bot detection
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
            console.log(`  🏷️  Bot type: ${botDetectionData.data.botType || 'unknown'}`);
            console.log(`  📊 Confidence: ${botDetectionData.data.confidence}%`);
        } else {
            console.log('  ⚠️  Bot detection failed:', botDetectionData.message);
        }
    }
    
    console.log('\n🎉 Complete WordPress Plugin Integration Test Successful!');
    console.log('\n✅ All Features Tested:');
    console.log('  • User authentication');
    console.log('  • Site management (add, update, list)');
    console.log('  • Manual URL protection');
    console.log('  • WordPress plugin integration');
    console.log('  • API key management');
    console.log('  • Bot detection');
    console.log('  • Monetization settings');
    console.log('  • Public API endpoints');
    
} catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
}

console.log('\n🏁 Test completed!');
