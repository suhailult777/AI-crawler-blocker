import dayjs from "dayjs";
import { createRequire } from "module";
import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";

const require = createRequire(import.meta.url);

const { serve } = require("@upstash/workflow/express");

const REMINDERS = [7, 3, 2];

export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;
    const subscription = await fetctSubscription(context, subscriptionId);

    if (!subscription || subscription.status !== "active") return;

    const renewalDate = dayjs(subscription.renewalDate);

    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow. }`);
        return;
    }

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, "day");

        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `${daysBefore} days before reminder`, reminderDate);
        }


        if (dayjs().isSame(reminderDate, "day")) {
            await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
        }
    }
});

const fetctSubscription = async (context, subscriptionId) => {
    return await context.run("get subscription", async () => {
        return Subscription.findById(subscriptionId).populate("user", "name email");
    });
};

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} reminder`); // you can log the label here to see which reminder is being triggered. This is optional.
        //send email, sms, push notifications...

        await sendReminderEmail({
            to: subscription.user.email,
            type: label, // reminder.label.subscription, // use the label as the type for now, but you can use a more specific type if you want to send different emails for different reminders.
            subscription, // pass the subscription object to the sendReminderEmail function.
        });

    });
};
