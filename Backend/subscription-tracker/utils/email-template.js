export const generateEmailTemplate = ({
    userName,
    subscriptionName,
    renewalDate,
    planName,
    price,
    paymentMethod,
    accountSettingsLink,
    supportLink,
    daysLeft,
}) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #0f172a;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #1e293b; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
        <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); text-align: center; padding: 30px;">
                <h1 style="color: white; font-size: 32px; font-weight: 800; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🤖 AI Crawler</h1>
                <p style="color: #e2e8f0; font-size: 14px; margin: 5px 0 0 0; opacity: 0.9;">Bot Protection & Monetization Platform</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px; background-color: #1e293b;">
                <p style="font-size: 16px; margin-bottom: 25px; color: #e2e8f0;">Hello <strong style="color: #3b82f6;">${userName}</strong>,</p>

                <p style="font-size: 16px; margin-bottom: 25px; color: #cbd5e1;">Your <strong style="color: #3b82f6;">${subscriptionName}</strong> subscription is set to renew on <strong style="color: #3b82f6;">${renewalDate}</strong> (${daysLeft} days from today).</p>
                
                <div style="background-color: #374151; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                    <h3 style="color: #3b82f6; margin-top: 0; font-size: 18px;">🔒 Subscription Details:</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 12px; color: #e2e8f0;"><strong style="color: #94a3b8;">Plan:</strong> ${planName}</li>
                        <li style="margin-bottom: 12px; color: #e2e8f0;"><strong style="color: #94a3b8;">Price:</strong> ${price}</li>
                        <li style="margin-bottom: 12px; color: #e2e8f0;"><strong style="color: #94a3b8;">Payment Method:</strong> ${paymentMethod}</li>
                        <li style="margin-bottom: 12px; color: #e2e8f0;"><strong style="color: #94a3b8;">Renewal Date:</strong> ${renewalDate}</li>
                    </ul>
                </div>

                <div style="background-color: #1e40af; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                    <p style="color: white; margin: 0; font-size: 16px;">
                        Continue protecting your website from AI crawlers and monetizing bot traffic with AI Crawler's advanced detection and monetization engine.
                    </p>
                </div>

                <p style="font-size: 16px; margin-bottom: 25px; color: #cbd5e1;">If you'd like to make changes or cancel your subscription, please visit your <a href="${accountSettingsLink || '#'}" style="color: #3b82f6; text-decoration: none;">account settings</a> before the renewal date.</p>

                <p style="font-size: 16px; margin-top: 30px; color: #cbd5e1;">Need help? <a href="${supportLink || 'mailto:support@aicrawler.com'}" style="color: #3b82f6; text-decoration: none;">Contact our support team</a> anytime.</p>

                <p style="font-size: 16px; margin-top: 30px; color: #e2e8f0;">
                    Best regards,<br>
                    <strong style="color: #3b82f6;">The AI Crawler Team</strong>
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #0f172a; padding: 20px; text-align: center; font-size: 14px; border-top: 1px solid #374151;">
                <p style="margin: 0 0 10px; color: #64748b;">
                    AI Crawler | Advanced Bot Protection & Monetization Platform
                </p>
                <p style="margin: 0;">
                    <a href="#" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">Unsubscribe</a> |
                    <a href="#" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">Privacy Policy</a> |
                    <a href="#" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                </p>
            </td>
        </tr>
    </table>
