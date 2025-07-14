import dayjs from "dayjs";
import transporter, { accountEmail } from "../config/nodemailer.js";; // import transporter and accountEmail from nodemailer.js
import { emailTemplates } from "./email-template.js";

export const sendReminderEmail = async ({ to, type, subscription }) => {

    if (!to || !type) throw new Error('Missing required parameters')

    const template = emailTemplates.find((t) => t.label === type);

    if (!template) throw new Error('Invalid email type');

    const mailInfo = {
        userName: subscription.user.name,
        subscriptionName: subscription.name,
        renewalDate: dayjs(subscription.renewalDate).format('MMM D, YYYY'),
        planName: subscription.name,
        price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
        paymentMethod: subscription.paymentMethod,
    }

    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    const mailOptions = {
        from: accountEmail,
        to: to,
        subject: subject,
        html: message,
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Send subscription success email
export const sendSubscriptionSuccessEmail = async ({ to, subscription, user }) => {
    if (!to || !subscription) throw new Error('Missing required parameters for subscription success email');

    const template = emailTemplates.find((t) => t.label === 'subscription success');
    if (!template) throw new Error('Subscription success email template not found');

    // Parse features if they're stored as JSON string
    let features = [];
    try {
        features = typeof subscription.features === 'string'
            ? JSON.parse(subscription.features)
            : subscription.features || [];
    } catch (error) {
        console.error('Error parsing subscription features:', error);
        features = [];
    }

    const mailInfo = {
        userName: user.name,
        planName: subscription.planDisplayName || subscription.planName,
        price: subscription.price,
        frequency: subscription.frequency,
        features: features,
        renewalDate: dayjs(subscription.renewalDate).format('MMM D, YYYY'),
        paymentMethod: subscription.paymentMethod,
    };

    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    const mailOptions = {
        from: accountEmail,
        to: to,
        subject: subject,
        html: message,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending subscription success email:', error);
                reject(error);
            } else {
                console.log('Subscription success email sent: ' + info.response);
                resolve(info);
            }
        });
    });
};

// Send subscription cancellation email
export const sendSubscriptionCancellationEmail = async ({ to, subscription, user }) => {
    if (!to || !subscription) throw new Error('Missing required parameters for cancellation email');

    const template = emailTemplates.find((t) => t.label === 'subscription cancelled');
    if (!template) throw new Error('Subscription cancellation email template not found');

    const mailInfo = {
        userName: user.name,
        planName: subscription.planDisplayName || subscription.planName,
        price: subscription.price,
        frequency: subscription.frequency,
        endDate: dayjs(subscription.renewalDate).format('MMM D, YYYY'),
        paymentMethod: subscription.paymentMethod,
    };

    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    const mailOptions = {
        from: accountEmail,
        to: to,
        subject: subject,
        html: message,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending cancellation email:', error);
                reject(error);
            } else {
                console.log('Cancellation email sent: ' + info.response);
                resolve(info);
            }
        });
    });
};