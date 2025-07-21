#!/usr/bin/env node

/**
 * Test the demo user with blogging site
 */

console.log('🔍 Testing Demo User with Blogging Site\n');

const API_BASE = 'http://localhost:3001/api/v1';

const demoUser = {
    email: 'demo@example.com',
    password: 'demo123'
};

try {
    // Test authentication
    console.log('🔐 Testing demo user authentication...');
    
    const signInResponse = await fetch(`${API_BASE}/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoUser)
    });
    
    const signInData = await signInResponse.json();
    
    if (signInData.success) {
        console.log('  ✅ Demo user authentication successful');
        console.log(`  👤 User: ${signInData.data.user.name} (${signInData.data.user.email})`);
        
        const authToken = signInData.data.token;
        
        // Test sites endpoint
        console.log('\n📋 Testing sites endpoint...');
        
        const sitesResponse = await fetch(`${API_BASE}/wordpress/sites`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const sitesData = await sitesResponse.json();
        
        if (sitesData.success) {
            console.log(`  ✅ Sites API working - found ${sitesData.data.sites.length} sites`);
            
            if (sitesData.data.sites.length > 0) {
                console.log('\n📋 Sites for demo user:');
                sitesData.data.sites.forEach((site, index) => {
                    console.log(`  ${index + 1}. ${site.siteName}`);
                    console.log(`     URL: ${site.siteUrl}`);
                    console.log(`     Type: ${site.siteType}`);
                    console.log(`     Status: ${site.status}`);
                    console.log(`     API Key: ${site.apiKey?.substring(0, 20)}...`);
                    console.log('');
                });
                
                // Check for the blogging site specifically
                const bloggingSite = sitesData.data.sites.find(site => 
                    site.siteUrl.includes('blogging-website-s.netlify.app')
                );
                
                if (bloggingSite) {
                    console.log('🎉 BLOGGING SITE FOUND AND ACCESSIBLE!');
                    console.log(`   Name: ${bloggingSite.siteName}`);
                    console.log(`   URL: ${bloggingSite.siteUrl}`);
                    console.log(`   Status: ${bloggingSite.status}`);
                    console.log(`   Monetization: ${bloggingSite.monetizationEnabled ? 'Enabled' : 'Disabled'}`);
                    
                    // Test API key validation
                    console.log('\n🔑 Testing API key validation...');
                    
                    const validateResponse = await fetch(`${API_BASE}/wordpress/api/validate-key`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ apiKey: bloggingSite.apiKey })
                    });
                    
                    const validateData = await validateResponse.json();
                    
                    if (validateData.success) {
                        console.log('  ✅ API key validation working');
                        console.log(`  🌐 Site validated: ${validateData.data.site.siteName}`);
                    } else {
                        console.log('  ⚠️  API key validation failed:', validateData.message);
                    }
                    
                } else {
                    console.log('❌ Blogging site not found in user\'s sites');
                }
            } else {
                console.log('  ⚠️  No sites found for demo user');
            }
        } else {
            console.log('  ❌ Sites API failed:', sitesData.message);
        }
        
    } else {
        console.log('  ❌ Demo user authentication failed:', signInData.message);
    }
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
}

console.log('\n🏁 Demo user test completed!');