</div>
`;

// Subscription Success Email Template
export const generateSubscriptionSuccessTemplate = ({
    userName,
    planName,
    price,
    frequency,
    features,
    renewalDate,
    paymentMethod,
}) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #0f172a;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #1e293b; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
        <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); text-align: center; padding: 30px;">
                <h1 style="color: white; font-size: 32px; font-weight: 800; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🤖 AI Crawler</h1>
                <p style="color: #e2e8f0; font-size: 14px; margin: 5px 0 0 0; opacity: 0.9;">Bot Protection & Monetization Platform</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px; background-color: #1e293b;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="background-color: #10b981; color: white; padding: 15px 25px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                        ✅ Subscription Activated!
                    </div>
                </div>

                <p style="font-size: 18px; margin-bottom: 25px; color: #e2e8f0; text-align: center;">Welcome to AI Crawler, <strong style="color: #10b981;">${userName}</strong>!</p>

                <p style="font-size: 16px; margin-bottom: 25px; color: #cbd5e1; text-align: center;">Your <strong style="color: #10b981;">${planName}</strong> subscription has been successfully activated. You now have access to advanced bot protection and monetization features.</p>

                <div style="background-color: #374151; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
                    <h3 style="color: #10b981; margin-top: 0; font-size: 18px;">📋 Your Subscription Details:</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 12px; color: #e2e8f0;"><strong style="color: #94a3b8;">Plan:</strong> ${planName}</li>
                        <li style="margin-bottom: 12px; color: #e2e8f0;"><strong style="color: #94a3b8;">Price:</strong> $${price}/${frequency}</li>
                        <li style="margin-bottom: 12px; color: #e2e8f0;"><strong style="color: #94a3b8;">Payment Method:</strong> ${paymentMethod}</li>
                        <li style="margin-bottom: 12px; color: #e2e8f0;"><strong style="color: #94a3b8;">Next Billing Date:</strong> ${renewalDate}</li>
                    </ul>
                </div>

                <div style="background-color: #1e40af; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: white; margin-top: 0; font-size: 18px;">🚀 Features Included in Your Plan:</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${features.map(feature => `<li style="margin-bottom: 8px; color: #e2e8f0; display: flex; align-items: center;"><span style="color: #10b981; margin-right: 8px;">✓</span> ${feature}</li>`).join('')}
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #cbd5e1; margin-bottom: 20px;">Ready to start protecting your website from AI crawlers?</p>
                    <a href="#" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Access Your Dashboard</a>
                </div>

                <p style="font-size: 16px; margin-top: 30px; color: #cbd5e1;">Need help getting started? <a href="mailto:support@aicrawler.com" style="color: #10b981; text-decoration: none;">Contact our support team</a> - we're here to help!</p>

                <p style="font-size: 16px; margin-top: 30px; color: #e2e8f0;">
                    Best regards,<br>
                    <strong style="color: #10b981;">The AI Crawler Team</strong>
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #0f172a; padding: 20px; text-align: center; font-size: 14px; border-top: 1px solid #374151;">
                <p style="margin: 0 0 10px; color: #64748b;">
                    AI Crawler | Advanced Bot Protection & Monetization Platform
                </p>
                <p style="margin: 0;">
                    <a href="#" style="color: #10b981; text-decoration: none; margin: 0 10px;">Manage Subscription</a> |
                    <a href="#" style="color: #10b981; text-decoration: none; margin: 0 10px;">Privacy Policy</a> |
                    <a href="#" style="color: #10b981; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                </p>
            </td>
        </tr>
    </table>
</div>
`;

