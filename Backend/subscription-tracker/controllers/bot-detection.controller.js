import BotRequest from '../models/bot-request.model.js';
import WordPressSite from '../models/wordpress-site.model.js';

// Known AI bots with their detection patterns and monetization rates
const AI_BOT_SIGNATURES = {
    // OpenAI bots
    'gptbot': { company: 'OpenAI', rate: 0.002, confidence: 95 },
    'chatgpt-user': { company: 'OpenAI', rate: 0.002, confidence: 95 },
    
    // Anthropic bots
    'anthropic-ai': { company: 'Anthropic', rate: 0.0015, confidence: 95 },
    'claude-web': { company: 'Anthropic', rate: 0.0015, confidence: 95 },
    'claudebot': { company: 'Anthropic', rate: 0.0015, confidence: 95 },
    
    // Google bots
    'bard': { company: 'Google', rate: 0.001, confidence: 90 },
    'palm': { company: 'Google', rate: 0.001, confidence: 90 },
    'google-extended': { company: 'Google', rate: 0.001, confidence: 90 },
    'gemini': { company: 'Google', rate: 0.001, confidence: 90 },
    
    // Common Crawl
    'ccbot': { company: 'Common Crawl', rate: 0.001, confidence: 90 },
    
    // Other major AI companies
    'cohere-ai': { company: 'Cohere', rate: 0.0012, confidence: 85 },
    'ai2bot': { company: 'Allen Institute', rate: 0.001, confidence: 80 },
    'facebookexternalhit': { company: 'Meta', rate: 0.001, confidence: 85 },
    'meta-externalagent': { company: 'Meta', rate: 0.001, confidence: 85 },
    'bytespider': { company: 'ByteDance', rate: 0.001, confidence: 85 },
    'perplexitybot': { company: 'Perplexity', rate: 0.0015, confidence: 90 },
    'youbot': { company: 'You.com', rate: 0.001, confidence: 85 },
    'phindbot': { company: 'Phind', rate: 0.001, confidence: 80 },
    
    // Search engines with AI features
    'bingbot': { company: 'Microsoft', rate: 0.0012, confidence: 85 },
    'slurp': { company: 'Yahoo', rate: 0.001, confidence: 80 },
    'duckduckbot': { company: 'DuckDuckGo', rate: 0.001, confidence: 75 },
    'applebot': { company: 'Apple', rate: 0.001, confidence: 80 },
    'amazonbot': { company: 'Amazon', rate: 0.001, confidence: 80 }
};

