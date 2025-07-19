import { pgTable, text, varchar, decimal, timestamp, boolean, pgEnum, integer, inet, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'cancelled', 'expired']);
export const subscriptionFrequencyEnum = pgEnum('subscription_frequency', ['daily', 'weekly', 'monthly', 'yearly']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['free', 'pro', 'enterprise']);
export const currencyEnum = pgEnum('currency', ['USD', 'EUR', 'GBP', 'INR']);

// WordPress Plugin specific enums
export const siteTypeEnum = pgEnum('site_type', ['manual', 'wordpress_plugin']);
export const siteStatusEnum = pgEnum('site_status', ['active', 'inactive', 'suspended']);
export const botActionEnum = pgEnum('bot_action', ['logged', 'allowed', 'blocked', 'monetized']);
export const botTypeEnum = pgEnum('bot_type', ['ai_bot', 'search_bot', 'social_bot', 'unknown']);

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planName: subscriptionPlanEnum('plan_name').notNull(),
  planDisplayName: varchar('plan_display_name', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: currencyEnum('currency').default('USD').notNull(),
  frequency: subscriptionFrequencyEnum('frequency').notNull(),
  status: subscriptionStatusEnum('status').default('active').notNull(),
  startDate: timestamp('start_date').notNull(),
  renewalDate: timestamp('renewal_date').notNull(),
  paymentMethod: varchar('payment_method', { length: 100 }).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  features: text('features'), // JSON string of features
  isTrialActive: boolean('is_trial_active').default(false),
  trialEndsAt: timestamp('trial_ends_at'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// WordPress Sites table - stores registered WordPress sites and manual URLs
export const wordpressSites = pgTable('wordpress_sites', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  siteUrl: varchar('site_url', { length: 255 }).notNull(),
  siteName: varchar('site_name', { length: 255 }),
  siteType: siteTypeEnum('site_type').default('manual').notNull(),
  status: siteStatusEnum('status').default('active').notNull(),
  apiKey: varchar('api_key', { length: 64 }).notNull().unique(),
  pluginVersion: varchar('plugin_version', { length: 20 }),
  wordpressVersion: varchar('wordpress_version', { length: 20 }),
  adminEmail: varchar('admin_email', { length: 255 }),
  monetizationEnabled: boolean('monetization_enabled').default(false),
  pricingPerRequest: decimal('pricing_per_request', { precision: 10, scale: 6 }).default('0.001'),
  allowedBots: json('allowed_bots').$type().default([]),
  stripeAccountId: varchar('stripe_account_id', { length: 255 }),
  cloudflareZoneId: varchar('cloudflare_zone_id', { length: 255 }),
  lastPingAt: timestamp('last_ping_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Bot Requests table - logs all bot detection and monetization events
export const botRequests = pgTable('bot_requests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  siteId: text('site_id').notNull().references(() => wordpressSites.id, { onDelete: 'cascade' }),
  ipAddress: inet('ip_address').notNull(),
  userAgent: text('user_agent').notNull(),
  botDetected: boolean('bot_detected').default(false),
  botType: botTypeEnum('bot_type'),
  botName: varchar('bot_name', { length: 100 }),
  confidenceScore: integer('confidence_score').default(0),
  pageUrl: text('page_url'),
  contentType: varchar('content_type', { length: 50 }),
  contentLength: integer('content_length').default(0),
  actionTaken: botActionEnum('action_taken').default('logged'),
  revenueAmount: decimal('revenue_amount', { precision: 10, scale: 6 }).default('0.00'),
  paymentId: varchar('payment_id', { length: 255 }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Site Analytics table - aggregated analytics for dashboard
export const siteAnalytics = pgTable('site_analytics', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  siteId: text('site_id').notNull().references(() => wordpressSites.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  totalRequests: integer('total_requests').default(0),
  botRequests: integer('bot_requests').default(0),
  monetizedRequests: integer('monetized_requests').default(0),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 6 }).default('0.00'),
  uniqueBots: integer('unique_bots').default(0),
  topBotTypes: json('top_bot_types'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Plugin Configurations table - store plugin settings
export const pluginConfigurations = pgTable('plugin_configurations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  siteId: text('site_id').notNull().references(() => wordpressSites.id, { onDelete: 'cascade' }),
  configKey: varchar('config_key', { length: 100 }).notNull(),
  configValue: text('config_value'),
  isEncrypted: boolean('is_encrypted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  wordpressSites: many(wordpressSites),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const wordpressSitesRelations = relations(wordpressSites, ({ one, many }) => ({
  user: one(users, {
    fields: [wordpressSites.userId],
    references: [users.id],
  }),
  botRequests: many(botRequests),
  siteAnalytics: many(siteAnalytics),
  pluginConfigurations: many(pluginConfigurations),
}));

export const botRequestsRelations = relations(botRequests, ({ one }) => ({
  site: one(wordpressSites, {
    fields: [botRequests.siteId],
    references: [wordpressSites.id],
  }),
}));

export const siteAnalyticsRelations = relations(siteAnalytics, ({ one }) => ({
  site: one(wordpressSites, {
    fields: [siteAnalytics.siteId],
    references: [wordpressSites.id],
  }),
}));

export const pluginConfigurationsRelations = relations(pluginConfigurations, ({ one }) => ({
  site: one(wordpressSites, {
    fields: [pluginConfigurations.siteId],
    references: [wordpressSites.id],
  }),
}));
