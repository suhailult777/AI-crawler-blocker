import { eq, and, desc, sql, gte, lte, count } from 'drizzle-orm';
import { db } from '../database/mongodb.js';
import { botRequests, wordpressSites, siteAnalytics } from '../database/schema.js';

export class BotRequest {
    /**
     * Log a new bot request
     */
    static async create(requestData) {
        const [request] = await db.insert(botRequests).values({
            siteId: requestData.siteId,
            ipAddress: requestData.ipAddress,
            userAgent: requestData.userAgent,
            botDetected: requestData.botDetected || false,
            botType: requestData.botType,
            botName: requestData.botName,
            confidenceScore: requestData.confidenceScore || 0,
            pageUrl: requestData.pageUrl,
            contentType: requestData.contentType,
            contentLength: requestData.contentLength || 0,
            actionTaken: requestData.actionTaken || 'logged',
            revenueAmount: requestData.revenueAmount || '0.00',
            paymentId: requestData.paymentId,
            metadata: requestData.metadata || {},
        }).returning();

        // Update site's last ping
        await db.update(wordpressSites)
            .set({ lastPingAt: new Date() })
            .where(eq(wordpressSites.id, requestData.siteId));

        return request;
    }

    /**
     * Find request by ID
     */
    static async findById(id) {
        const [request] = await db.select().from(botRequests).where(eq(botRequests.id, id));
        return request;
    }

    /**
     * Get requests for a site with pagination
     */
    static async findBySiteId(siteId, options = {}) {
        const { limit = 50, offset = 0, startDate, endDate, botDetected } = options;

        let query = db.select().from(botRequests).where(eq(botRequests.siteId, siteId));

        // Add date filters if provided
        if (startDate) {
            query = query.where(and(
                eq(botRequests.siteId, siteId),
                gte(botRequests.createdAt, startDate)
            ));
        }

        if (endDate) {
            query = query.where(and(
                eq(botRequests.siteId, siteId),
                lte(botRequests.createdAt, endDate)
            ));
        }

        // Filter by bot detection if specified
        if (typeof botDetected === 'boolean') {
            query = query.where(and(
                eq(botRequests.siteId, siteId),
                eq(botRequests.botDetected, botDetected)
            ));
        }

        return await query
            .orderBy(desc(botRequests.createdAt))
            .limit(limit)
            .offset(offset);
    }

    /**
     * Get bot request statistics for a site
     */
    static async getStatistics(siteId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const stats = await db.select({
            totalRequests: count(),
            botRequests: sql`COUNT(*) FILTER (WHERE ${botRequests.botDetected} = true)`,
            monetizedRequests: sql`COUNT(*) FILTER (WHERE ${botRequests.revenueAmount} > 0)`,
            totalRevenue: sql`COALESCE(SUM(${botRequests.revenueAmount}), 0)`,
            avgConfidence: sql`AVG(${botRequests.confidenceScore}) FILTER (WHERE ${botRequests.botDetected} = true)`,
        })
        .from(botRequests)
        .where(and(
            eq(botRequests.siteId, siteId),
            gte(botRequests.createdAt, startDate)
        ));

        return stats[0] || {
            totalRequests: 0,
            botRequests: 0,
            monetizedRequests: 0,
            totalRevenue: 0,
            avgConfidence: 0,
        };
    }

