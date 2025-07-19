import fetch from 'node-fetch';

class CloudflareService {
    constructor() {
        this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        this.apiToken = process.env.CLOUDFLARE_API_TOKEN;
        this.zoneId = process.env.CLOUDFLARE_ZONE_ID;
        this.baseUrl = 'https://api.cloudflare.com/client/v4';
    }

    /**
     * Create headers for Cloudflare API requests
     */
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Deploy a Cloudflare Worker for bot protection
     */
    async deployBotProtectionWorker(siteConfig) {
        const workerScript = this.generateWorkerScript(siteConfig);
        
        try {
            const response = await fetch(
                `${this.baseUrl}/accounts/${this.accountId}/workers/scripts/${siteConfig.workerName}`,
                {
                    method: 'PUT',
                    headers: {
                        ...this.getHeaders(),
                        'Content-Type': 'application/javascript',
                    },
                    body: workerScript
                }
            );

            const result = await response.json();
            
            if (result.success) {
                // Deploy the worker to the route
                await this.createWorkerRoute(siteConfig);
                return { success: true, data: result.result };
            } else {
                throw new Error(`Failed to deploy worker: ${result.errors?.[0]?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deploying Cloudflare Worker:', error);
            throw error;
        }
    }

    /**
     * Create a route for the worker
     */
    async createWorkerRoute(siteConfig) {
        const routePattern = `${siteConfig.siteUrl}/*`;
        
        try {
            const response = await fetch(
                `${this.baseUrl}/zones/${this.zoneId}/workers/routes`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify({
                        pattern: routePattern,
                        script: siteConfig.workerName
                    })
                }
            );

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(`Failed to create worker route: ${result.errors?.[0]?.message || 'Unknown error'}`);
            }

            return result.result;
        } catch (error) {
            console.error('Error creating worker route:', error);
            throw error;
        }
    }

    /**
     * Generate the Cloudflare Worker script for bot protection
     */
    generateWorkerScript(siteConfig) {
        return `
// AI Crawler Guard - Bot Protection Worker
// Generated for: ${siteConfig.siteName || siteConfig.siteUrl}

const AI_BOT_SIGNATURES = {
    'gptbot': { company: 'OpenAI', rate: 0.002, confidence: 95 },
    'chatgpt-user': { company: 'OpenAI', rate: 0.002, confidence: 95 },
    'anthropic-ai': { company: 'Anthropic', rate: 0.0015, confidence: 95 },
    'claude-web': { company: 'Anthropic', rate: 0.0015, confidence: 95 },
    'claudebot': { company: 'Anthropic', rate: 0.0015, confidence: 95 },
    'bard': { company: 'Google', rate: 0.001, confidence: 90 },
    'palm': { company: 'Google', rate: 0.001, confidence: 90 },
    'google-extended': { company: 'Google', rate: 0.001, confidence: 90 },
    'gemini': { company: 'Google', rate: 0.001, confidence: 90 },
    'ccbot': { company: 'Common Crawl', rate: 0.001, confidence: 90 },
    'cohere-ai': { company: 'Cohere', rate: 0.0012, confidence: 85 },
    'ai2bot': { company: 'Allen Institute', rate: 0.001, confidence: 80 },
    'facebookexternalhit': { company: 'Meta', rate: 0.001, confidence: 85 },
    'meta-externalagent': { company: 'Meta', rate: 0.001, confidence: 85 },
    'bytespider': { company: 'ByteDance', rate: 0.001, confidence: 85 },
    'perplexitybot': { company: 'Perplexity', rate: 0.0015, confidence: 90 },
    'youbot': { company: 'You.com', rate: 0.001, confidence: 85 },
    'phindbot': { company: 'Phind', rate: 0.001, confidence: 80 }
};

const SITE_CONFIG = {
    apiKey: '${siteConfig.apiKey}',
    siteId: '${siteConfig.siteId}',
    monetizationEnabled: ${siteConfig.monetizationEnabled || false},
    pricingPerRequest: ${siteConfig.pricingPerRequest || 0.001},
    allowedBots: ${JSON.stringify(siteConfig.allowedBots || [])},
    apiEndpoint: '${process.env.API_BASE_URL || 'https://api.aicrawlerguard.com'}/api/v1/wordpress/api'
};

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const userAgent = request.headers.get('User-Agent') || '';
    const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
    const url = new URL(request.url);
    
    // Detect if this is a bot request
    const botInfo = detectBot(userAgent, clientIP);
    
    // Log the request to our API
    const logData = {
        siteId: SITE_CONFIG.siteId,
        ipAddress: clientIP,
        userAgent: userAgent,
        botDetected: botInfo.isBot,
        botType: botInfo.botType,
        botName: botInfo.botName,
        confidenceScore: botInfo.confidence,
        pageUrl: request.url,
        contentType: getContentType(url.pathname),
        actionTaken: 'logged'
    };

    // Send log to API (non-blocking)
    event.waitUntil(logToAPI(logData));

    // Handle bot requests
    if (botInfo.isBot && SITE_CONFIG.monetizationEnabled) {
        const isAllowed = SITE_CONFIG.allowedBots.some(allowedBot => 
            botInfo.botName?.toLowerCase().includes(allowedBot.toLowerCase())
        );

        if (!isAllowed && botInfo.isAiBot && botInfo.confidence >= 70) {
            // For AI bots, implement monetization
            return handleMonetization(request, botInfo);
        }
    }

    // Continue to origin for allowed requests
    return fetch(request);
}

function detectBot(userAgent, ipAddress) {
    const botInfo = {
        isBot: false,
        botType: null,
        botName: null,
        confidence: 0,
        isAiBot: false,
        company: null
    };

    if (!userAgent) {
        return botInfo;
    }

    const lowerUserAgent = userAgent.toLowerCase();

    // Check against known AI bots
    for (const [signature, data] of Object.entries(AI_BOT_SIGNATURES)) {
        if (lowerUserAgent.includes(signature)) {
            botInfo.isBot = true;
            botInfo.isAiBot = true;
            botInfo.botType = 'ai_bot';
            botInfo.botName = data.company;
            botInfo.confidence = data.confidence;
            botInfo.company = data.company;
            return botInfo;
        }
    }

    // Check suspicious patterns
    const suspiciousPatterns = [
        /python-requests/i,
        /scrapy/i,
        /selenium/i,
        /headless/i,
        /crawler/i,
        /scraper/i,
        /bot.*ai/i,
        /ai.*bot/i,
        /gpt/i,
        /llm/i,
        /language.*model/i,
        /openai/i,
        /anthropic/i
    ];

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(userAgent)) {
            botInfo.isBot = true;
            botInfo.isAiBot = true;
            botInfo.botType = 'ai_bot';
            botInfo.botName = 'Unknown AI Bot';
            botInfo.confidence = 70;
            break;
        }
    }

    return botInfo;
}

async function handleMonetization(request, botInfo) {
    // Create a payment page or redirect to payment
    const paymentUrl = \`\${SITE_CONFIG.apiEndpoint}/payment?site=\${SITE_CONFIG.siteId}&bot=\${encodeURIComponent(botInfo.botName)}&amount=\${SITE_CONFIG.pricingPerRequest}\`;
    
    const html = \`
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Crawler Access - Payment Required</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .container { text-align: center; background: #f5f5f5; padding: 30px; border-radius: 10px; }
            .price { font-size: 24px; color: #2563eb; font-weight: bold; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 AI Crawler Access</h1>
            <p>Hello <strong>\${botInfo.botName}</strong>!</p>
            <p>This content is protected by AI Crawler Guard. To access this content, please complete the payment below:</p>
            <div class="price">$\${SITE_CONFIG.pricingPerRequest}</div>
            <p>per request</p>
            <a href="\${paymentUrl}" class="button">Pay & Access Content</a>
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                This site uses AI Crawler Guard to monetize AI bot access.<br>
                For questions, contact the site administrator.
            </p>
        </div>
    </body>
    </html>
    \`;

    return new Response(html, {
        status: 402, // Payment Required
        headers: {
            'Content-Type': 'text/html',
            'X-AI-Crawler-Guard': 'payment-required',
            'X-Bot-Detected': botInfo.botName,
            'X-Confidence': botInfo.confidence.toString()
        }
    });
}

async function logToAPI(logData) {
    try {
        await fetch(\`\${SITE_CONFIG.apiEndpoint}/log-request\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': SITE_CONFIG.apiKey
            },
            body: JSON.stringify(logData)
        });
    } catch (error) {
        console.error('Failed to log to API:', error);
    }
}

function getContentType(pathname) {
    if (pathname.includes('/wp-admin/') || pathname.includes('/admin/')) return 'admin';
    if (pathname.includes('/api/')) return 'api';
    if (pathname.includes('/feed/') || pathname.endsWith('.xml')) return 'feed';
    if (pathname.includes('/wp-content/')) return 'asset';
    if (pathname.match(/\\.(jpg|jpeg|png|gif|svg|webp)$/i)) return 'image';
    if (pathname.match(/\\.(css|js)$/i)) return 'asset';
    return 'page';
}
`;
    }

    /**
     * Update worker configuration
     */
    async updateWorkerConfig(workerName, newConfig) {
        try {
            const workerScript = this.generateWorkerScript(newConfig);
            
            const response = await fetch(
                `${this.baseUrl}/accounts/${this.accountId}/workers/scripts/${workerName}`,
                {
                    method: 'PUT',
                    headers: {
                        ...this.getHeaders(),
                        'Content-Type': 'application/javascript',
                    },
                    body: workerScript
                }
            );

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(`Failed to update worker: ${result.errors?.[0]?.message || 'Unknown error'}`);
            }

            return result.result;
        } catch (error) {
            console.error('Error updating Cloudflare Worker:', error);
            throw error;
        }
    }

    /**
     * Delete a worker and its routes
     */
    async deleteWorker(workerName) {
        try {
            // First, delete all routes for this worker
            await this.deleteWorkerRoutes(workerName);
            
            // Then delete the worker itself
            const response = await fetch(
                `${this.baseUrl}/accounts/${this.accountId}/workers/scripts/${workerName}`,
                {
                    method: 'DELETE',
                    headers: this.getHeaders()
                }
            );

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(`Failed to delete worker: ${result.errors?.[0]?.message || 'Unknown error'}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting Cloudflare Worker:', error);
            throw error;
        }
    }

    /**
     * Delete worker routes
     */
    async deleteWorkerRoutes(workerName) {
        try {
            // Get all routes for the zone
            const response = await fetch(
                `${this.baseUrl}/zones/${this.zoneId}/workers/routes`,
                {
                    method: 'GET',
                    headers: this.getHeaders()
                }
            );

            const result = await response.json();
            
            if (result.success) {
                // Filter routes for this worker and delete them
                const routesToDelete = result.result.filter(route => route.script === workerName);
                
                for (const route of routesToDelete) {
                    await fetch(
                        `${this.baseUrl}/zones/${this.zoneId}/workers/routes/${route.id}`,
                        {
                            method: 'DELETE',
                            headers: this.getHeaders()
                        }
                    );
                }
            }
        } catch (error) {
            console.error('Error deleting worker routes:', error);
            // Don't throw here as this is cleanup
        }
    }

    /**
     * Get worker analytics
     */
    async getWorkerAnalytics(workerName, since = '2024-01-01T00:00:00Z') {
        try {
            const response = await fetch(
                `${this.baseUrl}/accounts/${this.accountId}/workers/scripts/${workerName}/analytics?since=${since}`,
                {
                    method: 'GET',
                    headers: this.getHeaders()
                }
            );

            const result = await response.json();
            
            if (result.success) {
                return result.result;
            } else {
                throw new Error(`Failed to get analytics: ${result.errors?.[0]?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error getting worker analytics:', error);
            throw error;
        }
    }
}

export default CloudflareService;