// Cancellation Confirmation Email Template
export const generateCancellationTemplate = ({
    userName,
    planName,
    price,
    frequency,
    endDate,
    paymentMethod,
}) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #0f172a;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #1e293b; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
        <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-align: center; padding: 30px;">
                <h1 style="color: white; font-size: 32px; font-weight: 800; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🤖 AI Crawler</h1>
                <p style="color: #fef3c7; font-size: 14px; margin: 5px 0 0 0; opacity: 0.9;">Bot Protection & Monetization Platform</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px; background-color: #1e293b;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="background-color: #f59e0b; color: white; padding: 15px 25px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                        ⚠️ Subscription Cancelled
                    </div>
                </div>

                <p style="font-size: 18px; margin-bottom: 25px; color: #e2e8f0; text-align: center;">Hello <strong style="color: #f59e0b;">${userName}</strong>,</p>

                <p style="font-size: 16px; margin-bottom: 25px; color: #cbd5e1; text-align: center;">We've successfully cancelled your <strong style="color: #f59e0b;">${planName}</strong> subscription as requested.</p>

                <div style="background-color: #374151; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                    <h3 style="color: #f59e0b; margin-top: 0; font-size: 18px;">📋 Cancellation Details:</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 12px; color: #e2e8f0;"><strong style="color: #94a3b8;">Cancelled Plan:</strong> ${planName}</li>
                        <li style="margin-bottom: 12px; color: #e2e8f0;"><strong style="color: #94a3b8;">Previous Price:</strong> $${price}/${frequency}</li>
                        <li style="margin-bottom: 12px; color: #e2e8f0;"><strong style="color: #94a3b8;">Payment Method:</strong> ${paymentMethod}</li>
                        <li style="margin-bottom: 12px; color: #e2e8f0;"><strong style="color: #94a3b8;">Access Until:</strong> ${endDate}</li>
                    </ul>
                </div>

                <div style="background-color: #1e40af; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: white; margin-top: 0; font-size: 18px;">ℹ️ What Happens Next:</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 8px; color: #e2e8f0; display: flex; align-items: center;"><span style="color: #f59e0b; margin-right: 8px;">•</span> You'll continue to have access to all premium features until ${endDate}</li>
                        <li style="margin-bottom: 8px; color: #e2e8f0; display: flex; align-items: center;"><span style="color: #f59e0b; margin-right: 8px;">•</span> No further charges will be made to your payment method</li>
                        <li style="margin-bottom: 8px; color: #e2e8f0; display: flex; align-items: center;"><span style="color: #f59e0b; margin-right: 8px;">•</span> After ${endDate}, your account will revert to the Free plan</li>
                        <li style="margin-bottom: 8px; color: #e2e8f0; display: flex; align-items: center;"><span style="color: #f59e0b; margin-right: 8px;">•</span> You can reactivate your subscription anytime from your dashboard</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #cbd5e1; margin-bottom: 20px;">Changed your mind? You can reactivate your subscription anytime.</p>
                    <a href="#" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 10px;">Reactivate Subscription</a>
                    <a href="#" style="background-color: #374151; color: #e2e8f0; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View Dashboard</a>
                </div>

                <p style="font-size: 16px; margin-top: 30px; color: #cbd5e1;">We're sorry to see you go! If you have any feedback or need assistance, please <a href="mailto:support@aicrawler.com" style="color: #f59e0b; text-decoration: none;">contact our support team</a>.</p>

                <p style="font-size: 16px; margin-top: 30px; color: #e2e8f0;">
                    Best regards,<br>
                    <strong style="color: #f59e0b;">The AI Crawler Team</strong>
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #0f172a; padding: 20px; text-align: center; font-size: 14px; border-top: 1px solid #374151;">
                <p style="margin: 0 0 10px; color: #64748b;">
                    AI Crawler | Advanced Bot Protection & Monetization Platform
                </p>
                <p style="margin: 0;">
                    <a href="#" style="color: #f59e0b; text-decoration: none; margin: 0 10px;">Reactivate</a> |
                    <a href="#" style="color: #f59e0b; text-decoration: none; margin: 0 10px;">Privacy Policy</a> |
                    <a href="#" style="color: #f59e0b; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                </p>
            </td>
        </tr>
    </table>
</div>
`;

export const emailTemplates = [
    {
        label: "7 days before reminder",
        generateSubject: (data) =>
            `🤖 AI Crawler: Your ${data.planName} Plan Renews in 7 Days`,
        generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 7 }),
    },
    {
        label: "3 days before reminder",
        generateSubject: (data) =>
            `⚠️ AI Crawler: ${data.planName} Plan Renewal in 3 Days`,
        generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 3 }),
    },
    {
        label: "2 days before reminder",
        generateSubject: (data) =>
            `🚨 AI Crawler: Final Notice - ${data.planName} Plan Renews in 2 Days`,
        generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 2 }),
    },
    {
        label: "subscription success",
        generateSubject: (data) =>
            `🎉 Welcome to AI Crawler! Your ${data.planName} Plan is Now Active`,
        generateBody: (data) => generateSubscriptionSuccessTemplate(data),
    },
    {
        label: "subscription cancelled",
        generateSubject: (data) =>
            `✅ AI Crawler: Your ${data.planName} Subscription Has Been Cancelled`,
        generateBody: (data) => generateCancellationTemplate(data),
    },
];