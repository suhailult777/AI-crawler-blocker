import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../database/mongodb.js';
import { wordpressSites, botRequests, siteAnalytics } from '../database/schema.js';
import crypto from 'crypto';

export class WordPressSite {
    /**
     * Create a new WordPress site
     */
    static async create(siteData) {
        const apiKey = this.generateApiKey();
        
        const [site] = await db.insert(wordpressSites).values({
            userId: siteData.userId,
            siteUrl: this.normalizeUrl(siteData.siteUrl),
            siteName: siteData.siteName || this.extractSiteName(siteData.siteUrl),
            siteType: siteData.siteType || 'manual',
            adminEmail: siteData.adminEmail,
            apiKey: apiKey,
            pluginVersion: siteData.pluginVersion,
            wordpressVersion: siteData.wordpressVersion,
            monetizationEnabled: siteData.monetizationEnabled || false,
            pricingPerRequest: siteData.pricingPerRequest || '0.001',
            allowedBots: siteData.allowedBots || [],
            stripeAccountId: siteData.stripeAccountId,
            cloudflareZoneId: siteData.cloudflareZoneId,
        }).returning();

        return site;
    }

    /**
     * Find site by ID
     */
    static async findById(id) {
        const [site] = await db.select().from(wordpressSites).where(eq(wordpressSites.id, id));
        return site;
    }

    /**
     * Find site by API key
     */
    static async findByApiKey(apiKey) {
        const [site] = await db.select().from(wordpressSites).where(eq(wordpressSites.apiKey, apiKey));
        return site;
    }

    /**
     * Find site by URL
     */
    static async findByUrl(siteUrl) {
        const normalizedUrl = this.normalizeUrl(siteUrl);
        const [site] = await db.select().from(wordpressSites).where(eq(wordpressSites.siteUrl, normalizedUrl));
        return site;
    }

    /**
     * Find all sites for a user
     */
    static async findByUserId(userId) {
        return await db.select().from(wordpressSites)
            .where(eq(wordpressSites.userId, userId))
            .orderBy(desc(wordpressSites.createdAt));
    }

    /**
     * Update site
     */
    static async update(id, updateData) {
        const [updatedSite] = await db.update(wordpressSites)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(wordpressSites.id, id))
            .returning();

        return updatedSite;
    }

    /**
     * Delete site
     */
    static async delete(id) {
        await db.delete(wordpressSites).where(eq(wordpressSites.id, id));
        return true;
    }

    /**
     * Update last ping timestamp
     */
    static async updateLastPing(id) {
        await db.update(wordpressSites)
            .set({ lastPingAt: new Date() })
            .where(eq(wordpressSites.id, id));
    }

    /**
     * Get site analytics summary
     */
    static async getAnalyticsSummary(siteId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const analytics = await db.select({
            totalRequests: sql`COALESCE(SUM(${siteAnalytics.totalRequests}), 0)`,
            botRequests: sql`COALESCE(SUM(${siteAnalytics.botRequests}), 0)`,
            monetizedRequests: sql`COALESCE(SUM(${siteAnalytics.monetizedRequests}), 0)`,
            totalRevenue: sql`COALESCE(SUM(${siteAnalytics.totalRevenue}), 0)`,
            uniqueBots: sql`COALESCE(MAX(${siteAnalytics.uniqueBots}), 0)`,
        })
        .from(siteAnalytics)
        .where(and(
            eq(siteAnalytics.siteId, siteId),
            sql`${siteAnalytics.date} >= ${startDate}`
        ));

        return analytics[0] || {
            totalRequests: 0,
            botRequests: 0,
            monetizedRequests: 0,
            totalRevenue: 0,
            uniqueBots: 0,
        };
    }

    /**
     * Get recent bot requests for a site
     */
    static async getRecentBotRequests(siteId, limit = 50) {
        return await db.select()
            .from(botRequests)
            .where(eq(botRequests.siteId, siteId))
            .orderBy(desc(botRequests.createdAt))
            .limit(limit);
    }

    /**
     * Validate API key format
     */
    static validateApiKey(apiKey) {
        return /^cg_[a-zA-Z0-9]{32}$/.test(apiKey);
    }

    /**
     * Generate a new API key
     */
    static generateApiKey() {
        const randomBytes = crypto.randomBytes(16).toString('hex');
        return `cg_${randomBytes}`;
    }

    /**
     * Normalize URL for consistent storage
     */
    static normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // Remove trailing slash and convert to lowercase
            return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`.replace(/\/$/, '').toLowerCase();
        } catch (error) {
            // If URL parsing fails, return as-is but cleaned
            return url.replace(/\/$/, '').toLowerCase();
        }
    }

    /**
     * Extract site name from URL
     */
    static extractSiteName(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (error) {
            return url;
        }
    }

    /**
     * Check if site is active and healthy
     */
    static async isHealthy(siteId) {
        const site = await this.findById(siteId);
        if (!site || site.status !== 'active') {
            return false;
        }

        // Check if site has pinged recently (within last 24 hours)
        if (site.lastPingAt) {
            const dayAgo = new Date();
            dayAgo.setHours(dayAgo.getHours() - 24);
            return site.lastPingAt > dayAgo;
        }

        return true;
    }

    /**
     * Get sites that need health check
     */
    static async getSitesNeedingHealthCheck() {
        const dayAgo = new Date();
        dayAgo.setHours(dayAgo.getHours() - 24);

        return await db.select()
            .from(wordpressSites)
            .where(and(
                eq(wordpressSites.status, 'active'),
                sql`${wordpressSites.lastPingAt} < ${dayAgo} OR ${wordpressSites.lastPingAt} IS NULL`
            ));
    }

    /**
     * Get site configuration for API responses
     */
    static async getPublicConfig(siteId) {
        const site = await this.findById(siteId);
        if (!site) return null;

        return {
            siteId: site.id,
            siteUrl: site.siteUrl,
            siteName: site.siteName,
            monetizationEnabled: site.monetizationEnabled,
            pricingPerRequest: site.pricingPerRequest,
            allowedBots: site.allowedBots,
            status: site.status,
        };
    }
}

export default WordPressSite;