// Suspicious patterns that might indicate AI bots
const SUSPICIOUS_PATTERNS = [
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

/**
 * Detect if a request is from an AI bot
 */
export const detectBot = async (req, res, next) => {
    try {
        const { userAgent, ipAddress, pageUrl, siteUrl } = req.body;
        const { apiKey } = req.headers;

        // Validate API key
        if (!apiKey || !WordPressSite.validateApiKey(apiKey)) {
            return res.status(401).json({
                success: false,
                message: 'Invalid API key'
            });
        }

        // Find site by API key
        const site = await WordPressSite.findByApiKey(apiKey);
        if (!site || site.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Site not found or inactive'
            });
        }

        // Perform bot detection
        const botInfo = detectBotFromUserAgent(userAgent, ipAddress);
        
        // Determine action based on site settings
        const action = determineAction(botInfo, site);

        // Log the request
        const logData = {
            siteId: site.id,
            ipAddress,
            userAgent,
            botDetected: botInfo.isBot,
            botType: botInfo.botType,
            botName: botInfo.botName,
            confidenceScore: botInfo.confidence,
            pageUrl,
            contentType: getContentType(pageUrl),
            actionTaken: action.type,
            revenueAmount: action.revenue || '0.00',
            metadata: {
                detectionMethod: botInfo.detectionMethod,
                suggestedRate: botInfo.suggestedRate,
                ...action.metadata
            }
        };

        const botRequest = await BotRequest.create(logData);

        res.json({
            success: true,
            data: {
                requestId: botRequest.id,
                botDetected: botInfo.isBot,
                botInfo: {
                    name: botInfo.botName,
                    type: botInfo.botType,
                    confidence: botInfo.confidence,
                    company: botInfo.company
                },
                action: {
                    type: action.type,
                    shouldBlock: action.shouldBlock,
                    shouldMonetize: action.shouldMonetize,
                    revenue: action.revenue,
                    paymentUrl: action.paymentUrl,
                    message: action.message
                }
            },
            message: 'Bot detection completed'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get bot detection statistics for a site
 */
export const getBotStatistics = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const { days = 30 } = req.query;

        // Verify site ownership
        const site = await WordPressSite.findById(siteId);
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }

        if (site.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const statistics = await BotRequest.getStatistics(siteId, parseInt(days));
        const topBots = await BotRequest.getTopBotTypes(siteId, parseInt(days));
        const hourlyDistribution = await BotRequest.getHourlyDistribution(siteId, Math.min(parseInt(days), 7));

        res.json({
            success: true,
            data: {
                statistics,
                topBots,
                hourlyDistribution
            },
            message: 'Bot statistics retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get recent bot requests for a site
 */
export const getRecentBotRequests = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const { limit = 50, offset = 0, botDetected } = req.query;

        // Verify site ownership
        const site = await WordPressSite.findById(siteId);
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }

        if (site.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            botDetected: botDetected === 'true' ? true : botDetected === 'false' ? false : undefined
        };

        const requests = await BotRequest.findBySiteId(siteId, options);

        res.json({
            success: true,
            data: { requests },
            message: 'Bot requests retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to detect bot from user agent
function detectBotFromUserAgent(userAgent, ipAddress) {
    const botInfo = {
        isBot: false,
        botType: null,
        botName: null,
        confidence: 0,
        isAiBot: false,
        company: null,
        suggestedRate: 0.001,
        detectionMethod: 'none'
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
            botInfo.suggestedRate = data.rate;
            botInfo.detectionMethod = 'signature_match';
            return botInfo;
        }
    }

    // Check suspicious patterns
    for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(userAgent)) {
            botInfo.isBot = true;
            botInfo.isAiBot = true;
            botInfo.botType = 'ai_bot';
            botInfo.botName = 'Unknown AI Bot';
            botInfo.confidence = 70;
            botInfo.detectionMethod = 'pattern_match';
            break;
        }
    }

    // Apply heuristics if not already detected
    if (!botInfo.isBot) {
        const heuristicScore = applyHeuristics(userAgent, ipAddress);
        if (heuristicScore >= 40) {
            botInfo.isBot = true;
            botInfo.isAiBot = true;
            botInfo.botType = 'ai_bot';
            botInfo.botName = 'Potential AI Bot';
            botInfo.confidence = Math.min(heuristicScore, 85);
            botInfo.detectionMethod = 'heuristic';
        }
    }

    return botInfo;
}

// Helper function to apply heuristic detection
function applyHeuristics(userAgent, ipAddress) {
    let suspiciousScore = 0;

    // Check user agent length and structure
    if (userAgent.length < 20 || userAgent.length > 500) {
        suspiciousScore += 25;
    }

    // Check for common bot indicators
    const botKeywords = ['bot', 'crawler', 'spider', 'scraper', 'fetch', 'http', 'client', 'agent'];
    for (const keyword of botKeywords) {
        if (userAgent.toLowerCase().includes(keyword)) {
            suspiciousScore += 10;
        }
    }

    // Check for missing common browser characteristics
    if (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome') && !userAgent.includes('Safari')) {
        suspiciousScore += 20;
    }

    return suspiciousScore;
}

// Helper function to determine action based on bot detection and site settings
function determineAction(botInfo, site) {
    const action = {
        type: 'logged',
        shouldBlock: false,
        shouldMonetize: false,
        revenue: '0.00',
        metadata: {}
    };

    if (!botInfo.isBot) {
        return action;
    }

    // Check if monetization is enabled
    if (!site.monetizationEnabled) {
        action.type = 'allowed';
        return action;
    }

    // Check if bot is in allowed list
    const isAllowed = site.allowedBots.some(allowedBot => 
        botInfo.botName?.toLowerCase().includes(allowedBot.toLowerCase())
    );

    if (isAllowed) {
        action.type = 'allowed';
        return action;
    }

    // For AI bots, implement monetization
    if (botInfo.isAiBot && botInfo.confidence >= 70) {
        action.type = 'monetized';
        action.shouldMonetize = true;
        action.revenue = site.pricingPerRequest || botInfo.suggestedRate || '0.001';
        action.metadata.monetizationEnabled = true;
    }

    return action;
}

// Helper function to determine content type from URL
function getContentType(url) {
    if (!url) return 'unknown';
    
    if (url.includes('/wp-admin/') || url.includes('/admin/')) return 'admin';
    if (url.includes('/api/')) return 'api';
    if (url.includes('/feed/') || url.includes('.xml')) return 'feed';
    if (url.includes('/wp-content/')) return 'asset';
    if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) return 'image';
    if (url.match(/\.(css|js)$/i)) return 'asset';
    
    return 'page';
}
