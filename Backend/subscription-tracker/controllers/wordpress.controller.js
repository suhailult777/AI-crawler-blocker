import WordPressSite from '../models/wordpress-site.model.js';
import BotRequest from '../models/bot-request.model.js';
import SiteAnalytics from '../models/site-analytics.model.js';
import Subscription from '../models/subscription.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

/**
 * Download WordPress plugin zip file
 */
export const downloadPlugin = async (req, res, next) => {
    try {
        // Path to the plugin zip file (go up from Backend/subscription-tracker/controllers to root)
        const pluginPath = path.resolve(__dirname, '../../../wp-admin/crawlguard-wp.zip');

        console.log('Plugin path:', pluginPath);

        // Check if file exists
        const fs = await import('fs');
        if (!fs.existsSync(pluginPath)) {
            return res.status(404).json({
                success: false,
                message: 'Plugin file not found at: ' + pluginPath
            });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="crawlguard-wp.zip"');

        // Send the file
        res.sendFile(pluginPath, (err) => {
            if (err) {
                console.error('Error sending plugin file:', err);
                res.status(500).json({
                    success: false,
                    message: 'Error downloading plugin file'
                });
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Push configuration to WordPress plugin
 */
export const pushConfigurationToPlugin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { settings } = req.body;

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

        // Prepare configuration payload
        const configPayload = {
            apiKey: site.apiKey,
            settings: {
                monetizationEnabled: settings.monetizationEnabled ?? false,
                pricingPerRequest: settings.pricingPerRequest ?? 0.001,
                allowedBots: settings.allowedBots ?? [],
                botProtectionEnabled: settings.botProtectionEnabled ?? true,
                customRules: settings.customRules ?? []
            }
        };

        // Send configuration to WordPress plugin via REST API
        const pluginUrl = site.siteUrl.replace(/\/$/, '') + '/wp-json/crawlguard/v1/configure';

        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(pluginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'AI-Crawler-Guard-Backend/1.0'
                },
                body: JSON.stringify(configPayload),
                timeout: 10000 // 10 second timeout
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Update local site settings
                const updateData = {
                    monetizationEnabled: settings.monetizationEnabled,
                    pricingPerRequest: settings.pricingPerRequest,
                    allowedBots: settings.allowedBots,
                    lastConfigPush: new Date().toISOString(),
                    pluginStatus: 'configured'
                };

                await WordPressSite.update(id, updateData);

                res.json({
                    success: true,
                    data: {
                        site: await WordPressSite.findById(id),
                        pluginResponse: result
                    },
                    message: 'Configuration pushed to WordPress plugin successfully'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Failed to configure WordPress plugin: ' + (result.message || 'Unknown error'),
                    data: { pluginResponse: result }
                });
            }
        } catch (fetchError) {
            console.error('Error pushing config to WordPress plugin:', fetchError);
            res.status(500).json({
                success: false,
                message: 'Could not reach WordPress plugin. Please ensure the plugin is installed and activated.',
                data: { error: fetchError.message }
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Get WordPress plugin status
 */
export const getPluginStatus = async (req, res, next) => {
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

        // Check plugin status via REST API
        const pluginUrl = site.siteUrl.replace(/\/$/, '') + '/wp-json/crawlguard/v1/status';

        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(pluginUrl, {
                method: 'GET',
                headers: {
                    'X-API-Key': site.apiKey,
                    'User-Agent': 'AI-Crawler-Guard-Backend/1.0'
                },
                timeout: 5000 // 5 second timeout
            });

            const result = await response.json();

            if (response.ok && result.success) {
                res.json({
                    success: true,
                    data: {
                        site: site,
                        pluginStatus: result.data,
                        isOnline: true
                    },
                    message: 'Plugin status retrieved successfully'
                });
            } else {
                res.json({
                    success: true,
                    data: {
                        site: site,
                        pluginStatus: null,
                        isOnline: false,
                        error: result.message || 'Plugin not responding'
                    },
                    message: 'Plugin is not responding or not configured'
                });
            }
        } catch (fetchError) {
            res.json({
                success: true,
                data: {
                    site: site,
                    pluginStatus: null,
                    isOnline: false,
                    error: fetchError.message
                },
                message: 'Could not reach WordPress plugin'
            });
        }
    } catch (error) {
        next(error);
    }
};
