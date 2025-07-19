#!/usr/bin/env node

/**
 * Test script for WordPress Plugin Integration
 * This script tests the complete WordPress plugin functionality
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.development.local' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const TEST_SITES = [
    {
        siteUrl: 'https://test-site-1.example.com',
        siteName: 'Test Site 1',
        siteType: 'wordpress_plugin',
        adminEmail: 'admin@test-site-1.example.com'
    },
    {
        siteUrl: 'https://test-site-2.example.com',
        siteName: 'Test Site 2',
        siteType: 'manual',
        adminEmail: 'admin@test-site-2.example.com'
    }
];

const AI_BOTS_TO_TEST = [
    {
        userAgent: 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
        expectedBot: 'OpenAI',
        expectedDetection: true
    },
    {
        userAgent: 'ClaudeBot/1.0 (+https://www.anthropic.com/claudebot)',
        expectedBot: 'Anthropic',
        expectedDetection: true
    },
    {
        userAgent: 'Mozilla/5.0 (compatible; Google-Extended)',
        expectedBot: 'Google',
        expectedDetection: true
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        expectedBot: null,
        expectedDetection: false
    }
];

class WordPressIntegrationTester {
    constructor() {
        this.testResults = [];
        this.authToken = null;
        this.testSites = [];
    }

    async runAllTests() {
        console.log('🚀 Starting WordPress Plugin Integration Tests\n');

        try {
            // Step 1: Authentication
            await this.testAuthentication();

            // Step 2: Site Registration
            await this.testSiteRegistration();

            // Step 3: Bot Detection
            await this.testBotDetection();

            // Step 4: Analytics
            await this.testAnalytics();

            // Step 5: Site Management
            await this.testSiteManagement();

            // Step 6: Cleanup
            await this.cleanup();

            // Print results
            this.printResults();

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            process.exit(1);
        }
    }

    async testAuthentication() {
        console.log('🔐 Testing Authentication...');
        
        try {
            // For testing, we'll use a mock user or create a test user
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'testpassword123'
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.authToken = data.token;
                this.addResult('Authentication', true, 'Successfully authenticated');
            } else {
                this.addResult('Authentication', false, 'Failed to authenticate');
            }
        } catch (error) {
            this.addResult('Authentication', false, `Error: ${error.message}`);
        }
    }

    async testSiteRegistration() {
        console.log('🌐 Testing Site Registration...');

        for (const siteData of TEST_SITES) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/wordpress/sites`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.authToken}`
                    },
                    body: JSON.stringify(siteData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    this.testSites.push(result.data.site);
                    this.addResult(
                        `Site Registration (${siteData.siteName})`,
                        true,
                        `Site registered with API key: ${result.data.site.apiKey}`
                    );
                } else {
                    this.addResult(
                        `Site Registration (${siteData.siteName})`,
                        false,
                        result.message || 'Registration failed'
                    );
                }
            } catch (error) {
                this.addResult(
                    `Site Registration (${siteData.siteName})`,
                    false,
                    `Error: ${error.message}`
                );
            }
        }
    }

    async testBotDetection() {
        console.log('🤖 Testing Bot Detection...');

        if (this.testSites.length === 0) {
            this.addResult('Bot Detection', false, 'No test sites available');
            return;
        }

        const testSite = this.testSites[0];

        for (const botTest of AI_BOTS_TO_TEST) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/wordpress/api/detect-bot`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': testSite.apiKey
                    },
                    body: JSON.stringify({
                        userAgent: botTest.userAgent,
                        ipAddress: '192.168.1.100',
                        pageUrl: `${testSite.siteUrl}/test-page`,
                        siteUrl: testSite.siteUrl
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    const detectionCorrect = result.data.botDetected === botTest.expectedDetection;
                    const botNameCorrect = !botTest.expectedBot || 
                        (result.data.botInfo.company && result.data.botInfo.company.includes(botTest.expectedBot));

                    this.addResult(
                        `Bot Detection (${botTest.expectedBot || 'Human'})`,
                        detectionCorrect && (botNameCorrect || !botTest.expectedDetection),
                        `Detected: ${result.data.botDetected}, Bot: ${result.data.botInfo.name || 'None'}`
                    );
                } else {
                    this.addResult(
                        `Bot Detection (${botTest.expectedBot || 'Human'})`,
                        false,
                        result.message || 'Detection failed'
                    );
                }
            } catch (error) {
                this.addResult(
                    `Bot Detection (${botTest.expectedBot || 'Human'})`,
                    false,
                    `Error: ${error.message}`
                );
            }
        }
    }

    async testAnalytics() {
        console.log('📊 Testing Analytics...');

        if (this.testSites.length === 0) {
            this.addResult('Analytics', false, 'No test sites available');
            return;
        }

        const testSite = this.testSites[0];

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/wordpress/sites/${testSite.id}/analytics?days=30`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                }
            );

            const result = await response.json();

            if (response.ok && result.success) {
                this.addResult(
                    'Analytics Retrieval',
                    true,
                    `Retrieved analytics: ${JSON.stringify(result.data.summary)}`
                );
            } else {
                this.addResult(
                    'Analytics Retrieval',
                    false,
                    result.message || 'Analytics retrieval failed'
                );
            }
        } catch (error) {
            this.addResult(
                'Analytics Retrieval',
                false,
                `Error: ${error.message}`
            );
        }
    }

    async testSiteManagement() {
        console.log('⚙️ Testing Site Management...');

        if (this.testSites.length === 0) {
            this.addResult('Site Management', false, 'No test sites available');
            return;
        }

        const testSite = this.testSites[0];

        // Test site update
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/wordpress/sites/${testSite.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    siteName: 'Updated Test Site',
                    monetizationEnabled: true,
                    pricingPerRequest: '0.002'
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.addResult(
                    'Site Update',
                    true,
                    'Site settings updated successfully'
                );
            } else {
                this.addResult(
                    'Site Update',
                    false,
                    result.message || 'Site update failed'
                );
            }
        } catch (error) {
            this.addResult(
                'Site Update',
                false,
                `Error: ${error.message}`
            );
        }
    }

    async cleanup() {
        console.log('🧹 Cleaning up test data...');

        for (const site of this.testSites) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/wordpress/sites/${site.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });

                if (response.ok) {
                    this.addResult(
                        `Cleanup (${site.siteName})`,
                        true,
                        'Site deleted successfully'
                    );
                } else {
                    this.addResult(
                        `Cleanup (${site.siteName})`,
                        false,
                        'Failed to delete site'
                    );
                }
            } catch (error) {
                this.addResult(
                    `Cleanup (${site.siteName})`,
                    false,
                    `Error: ${error.message}`
                );
            }
        }
    }

    addResult(testName, success, message) {
        this.testResults.push({ testName, success, message });
        const status = success ? '✅' : '❌';
        console.log(`  ${status} ${testName}: ${message}`);
    }

    printResults() {
        console.log('\n📋 Test Results Summary:');
        console.log('=' .repeat(50));

        const passed = this.testResults.filter(r => r.success).length;
        const total = this.testResults.length;

        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${total - passed}`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

        if (passed === total) {
            console.log('\n🎉 All tests passed! WordPress integration is working correctly.');
        } else {
            console.log('\n⚠️  Some tests failed. Please check the implementation.');
            
            console.log('\nFailed Tests:');
            this.testResults
                .filter(r => !r.success)
                .forEach(r => console.log(`  ❌ ${r.testName}: ${r.message}`));
        }
    }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new WordPressIntegrationTester();
    tester.runAllTests().catch(console.error);
}

export default WordPressIntegrationTester;
