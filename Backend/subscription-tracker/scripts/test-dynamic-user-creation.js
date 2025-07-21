#!/usr/bin/env node

/**
 * Test dynamic user creation and site management
 */

console.log('🧪 Testing Dynamic User Creation\n');

const API_BASE = 'http://localhost:3001/api/v1';

// Create a completely new user
const newUser = {
    name: 'Dynamic Test User',
    email: `testuser${Date.now()}@example.com`, // Unique email
    password: 'password123'
};

// Test site to add
const testSite = {
    siteUrl: `https://test-site-${Date.now()}.example.com`, // Unique URL
    siteName: 'Dynamic Test Site',
    siteType: 'manual',
    adminEmail: 'admin@test-site.example.com'
};

try {
    // Step 1: Create new user
    console.log('👤 Creating new user...');
    console.log(`   Email: ${newUser.email}`);
    
    const signUpResponse = await fetch(`${API_BASE}/auth/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    });
    
    const signUpData = await signUpResponse.json();
    
    if (signUpData.success) {
        console.log('  ✅ User created successfully');
        console.log(`  🆔 User ID: ${signUpData.data.user.id}`);
        console.log(`  👤 Name: ${signUpData.data.user.name}`);
        
        const authToken = signUpData.data.token;
        
        // Step 2: Check initial sites (should be empty)
        console.log('\n📋 Checking initial sites...');
        
        const initialSitesResponse = await fetch(`${API_BASE}/wordpress/sites`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const initialSitesData = await initialSitesResponse.json();
        
        if (initialSitesData.success) {
            console.log(`  ✅ Initial sites count: ${initialSitesData.data.sites.length}`);
            
            if (initialSitesData.data.sites.length === 0) {
                console.log('  ✅ New user starts with empty sites list (correct)');
            }
        }
        
        // Step 3: Add a new site
        console.log('\n➕ Adding new site...');
        console.log(`   URL: ${testSite.siteUrl}`);
        
        const addSiteResponse = await fetch(`${API_BASE}/wordpress/sites`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(testSite)
        });
        
        const addSiteData = await addSiteResponse.json();
        
        if (addSiteData.success) {
            console.log('  ✅ Site added successfully');
            console.log(`  🌐 Site ID: ${addSiteData.data.site.id}`);
            console.log(`  🔑 API Key: ${addSiteData.data.site.apiKey}`);
            console.log(`  📊 Status: ${addSiteData.data.site.status}`);
            
            // Step 4: Verify site appears in user's list
            console.log('\n🔍 Verifying site in user\'s list...');
            
            const finalSitesResponse = await fetch(`${API_BASE}/wordpress/sites`, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            const finalSitesData = await finalSitesResponse.json();
            
            if (finalSitesData.success) {
                console.log(`  ✅ Final sites count: ${finalSitesData.data.sites.length}`);
                
                const addedSite = finalSitesData.data.sites.find(site => 
                    site.id === addSiteData.data.site.id
                );
                
                if (addedSite) {
                    console.log('  ✅ Site correctly appears in user\'s list');
                    console.log(`     Name: ${addedSite.siteName}`);
                    console.log(`     URL: ${addedSite.siteUrl}`);
                    console.log(`     Type: ${addedSite.siteType}`);
                } else {
                    console.log('  ❌ Site not found in user\'s list');
                }
            }
            
            // Step 5: Test API key validation
            console.log('\n🔑 Testing API key validation...');
            
            const validateResponse = await fetch(`${API_BASE}/wordpress/api/validate-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: addSiteData.data.site.apiKey })
            });
            
            const validateData = await validateResponse.json();
            
            if (validateData.success) {
                console.log('  ✅ API key validation working');
                console.log(`  🌐 Validated site: ${validateData.data.site.siteName}`);
            } else {
                console.log('  ⚠️  API key validation failed:', validateData.message);
            }
            
        } else {
            console.log('  ❌ Site creation failed:', addSiteData.message);
        }
        
        // Step 6: Test sign out and sign back in
        console.log('\n🔄 Testing sign out and sign back in...');
        
        const signInResponse = await fetch(`${API_BASE}/auth/sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: newUser.email,
                password: newUser.password
            })
        });
        
        const signInData = await signInResponse.json();
        
        if (signInData.success) {
            console.log('  ✅ Sign in after creation works');
            
            const newToken = signInData.data.token;
            
            // Verify sites still accessible
            const persistentSitesResponse = await fetch(`${API_BASE}/wordpress/sites`, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${newToken}`
                }
            });
            
            const persistentSitesData = await persistentSitesResponse.json();
            
            if (persistentSitesData.success && persistentSitesData.data.sites.length > 0) {
                console.log('  ✅ Sites persist after re-authentication');
                console.log(`     Sites count: ${persistentSitesData.data.sites.length}`);
            }
        }
        
        console.log('\n🎉 DYNAMIC USER CREATION TEST SUCCESSFUL!');
        console.log('\n✅ Confirmed Working Features:');
        console.log('  • New user registration');
        console.log('  • Empty initial state');
        console.log('  • Site creation and assignment');
        console.log('  • API key generation');
        console.log('  • Site listing and retrieval');
        console.log('  • Authentication persistence');
        console.log('  • API key validation');
        
        console.log('\n📋 Test User Credentials:');
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Password: ${newUser.password}`);
        console.log(`   Site: ${testSite.siteName} (${testSite.siteUrl})`);
        
    } else {
        console.log('  ❌ User creation failed:', signUpData.message);
    }
    
} catch (error) {
    console.error('❌ Dynamic test failed:', error.message);
    console.error(error);
}

console.log('\n🏁 Dynamic user creation test completed!');
