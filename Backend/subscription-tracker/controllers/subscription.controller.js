import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";
import { sendSubscriptionSuccessEmail, sendSubscriptionCancellationEmail } from "../utils/send-email.js";
import User from "../models/user.model.js";


export const createSubscription = async (req, res, next) => {
    try {
        // Check if user already has an active subscription
        const existingSubscription = await Subscription.findActiveByUserId(req.user.id);
        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: 'User already has an active subscription. Please upgrade or cancel existing subscription first.'
            });
        }

        const subscription = await Subscription.create({
            ...req.body,
            userId: req.user.id,
        });

        // Send subscription success email
        try {
            await sendSubscriptionSuccessEmail({
                to: req.user.email,
                subscription: subscription,
                user: req.user
            });
            console.log('Subscription success email sent successfully');
        } catch (emailError) {
            console.error('Failed to send subscription success email:', emailError);
            // Don't fail the subscription creation if email fails
        }

        // Only trigger workflow for paid plans
        let workflowRunId = null;
        if (subscription.planName !== 'free') {
            try {
                const workflowResponse = await workflowClient.trigger({
                    url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
                    body: {
                        subscriptionId: subscription.id,
                    },
                    headers: {
                        'content-type': 'application/json',
                    },
                    retries: 0,
                });
                workflowRunId = workflowResponse.workflowRunId;
            } catch (workflowError) {
                console.error('Failed to trigger workflow:', workflowError);
                // Don't fail the subscription creation if workflow fails
            }
        }

        res.status(201).json({
            success: true,
            data: { subscription, workflowRunId },
            message: 'Subscription created successfully'
        });
    } catch (e) {
        next(e);
    }
}

export const getUserSubscriptions = async (req, res, next) => {
    try {

        //check if the user is the same as the one in the token
        if (req.user.id !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.params.id });

        res.status(200).json({ success: true, data: subscriptions });

    } catch (e) {
        next(e);
    }
}

export const getAllUserSubscriptions = async (req, res, next) => {
    try {
        const AllSubscription = await Subscription.find();

        res.status(200).json({ success: true, data: AllSubscription });

    } catch (e) {
        next(e);
    }
}

export const getSubscriptionDetails = async (req, res, next) => {
    try {
        const SubscriptionDetails = await Subscription.findById(req.params.id); // OR Subscription.findOne({ _id: req.params.id })

        if (!SubscriptionDetails) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }


        res.status(200).json({ success: true, data: SubscriptionDetails });
    } catch (e) {
        next(e);
    }
}

export const getRenewals = async (req, res, next) => {
    try {
        const renewals = await Subscription.findRenewals();
        res.status(200).json({ success: true, data: renewals });
    } catch (e) {
        next(e);
    }
}

export const updateSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subscription = await Subscription.findById(id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        // Check if user owns this subscription
        if (subscription.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this subscription'
            });
        }

        const updatedSubscription = await Subscription.updateStatus(
            id,
            req.body.status,
            req.body.status === 'cancelled' ? new Date() : null
        );

        res.status(200).json({
            success: true,
            data: updatedSubscription,
            message: 'Subscription updated successfully'
        });
    } catch (e) {
        next(e);
    }
}

export const cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subscription = await Subscription.findById(id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        // Check if user owns this subscription
        if (subscription.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to cancel this subscription'
            });
        }

        const cancelledSubscription = await Subscription.updateStatus(
            id,
            'cancelled',
            new Date()
        );

        // Send cancellation confirmation email
        try {
            await sendSubscriptionCancellationEmail({
                to: req.user.email,
                subscription: cancelledSubscription,
                user: req.user
            });
            console.log('Cancellation confirmation email sent successfully');
        } catch (emailError) {
            console.error('Failed to send cancellation confirmation email:', emailError);
            // Don't fail the cancellation if email fails
        }

        res.status(200).json({
            success: true,
            data: cancelledSubscription,
            message: 'Subscription cancelled successfully'
        });
    } catch (e) {
        next(e);
    }
}

export const upgradePlan = async (req, res, next) => {
    try {
        const { planName } = req.body;

        if (!['free', 'pro', 'enterprise'].includes(planName)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan name. Must be one of: free, pro, enterprise'
            });
        }

        const upgradedSubscription = await Subscription.upgradePlan(req.user.id, planName);

        res.status(200).json({
            success: true,
            data: upgradedSubscription,
            message: `Plan upgraded to ${planName} successfully`
        });
    } catch (e) {
        next(e);
    }
}

export const getCurrentUserSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findActiveByUserId(req.user.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'No active subscription found'
            });
        }

        const subscriptionWithFeatures = await Subscription.getSubscriptionWithFeatures(subscription.id);

        res.status(200).json({
            success: true,
            data: subscriptionWithFeatures
        });
    } catch (e) {
        next(e);
    }
}