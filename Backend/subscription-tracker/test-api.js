// Simple API test script
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5500/api/v1';

async function testAPI() {
    console.log('🧪 Testing AI Crawler Subscription API...\n');

    try {
        // Test 1: Health check
        console.log('1. Testing health check...');
        const healthResponse = await fetch('http://localhost:5500/');
        if (healthResponse.ok) {
            const healthText = await healthResponse.text();
            console.log('✅ Health check passed:', healthText);
        } else {
            console.log('❌ Health check failed');
        }

        // Test 2: Create a test user
        console.log('\n2. Testing user registration...');
        const testUser = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123'
        };

        const signUpResponse = await fetch(`${API_BASE}/auth/sign-up`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        if (signUpResponse.ok) {
            const signUpData = await signUpResponse.json();
            console.log('✅ User registration successful');
            console.log(`   User ID: ${signUpData.data.user.id}`);
            console.log(`   Token: ${signUpData.data.token.substring(0, 20)}...`);

            const token = signUpData.data.token;
            const userId = signUpData.data.user.id;

            // Test 3: Create a subscription
            console.log('\n3. Testing subscription creation...');
            const subscriptionData = {
                planName: 'pro',
                planDisplayName: 'Pro Plan',
                price: 15,
                currency: 'USD',
                frequency: 'monthly',
                paymentMethod: 'stripe',
                startDate: new Date().toISOString()
            };

            const subscriptionResponse = await fetch(`${API_BASE}/subscriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(subscriptionData)
            });

            if (subscriptionResponse.ok) {
                const subscriptionResult = await subscriptionResponse.json();
                console.log('✅ Subscription creation successful');
                console.log(`   Subscription ID: ${subscriptionResult.data.subscription.id}`);
                console.log(`   Plan: ${subscriptionResult.data.subscription.planDisplayName}`);
                console.log(`   Price: $${subscriptionResult.data.subscription.price}/${subscriptionResult.data.subscription.frequency}`);
                console.log('   📧 Subscription success email should be sent to: suhailult777@gmail.com');

                const subscriptionId = subscriptionResult.data.subscription.id;

                // Test 4: Get current subscription
                console.log('\n4. Testing get current subscription...');
                const currentSubResponse = await fetch(`${API_BASE}/subscriptions/me/current`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (currentSubResponse.ok) {
                    const currentSub = await currentSubResponse.json();
                    console.log('✅ Get current subscription successful');
                    console.log(`   Status: ${currentSub.data.status}`);
                    console.log(`   Renewal Date: ${new Date(currentSub.data.renewalDate).toLocaleDateString()}`);
                } else {
                    console.log('❌ Get current subscription failed');
                }

                // Test 5: Upgrade plan
                console.log('\n5. Testing plan upgrade...');
                const upgradeResponse = await fetch(`${API_BASE}/subscriptions/me/upgrade`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ planName: 'enterprise' })
                });

                if (upgradeResponse.ok) {
                    const upgradeResult = await upgradeResponse.json();
                    console.log('✅ Plan upgrade successful');
                    console.log(`   New Plan: ${upgradeResult.data.planDisplayName}`);
                    console.log(`   New Price: $${upgradeResult.data.price}/${upgradeResult.data.frequency}`);
                } else {
                    console.log('❌ Plan upgrade failed');
                }

                // Test 6: Cancel subscription
                console.log('\n6. Testing subscription cancellation...');
                const cancelResponse = await fetch(`${API_BASE}/subscriptions/${subscriptionId}/cancel`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (cancelResponse.ok) {
                    const cancelResult = await cancelResponse.json();
                    console.log('✅ Subscription cancellation successful');
                    console.log(`   Status: ${cancelResult.data.status}`);
                    console.log(`   Cancelled At: ${new Date(cancelResult.data.cancelledAt).toLocaleDateString()}`);
                    console.log('   📧 Cancellation confirmation email should be sent to: suhailult777@gmail.com');
                } else {
                    const cancelError = await cancelResponse.json();
                    console.log('❌ Subscription cancellation failed:', cancelError.message);
                }

            } else {
                const error = await subscriptionResponse.json();
                console.log('❌ Subscription creation failed:', error.message);
            }

        } else {
            const error = await signUpResponse.json();
            console.log('❌ User registration failed:', error.message);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }

    console.log('\n🏁 API testing completed!');
}

// Run the test
testAPI();
