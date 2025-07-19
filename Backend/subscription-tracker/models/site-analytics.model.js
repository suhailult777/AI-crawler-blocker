import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { db } from '../database/mongodb.js';
import { siteAnalytics, botRequests, wordpressSites } from '../database/schema.js';

export class SiteAnalytics {
    /**
     * Create or update daily analytics for a site
     */
    static async upsertDailyAnalytics(siteId, date, analyticsData) {
        const [analytics] = await db.insert(siteAnalytics).values({
            siteId,
            date,
            totalRequests: analyticsData.totalRequests || 0,
            botRequests: analyticsData.botRequests || 0,
            monetizedRequests: analyticsData.monetizedRequests || 0,
            totalRevenue: analyticsData.totalRevenue || '0.00',
            uniqueBots: analyticsData.uniqueBots || 0,
            topBotTypes: analyticsData.topBotTypes || {},
        })
        .onConflictDoUpdate({
            target: [siteAnalytics.siteId, siteAnalytics.date],
            set: {
                totalRequests: analyticsData.totalRequests || 0,
                botRequests: analyticsData.botRequests || 0,
                monetizedRequests: analyticsData.monetizedRequests || 0,
                totalRevenue: analyticsData.totalRevenue || '0.00',
                uniqueBots: analyticsData.uniqueBots || 0,
                topBotTypes: analyticsData.topBotTypes || {},
                createdAt: new Date(),
            }
        })
        .returning();

        return analytics;
    }

    /**
     * Get analytics for a site within date range
     */
    static async getAnalytics(siteId, startDate, endDate) {
        return await db.select()
            .from(siteAnalytics)
            .where(and(
                eq(siteAnalytics.siteId, siteId),
                gte(siteAnalytics.date, startDate),
                lte(siteAnalytics.date, endDate)
            ))
            .orderBy(desc(siteAnalytics.date));
    }

    /**
     * Get aggregated analytics summary for a site
     */
    static async getSummary(siteId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const summary = await db.select({
            totalRequests: sql`COALESCE(SUM(${siteAnalytics.totalRequests}), 0)`,
            botRequests: sql`COALESCE(SUM(${siteAnalytics.botRequests}), 0)`,
            monetizedRequests: sql`COALESCE(SUM(${siteAnalytics.monetizedRequests}), 0)`,
            totalRevenue: sql`COALESCE(SUM(${siteAnalytics.totalRevenue}), 0)`,
            avgUniqueBotsPerDay: sql`COALESCE(AVG(${siteAnalytics.uniqueBots}), 0)`,
            daysWithData: sql`COUNT(*)`,
        })
        .from(siteAnalytics)
        .where(and(
            eq(siteAnalytics.siteId, siteId),
            gte(siteAnalytics.date, startDate)
        ));

        return summary[0] || {
            totalRequests: 0,
            botRequests: 0,
            monetizedRequests: 0,
            totalRevenue: 0,
            avgUniqueBotsPerDay: 0,
            daysWithData: 0,
        };
    }

    /**
     * Generate daily analytics from bot requests
     */
    static async generateDailyAnalytics(siteId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const analytics = await db.select({
            totalRequests: sql`COUNT(*)`,
            botRequests: sql`COUNT(*) FILTER (WHERE ${botRequests.botDetected} = true)`,
            monetizedRequests: sql`COUNT(*) FILTER (WHERE ${botRequests.revenueAmount} > 0)`,
            totalRevenue: sql`COALESCE(SUM(${botRequests.revenueAmount}), 0)`,
            uniqueBots: sql`COUNT(DISTINCT ${botRequests.botName}) FILTER (WHERE ${botRequests.botDetected} = true)`,
        })
        .from(botRequests)
        .where(and(
            eq(botRequests.siteId, siteId),
            gte(botRequests.createdAt, startOfDay),
            lte(botRequests.createdAt, endOfDay)
        ));

        // Get top bot types for the day
        const topBotTypes = await db.select({
            botName: botRequests.botName,
            count: sql`COUNT(*)`,
        })
        .from(botRequests)
        .where(and(
            eq(botRequests.siteId, siteId),
            eq(botRequests.botDetected, true),
            gte(botRequests.createdAt, startOfDay),
            lte(botRequests.createdAt, endOfDay)
        ))
        .groupBy(botRequests.botName)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(10);

        const topBotTypesObj = {};
        topBotTypes.forEach(bot => {
            if (bot.botName) {
                topBotTypesObj[bot.botName] = parseInt(bot.count);
            }
        });

        const analyticsData = {
            ...analytics[0],
            topBotTypes: topBotTypesObj,
        };

        return await this.upsertDailyAnalytics(siteId, date, analyticsData);
    }

