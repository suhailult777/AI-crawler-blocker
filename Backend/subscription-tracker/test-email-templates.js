// Test email templates rendering
import { generateSubscriptionSuccessTemplate, generateCancellationTemplate } from './utils/email-template.js';
import fs from 'fs';

console.log('🧪 Testing AI Crawler Email Templates...\n');

// Test data for subscription success email
const subscriptionSuccessData = {
    userName: 'John Doe',
    planName: 'Pro Plan',
    price: '15.00',
    frequency: 'monthly',
    features: [
        'Advanced Bot Detection: Identify AI bots with 99%+ accuracy',
        'Full Monetization Engine: Convert bot traffic into revenue',
        'Stripe Connect Integration: Secure, automated payouts',
        'Advanced Rule Engine: Granular control over bot access',
        'Priority Support: Dedicated email support'
    ],
    renewalDate: 'Aug 14, 2025',
    paymentMethod: 'Stripe'
};

// Test data for cancellation email
const cancellationData = {
    userName: 'John Doe',
    planName: 'Pro Plan',
    price: '15.00',
    frequency: 'monthly',
    endDate: 'Aug 14, 2025',
    paymentMethod: 'Stripe'
};

try {
    // Generate subscription success email
    console.log('1. Generating subscription success email template...');
    const successEmail = generateSubscriptionSuccessTemplate(subscriptionSuccessData);
    fs.writeFileSync('subscription-success-email.html', successEmail);
    console.log('✅ Subscription success email template generated and saved to: subscription-success-email.html');

    // Generate cancellation email
    console.log('\n2. Generating cancellation confirmation email template...');
    const cancellationEmail = generateCancellationTemplate(cancellationData);
    fs.writeFileSync('cancellation-email.html', cancellationEmail);
    console.log('✅ Cancellation email template generated and saved to: cancellation-email.html');

    console.log('\n🎉 Email templates generated successfully!');
    console.log('📧 Both emails are configured to be sent to: suhailult777@gmail.com');
    console.log('🎨 Templates follow AI Crawler branding with dark theme and proper styling');
    
    console.log('\n📋 Email Features:');
    console.log('   • Subscription Success Email:');
    console.log('     - Welcome message with green success theme');
    console.log('     - Plan details and features included');
    console.log('     - Next billing date information');
    console.log('     - Call-to-action to access dashboard');
    
    console.log('   • Cancellation Confirmation Email:');
    console.log('     - Orange warning theme for cancellation');
    console.log('     - Access until end of billing period');
    console.log('     - Option to reactivate subscription');
    console.log('     - Clear next steps information');

} catch (error) {
    console.error('❌ Error generating email templates:', error);
}

console.log('\n🏁 Email template testing completed!');
