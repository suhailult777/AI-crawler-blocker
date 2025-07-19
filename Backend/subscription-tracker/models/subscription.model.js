import { eq, and, isNotNull } from 'drizzle-orm';
import { db } from '../database/mongodb.js';
import { subscriptions, users } from '../database/schema.js';

// AI Crawler plan configurations
const PLAN_CONFIGS = {
    free: {
        name: 'Free',
        price: 0,
        features: [
            'Advanced Bot Detection',
            'Revenue Analytics Dashboard',
            'Real-time Monitoring',
            'Basic reporting and insights',
            'Community support'
        ],
        limits: {
            monthlyRequests: 10000,
            botDetectionAccuracy: 95,
            analyticsRetention: 30, // days
            maxSites: 1,
            wordpressPluginAccess: false
        }
    },
    pro: {
        name: 'Pro',
        price: 15,
        features: [
            'All Free Tier features',
            'Full Monetization Engine',
            'Stripe Connect Integration',
            'Advanced Rule Engine',
            'Priority Support',
            'Advanced analytics and reporting',
            'Custom bot detection rules'
        ],
        limits: {
            monthlyRequests: 100000,
            botDetectionAccuracy: 99,
            analyticsRetention: 365, // days
            maxSites: 5,
            wordpressPluginAccess: true
        }
    },
    enterprise: {
        name: 'Enterprise',
        price: 99,
        features: [
            'All Pro Tier features',
            'White-label Solution',
            'Custom Integration Support',
            'Dedicated Account Manager',
            'SLA Guarantee',
            'Custom Analytics',
            'API Access'
        ],
        limits: {
            monthlyRequests: -1, // unlimited
            botDetectionAccuracy: 99.9,
            analyticsRetention: -1, // unlimited
            maxSites: -1, // unlimited
            wordpressPluginAccess: true
        }
    }
};

export class Subscription {
    static getPlanConfig(planName) {
        return PLAN_CONFIGS[planName] || PLAN_CONFIGS.free;
    }

    static async create(subscriptionData) {
        // Get plan configuration
        const planConfig = this.getPlanConfig(subscriptionData.planName || 'free');

        // Auto-calculate renewal date if missing
        let renewalDate = subscriptionData.renewalDate;
        if (!renewalDate) {
            const renewalPeriods = {
                daily: 1,
                weekly: 7,
                monthly: 30,
                yearly: 365,
            };

            renewalDate = new Date(subscriptionData.startDate || new Date());
            renewalDate.setDate(renewalDate.getDate() + renewalPeriods[subscriptionData.frequency || 'monthly']);
        }

        // Auto-update status if renewal date has passed
        let status = subscriptionData.status || 'active';
        if (renewalDate < new Date()) {
            status = 'expired';
        }

        // Use plan config for features and pricing
        const features = subscriptionData.features || planConfig.features;
        const price = subscriptionData.price !== undefined ? subscriptionData.price : planConfig.price;

        const [subscription] = await db.insert(subscriptions).values({
            userId: subscriptionData.user || subscriptionData.userId,
            planName: subscriptionData.planName || 'free',
            planDisplayName: subscriptionData.name || subscriptionData.planDisplayName || planConfig.name,
            price: price.toString(),
            currency: subscriptionData.currency || 'USD',
            frequency: subscriptionData.frequency || 'monthly',
            status: status,
            startDate: new Date(subscriptionData.startDate || new Date()),
            renewalDate: new Date(renewalDate),
            paymentMethod: subscriptionData.paymentMethod || 'stripe',
            stripeCustomerId: subscriptionData.stripeCustomerId,
            stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
            features: JSON.stringify(features),
            isTrialActive: subscriptionData.isTrialActive || false,
            trialEndsAt: subscriptionData.trialEndsAt ? new Date(subscriptionData.trialEndsAt) : null,
        }).returning();

        return subscription;
    }

    static async find(filter = {}) {
        let query = db.select().from(subscriptions);

        if (filter.user || filter.userId) {
            query = query.where(eq(subscriptions.userId, filter.user || filter.userId));
        }

        if (filter.renewalDate && filter.renewalDate.$exists) {
            // For finding renewals - we'll handle this in a separate method
        }

        return await query;
    }

    static async findById(id) {
        const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
        return subscription;
    }

    static async findWithUser(id) {
        const result = await db
            .select({
                subscription: subscriptions,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                }
            })
            .from(subscriptions)
            .leftJoin(users, eq(subscriptions.userId, users.id))
            .where(eq(subscriptions.id, id));

        if (result.length === 0) return null;

        return {
            ...result[0].subscription,
            user: result[0].user
        };
    }

    static async findRenewals() {
        return await db.select().from(subscriptions).where(eq(subscriptions.status, 'active'));
    }

    static async findActiveByUserId(userId) {
        const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(and(
                eq(subscriptions.userId, userId),
                eq(subscriptions.status, 'active')
            ));
        return subscription;
    }

    static async updateStatus(id, status, cancelledAt = null) {
        const updateData = { status, updatedAt: new Date() };
        if (cancelledAt) {
            updateData.cancelledAt = cancelledAt;
        }

        const [updated] = await db
            .update(subscriptions)
            .set(updateData)
            .where(eq(subscriptions.id, id))
            .returning();

        return updated;
    }

    static async upgradePlan(userId, newPlanName) {
        const currentSubscription = await this.findActiveByUserId(userId);
        if (!currentSubscription) {
            throw new Error('No active subscription found');
        }

        const newPlanConfig = this.getPlanConfig(newPlanName);

        const [updated] = await db
            .update(subscriptions)
            .set({
                planName: newPlanName,
                planDisplayName: newPlanConfig.name,
                price: newPlanConfig.price.toString(),
                features: JSON.stringify(newPlanConfig.features),
                updatedAt: new Date()
            })
            .where(eq(subscriptions.id, currentSubscription.id))
            .returning();

        return updated;
    }

    static async getSubscriptionWithFeatures(id) {
        const subscription = await this.findById(id);
        if (!subscription) return null;

        const planConfig = this.getPlanConfig(subscription.planName);

        return {
            ...subscription,
            features: subscription.features ? JSON.parse(subscription.features) : planConfig.features,
            limits: planConfig.limits,
            planConfig: planConfig
        };
    }
}

export default Subscription;