    /**
     * Get analytics for all sites of a user
     */
    static async getUserAnalytics(userId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await db.select({
            siteId: siteAnalytics.siteId,
            siteName: wordpressSites.siteName,
            siteUrl: wordpressSites.siteUrl,
            totalRequests: sql`COALESCE(SUM(${siteAnalytics.totalRequests}), 0)`,
            botRequests: sql`COALESCE(SUM(${siteAnalytics.botRequests}), 0)`,
            monetizedRequests: sql`COALESCE(SUM(${siteAnalytics.monetizedRequests}), 0)`,
            totalRevenue: sql`COALESCE(SUM(${siteAnalytics.totalRevenue}), 0)`,
        })
        .from(siteAnalytics)
        .innerJoin(wordpressSites, eq(siteAnalytics.siteId, wordpressSites.id))
        .where(and(
            eq(wordpressSites.userId, userId),
            gte(siteAnalytics.date, startDate)
        ))
        .groupBy(siteAnalytics.siteId, wordpressSites.siteName, wordpressSites.siteUrl)
        .orderBy(sql`SUM(${siteAnalytics.totalRevenue}) DESC`);
    }

    /**
     * Get trending analytics (growth rates)
     */
    static async getTrendingAnalytics(siteId, days = 30) {
        const currentPeriodStart = new Date();
        currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
        
        const previousPeriodStart = new Date();
        previousPeriodStart.setDate(previousPeriodStart.getDate() - (days * 2));
        
        const previousPeriodEnd = new Date();
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - days);

        // Current period analytics
        const currentPeriod = await db.select({
            totalRequests: sql`COALESCE(SUM(${siteAnalytics.totalRequests}), 0)`,
            botRequests: sql`COALESCE(SUM(${siteAnalytics.botRequests}), 0)`,
            totalRevenue: sql`COALESCE(SUM(${siteAnalytics.totalRevenue}), 0)`,
        })
        .from(siteAnalytics)
        .where(and(
            eq(siteAnalytics.siteId, siteId),
            gte(siteAnalytics.date, currentPeriodStart)
        ));

        // Previous period analytics
        const previousPeriod = await db.select({
            totalRequests: sql`COALESCE(SUM(${siteAnalytics.totalRequests}), 0)`,
            botRequests: sql`COALESCE(SUM(${siteAnalytics.botRequests}), 0)`,
            totalRevenue: sql`COALESCE(SUM(${siteAnalytics.totalRevenue}), 0)`,
        })
        .from(siteAnalytics)
        .where(and(
            eq(siteAnalytics.siteId, siteId),
            gte(siteAnalytics.date, previousPeriodStart),
            lte(siteAnalytics.date, previousPeriodEnd)
        ));

        const current = currentPeriod[0] || { totalRequests: 0, botRequests: 0, totalRevenue: 0 };
        const previous = previousPeriod[0] || { totalRequests: 0, botRequests: 0, totalRevenue: 0 };

        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        return {
            current,
            previous,
            growth: {
                totalRequests: calculateGrowth(current.totalRequests, previous.totalRequests),
                botRequests: calculateGrowth(current.botRequests, previous.botRequests),
                totalRevenue: calculateGrowth(current.totalRevenue, previous.totalRevenue),
            }
        };
    }

    /**
     * Get chart data for dashboard
     */
    static async getChartData(siteId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await db.select({
            date: siteAnalytics.date,
            totalRequests: siteAnalytics.totalRequests,
            botRequests: siteAnalytics.botRequests,
            monetizedRequests: siteAnalytics.monetizedRequests,
            totalRevenue: siteAnalytics.totalRevenue,
            uniqueBots: siteAnalytics.uniqueBots,
        })
        .from(siteAnalytics)
        .where(and(
            eq(siteAnalytics.siteId, siteId),
            gte(siteAnalytics.date, startDate)
        ))
        .orderBy(siteAnalytics.date);
    }

    /**
     * Aggregate analytics for multiple sites (for platform overview)
     */
    static async getPlatformAnalytics(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await db.select({
            totalSites: sql`COUNT(DISTINCT ${siteAnalytics.siteId})`,
            totalRequests: sql`COALESCE(SUM(${siteAnalytics.totalRequests}), 0)`,
            totalBotRequests: sql`COALESCE(SUM(${siteAnalytics.botRequests}), 0)`,
            totalMonetizedRequests: sql`COALESCE(SUM(${siteAnalytics.monetizedRequests}), 0)`,
            totalRevenue: sql`COALESCE(SUM(${siteAnalytics.totalRevenue}), 0)`,
            avgRevenuePerSite: sql`COALESCE(AVG(${siteAnalytics.totalRevenue}), 0)`,
        })
        .from(siteAnalytics)
        .where(gte(siteAnalytics.date, startDate));
    }

    /**
     * Clean up old analytics data
     */
    static async cleanupOldAnalytics(days = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const result = await db.delete(siteAnalytics)
            .where(lte(siteAnalytics.date, cutoffDate));

        return result;
    }
}

export default SiteAnalytics;
