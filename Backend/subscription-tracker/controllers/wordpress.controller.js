import WordPressSite from '../models/wordpress-site.model.js';
import BotRequest from '../models/bot-request.model.js';
import SiteAnalytics from '../models/site-analytics.model.js';
import Subscription from '../models/subscription.model.js';

/**
 * Register a new WordPress site or manual URL
 */
export const registerSite = async (req, res, next) => {
    try {
        const { siteUrl, siteName, siteType, adminEmail, pluginVersion, wordpressVersion } = req.body;

        // Validate required fields
        if (!siteUrl) {
            return res.status(400).json({
                success: false,
                message: 'Site URL is required'
            });
        }

        // Check if site already exists
        const existingSite = await WordPressSite.findByUrl(siteUrl);
        if (existingSite) {
            return res.status(409).json({
                success: false,
                message: 'Site is already registered',
                data: { siteId: existingSite.id }
            });
        }

        // Check user's subscription limits
        const userSubscription = await Subscription.findActiveByUserId(req.user.id);
        const userSites = await WordPressSite.findByUserId(req.user.id);

        const planConfig = Subscription.getPlanConfig(userSubscription?.planName || 'free');
        const siteLimit = planConfig.limits?.maxSites || 1;

        if (userSites.length >= siteLimit) {
            return res.status(403).json({
                success: false,
                message: `Site limit reached. Your ${planConfig.name} plan allows ${siteLimit} site(s). Please upgrade to add more sites.`,
                data: { currentSites: userSites.length, limit: siteLimit }
            });
        }

        // Create the site
        const site = await WordPressSite.create({
            userId: req.user.id,
            siteUrl,
            siteName,
            siteType: siteType || 'manual',
            adminEmail,
            pluginVersion,
            wordpressVersion,
            monetizationEnabled: userSubscription?.planName !== 'free',
        });

        res.status(201).json({
            success: true,
            data: {
                site: {
                    id: site.id,
                    siteUrl: site.siteUrl,
                    siteName: site.siteName,
                    siteType: site.siteType,
                    apiKey: site.apiKey,
                    status: site.status,
                    monetizationEnabled: site.monetizationEnabled,
                }
            },
            message: 'Site registered successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all sites for the authenticated user
 */
export const getUserSites = async (req, res, next) => {
    try {
        const sites = await WordPressSite.findByUserId(req.user.id);

        // For now, return sites without analytics to avoid the query error
        // TODO: Fix analytics query and re-enable analytics data
        const sitesWithBasicData = sites.map(site => ({
            ...site,
            analytics: {
                totalRequests: 0,
                botRequests: 0,
                monetizedRequests: 0,
                totalRevenue: 0,
                uniqueBots: 0,
            }
        }));

        res.json({
            success: true,
            data: { sites: sitesWithBasicData },
            message: 'Sites retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getUserSites:', error);
        next(error);
    }
};

/**
 * Get site details by ID
 */
export const getSiteDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const site = await WordPressSite.findById(id);
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }

        // Check if user owns this site
        if (site.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get detailed analytics
        const analytics = await SiteAnalytics.getSummary(id, 30);
        const trendingAnalytics = await SiteAnalytics.getTrendingAnalytics(id, 30);
        const recentRequests = await WordPressSite.getRecentBotRequests(id, 20);

        res.json({
            success: true,
            data: {
                site,
                analytics,
                trending: trendingAnalytics,
                recentRequests
            },
            message: 'Site details retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update site settings
 */
export const updateSiteSettings = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { siteName, monetizationEnabled, pricingPerRequest, allowedBots } = req.body;

        const site = await WordPressSite.findById(id);
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }

        // Check if user owns this site
        if (site.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if user can enable monetization
        const userSubscription = await Subscription.findActiveByUserId(req.user.id);
        if (monetizationEnabled && userSubscription?.planName === 'free') {
            return res.status(403).json({
                success: false,
                message: 'Monetization requires a Pro or Enterprise subscription'
            });
        }

        const updateData = {};
        if (siteName !== undefined) updateData.siteName = siteName;
        if (monetizationEnabled !== undefined) updateData.monetizationEnabled = monetizationEnabled;
        if (pricingPerRequest !== undefined) updateData.pricingPerRequest = pricingPerRequest;
        if (allowedBots !== undefined) updateData.allowedBots = allowedBots;

        const updatedSite = await WordPressSite.update(id, updateData);

        res.json({
            success: true,
            data: { site: updatedSite },
            message: 'Site settings updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a site
 */
export const deleteSite = async (req, res, next) => {
    try {
        const { id } = req.params;

        const site = await WordPressSite.findById(id);
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }

        // Check if user owns this site
        if (site.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await WordPressSite.delete(id);

        res.json({
            success: true,
            message: 'Site deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Log a bot request (called by WordPress plugin)
 */
export const logBotRequest = async (req, res, next) => {
    try {
        const { apiKey } = req.headers;
        const requestData = req.body;

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

        // Log the bot request
        const botRequest = await BotRequest.create({
            siteId: site.id,
            ...requestData
        });

        // Determine action based on site settings and subscription
        let action = 'logged';
        let shouldBlock = false;
        let shouldMonetize = false;

        if (requestData.botDetected && site.monetizationEnabled) {
            // Check if bot is in allowed list
            const isAllowed = site.allowedBots.includes(requestData.botName?.toLowerCase());

            if (!isAllowed) {
                shouldMonetize = true;
                action = 'monetized';
            }
        }

        res.json({
            success: true,
            data: {
                requestId: botRequest.id,
                action,
                shouldBlock,
                shouldMonetize,
                pricingPerRequest: site.pricingPerRequest,
            },
            message: 'Bot request logged successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get site analytics
 */
export const getSiteAnalytics = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { days = 30 } = req.query;

        const site = await WordPressSite.findById(id);
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }

        // Check if user owns this site
        if (site.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const analytics = await SiteAnalytics.getSummary(id, parseInt(days));
        const chartData = await SiteAnalytics.getChartData(id, parseInt(days));
        const topBots = await BotRequest.getTopBotTypes(id, parseInt(days));

        res.json({
            success: true,
            data: {
                summary: analytics,
                chartData,
                topBots
            },
            message: 'Analytics retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Regenerate API key for a site
 */
export const regenerateApiKey = async (req, res, next) => {
    try {
        const { id } = req.params;

        const site = await WordPressSite.findById(id);
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }

        // Check if user owns this site
        if (site.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const newApiKey = WordPressSite.generateApiKey();
        const updatedSite = await WordPressSite.update(id, { apiKey: newApiKey });

        res.json({
            success: true,
            data: {
                apiKey: updatedSite.apiKey,
                siteId: updatedSite.id
            },
            message: 'API key regenerated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Validate API key (for WordPress plugin)
 */
export const validateApiKey = async (req, res, next) => {
    try {
        const { apiKey } = req.body;

        if (!apiKey || !WordPressSite.validateApiKey(apiKey)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid API key format'
            });
        }

        const site = await WordPressSite.findByApiKey(apiKey);
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        const config = await WordPressSite.getPublicConfig(site.id);

        res.json({
            success: true,
            data: {
                valid: true,
                site: config
            },
            message: 'API key is valid'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get dashboard overview for all user sites
 */
export const getDashboardOverview = async (req, res, next) => {
    try {
        const userSites = await WordPressSite.findByUserId(req.user.id);
        const userAnalytics = await SiteAnalytics.getUserAnalytics(req.user.id, 30);

        // Calculate totals
        const totals = userAnalytics.reduce((acc, site) => ({
            totalSites: acc.totalSites + 1,
            totalRequests: acc.totalRequests + parseInt(site.totalRequests),
            totalBotRequests: acc.totalBotRequests + parseInt(site.botRequests),
            totalRevenue: acc.totalRevenue + parseFloat(site.totalRevenue),
            totalMonetizedRequests: acc.totalMonetizedRequests + parseInt(site.monetizedRequests),
        }), {
            totalSites: 0,
            totalRequests: 0,
            totalBotRequests: 0,
            totalRevenue: 0,
            totalMonetizedRequests: 0,
        });

        res.json({
            success: true,
            data: {
                overview: totals,
                sites: userAnalytics,
                siteCount: userSites.length
            },
            message: 'Dashboard overview retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};
