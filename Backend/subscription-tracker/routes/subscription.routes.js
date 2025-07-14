import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";

import {
    createSubscription,
    getAllUserSubscriptions,
    getRenewals,
    getSubscriptionDetails,
    getUserSubscriptions,
    updateSubscription,
    cancelSubscription,
    upgradePlan,
    getCurrentUserSubscription
} from "../controllers/subscription.controller.js";


const subscriptionRouter = Router();

subscriptionRouter.get('/', authorize, getAllUserSubscriptions);

subscriptionRouter.get('/upcoming-renewals', authorize, getRenewals);

subscriptionRouter.get('/:id', authorize, getSubscriptionDetails);

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/:id', authorize, updateSubscription);

subscriptionRouter.delete('/:id', authorize, cancelSubscription);

subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

subscriptionRouter.put('/:id/cancel', authorize, cancelSubscription);

// New routes for AI Crawler specific functionality
subscriptionRouter.get('/me/current', authorize, getCurrentUserSubscription);

subscriptionRouter.put('/me/upgrade', authorize, upgradePlan);






export default subscriptionRouter;