    /**
     * Get top bot types for a site
     */
    static async getTopBotTypes(siteId, days = 30, limit = 10) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await db.select({
            botName: botRequests.botName,
            botType: botRequests.botType,
            requestCount: count(),
            totalRevenue: sql`COALESCE(SUM(${botRequests.revenueAmount}), 0)`,
            avgConfidence: sql`AVG(${botRequests.confidenceScore})`,
        })
        .from(botRequests)
        .where(and(
            eq(botRequests.siteId, siteId),
            eq(botRequests.botDetected, true),
            gte(botRequests.createdAt, startDate)
        ))
        .groupBy(botRequests.botName, botRequests.botType)
        .orderBy(desc(count()))
        .limit(limit);
    }

    /**
     * Get hourly request distribution for charts
     */
    static async getHourlyDistribution(siteId, days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await db.select({
            hour: sql`DATE_TRUNC('hour', ${botRequests.createdAt})`,
            totalRequests: count(),
            botRequests: sql`COUNT(*) FILTER (WHERE ${botRequests.botDetected} = true)`,
            revenue: sql`COALESCE(SUM(${botRequests.revenueAmount}), 0)`,
        })
        .from(botRequests)
        .where(and(
            eq(botRequests.siteId, siteId),
            gte(botRequests.createdAt, startDate)
        ))
        .groupBy(sql`DATE_TRUNC('hour', ${botRequests.createdAt})`)
        .orderBy(sql`DATE_TRUNC('hour', ${botRequests.createdAt})`);
    }

    /**
     * Get daily analytics for a site
     */
    static async getDailyAnalytics(siteId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await db.select({
            date: sql`DATE(${botRequests.createdAt})`,
            totalRequests: count(),
            botRequests: sql`COUNT(*) FILTER (WHERE ${botRequests.botDetected} = true)`,
            monetizedRequests: sql`COUNT(*) FILTER (WHERE ${botRequests.revenueAmount} > 0)`,
            totalRevenue: sql`COALESCE(SUM(${botRequests.revenueAmount}), 0)`,
            uniqueBots: sql`COUNT(DISTINCT ${botRequests.botName}) FILTER (WHERE ${botRequests.botDetected} = true)`,
        })
        .from(botRequests)
        .where(and(
            eq(botRequests.siteId, siteId),
            gte(botRequests.createdAt, startDate)
        ))
        .groupBy(sql`DATE(${botRequests.createdAt})`)
        .orderBy(sql`DATE(${botRequests.createdAt})`);
    }

    /**
     * Update request with payment information
     */
    static async updatePayment(id, paymentData) {
        const [updatedRequest] = await db.update(botRequests)
            .set({
                paymentId: paymentData.paymentId,
                revenueAmount: paymentData.revenueAmount,
                actionTaken: 'monetized',
                metadata: paymentData.metadata || {},
            })
            .where(eq(botRequests.id, id))
            .returning();

        return updatedRequest;
    }

    /**
     * Get revenue summary for a site
     */
    static async getRevenueSummary(siteId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const summary = await db.select({
            totalRevenue: sql`COALESCE(SUM(${botRequests.revenueAmount}), 0)`,
            monetizedRequests: sql`COUNT(*) FILTER (WHERE ${botRequests.revenueAmount} > 0)`,
            avgRevenuePerRequest: sql`COALESCE(AVG(${botRequests.revenueAmount}) FILTER (WHERE ${botRequests.revenueAmount} > 0), 0)`,
            topPayingBot: sql`
                (SELECT ${botRequests.botName} 
                 FROM ${botRequests} 
                 WHERE ${botRequests.siteId} = ${siteId} 
                   AND ${botRequests.revenueAmount} > 0 
                   AND ${botRequests.createdAt} >= ${startDate}
                 GROUP BY ${botRequests.botName} 
                 ORDER BY SUM(${botRequests.revenueAmount}) DESC 
                 LIMIT 1)
            `,
        })
        .from(botRequests)
        .where(and(
            eq(botRequests.siteId, siteId),
            gte(botRequests.createdAt, startDate)
        ));

        return summary[0] || {
            totalRevenue: 0,
            monetizedRequests: 0,
            avgRevenuePerRequest: 0,
            topPayingBot: null,
        };
    }

    /**
     * Detect suspicious patterns (for security)
     */
    static async detectSuspiciousActivity(siteId, hours = 24) {
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - hours);

        const suspicious = await db.select({
            ipAddress: botRequests.ipAddress,
            requestCount: count(),
            uniqueUserAgents: sql`COUNT(DISTINCT ${botRequests.userAgent})`,
            botDetectionRate: sql`(COUNT(*) FILTER (WHERE ${botRequests.botDetected} = true))::float / COUNT(*)`,
        })
        .from(botRequests)
        .where(and(
            eq(botRequests.siteId, siteId),
            gte(botRequests.createdAt, startDate)
        ))
        .groupBy(botRequests.ipAddress)
        .having(sql`COUNT(*) > 100 OR (COUNT(*) FILTER (WHERE ${botRequests.botDetected} = true))::float / COUNT(*) > 0.8`)
        .orderBy(desc(count()));

        return suspicious;
    }

    /**
     * Clean up old requests (for data retention)
     */
    static async cleanupOldRequests(days = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const result = await db.delete(botRequests)
            .where(lte(botRequests.createdAt, cutoffDate));

        return result;
    }
}

export default BotRequest;
