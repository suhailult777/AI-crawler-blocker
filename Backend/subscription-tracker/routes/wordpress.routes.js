import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";

import {
    registerSite,
    getUserSites,
    getSiteDetails,
    updateSiteSettings,
    deleteSite,
    logBotRequest,
    getSiteAnalytics,
    regenerateApiKey,
    validateApiKey,
    getDashboardOverview,
    downloadPlugin,
    pushConfigurationToPlugin,
    getPluginStatus
} from "../controllers/wordpress.controller.js";

import {
    detectBot,
    getBotStatistics,
    getRecentBotRequests
} from "../controllers/bot-detection.controller.js";

const wordpressRouter = Router();

// Site management routes (require authentication)
wordpressRouter.post('/sites', authorize, registerSite);
wordpressRouter.get('/sites', authorize, getUserSites);
wordpressRouter.get('/sites/:id', authorize, getSiteDetails);
wordpressRouter.put('/sites/:id', authorize, updateSiteSettings);
wordpressRouter.delete('/sites/:id', authorize, deleteSite);
wordpressRouter.post('/sites/:id/regenerate-key', authorize, regenerateApiKey);

// Plugin configuration routes (require authentication)
wordpressRouter.post('/sites/:id/configure', authorize, pushConfigurationToPlugin);
wordpressRouter.get('/sites/:id/plugin-status', authorize, getPluginStatus);

// Analytics routes (require authentication)
wordpressRouter.get('/sites/:id/analytics', authorize, getSiteAnalytics);
wordpressRouter.get('/sites/:id/bot-statistics', authorize, getBotStatistics);
wordpressRouter.get('/sites/:id/bot-requests', authorize, getRecentBotRequests);
wordpressRouter.get('/dashboard/overview', authorize, getDashboardOverview);

// Public API routes (for WordPress plugin - use API key authentication)
wordpressRouter.post('/api/validate-key', validateApiKey);
wordpressRouter.post('/api/detect-bot', detectBot);
wordpressRouter.post('/api/log-request', logBotRequest);

// Plugin download (public route)
wordpressRouter.get('/plugin/download', downloadPlugin);

export default wordpressRouter;
