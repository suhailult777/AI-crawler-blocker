# CrawlGuard WordPress Plugin - JWT Authentication Implementation

## Overview

The CrawlGuard WordPress plugin now supports JWT (JSON Web Token) authentication for enhanced security and offline validation. This implementation allows the plugin to validate API keys locally without requiring internet connectivity after the initial setup.

## Features

### ✅ **JWT Token Validation**
- Local validation without internet dependency
- Signature verification using HMAC-SHA256
- Expiration and timing checks (exp, nbf, iat)
- Graceful error handling for malformed tokens

### ✅ **User Data Extraction**
- Email address
- Subscription plan and status
- Site limits and usage
- Permissions and features
- Expiration dates

### ✅ **Backward Compatibility**
- Legacy API keys (format: `cg_xxxxx`) still supported
- Automatic detection of JWT vs legacy format
- Seamless migration path

### ✅ **Enhanced Admin Interface**
- Real-time JWT validation feedback
- User account information display
- JWT token tester with payload viewer
- Sample token generator for testing

## JWT Token Structure

### Header
```json
{
  "typ": "JWT",
  "alg": "HS256"
}
```

### Payload (Example)
```json
{
  "user_id": 123,
  "email": "user@example.com",
  "subscription_plan": "pro",
  "subscription_status": "active",
  "site_limit": 10,
  "sites_used": 3,
  "permissions": ["bot_protection", "monetization", "analytics"],
  "features": ["jwt_auth", "advanced_detection", "custom_rules"],
  "iat": 1640995200,
  "exp": 1643587200,
  "iss": "crawlguard-dashboard",
  "aud": "crawlguard-wp"
}
```

## Implementation Details

### Files Modified/Added

1. **`class-jwt-validator.php`** (NEW)
   - Core JWT validation logic
   - Token parsing and signature verification
   - User data extraction methods
   - Sample token generation for testing

2. **`class-admin.php`** (MODIFIED)
   - JWT validation integration
   - Enhanced settings page with user data display
   - JWT token tester interface
   - Real-time validation feedback

3. **`class-api-client.php`** (MODIFIED)
   - JWT token detection and handling
   - Local validation for JWT tokens
   - Backward compatibility for legacy keys

4. **`crawlguard-wp.php`** (MODIFIED)
   - Added JWT validator to dependency loading

### Key Classes and Methods

#### CrawlGuard_JWT_Validator
- `validate_token($token)` - Main validation method
- `extract_user_info($payload)` - Extract user data from payload
- `has_permission($payload, $permission)` - Check user permissions
- `has_feature($payload, $feature)` - Check available features
- `generate_sample_token($user_data)` - Generate test tokens

#### CrawlGuard_Admin
- `validate_jwt_token()` - Validate current API key if JWT
- `get_user_data()` - Get validated user information
- `sanitize_settings($input)` - Validate JWT on settings save
- `ajax_test_jwt()` - AJAX handler for token testing

## Security Considerations

### ✅ **Implemented Security Measures**
- HMAC-SHA256 signature verification
- Token expiration validation
- Not-before (nbf) and issued-at (iat) checks
- Secure secret key management using WordPress AUTH_KEY
- Input sanitization and validation

### ⚠️ **Production Recommendations**
- Use a dedicated secret key for JWT signing (not WordPress AUTH_KEY)
- Implement token rotation/refresh mechanism
- Set appropriate expiration times (recommended: 30 days)
- Monitor for token abuse or unusual patterns

## Usage Examples

### Basic JWT Validation
```php
$jwt_validator = new CrawlGuard_JWT_Validator();
$result = $jwt_validator->validate_token($jwt_token);

if ($result['valid']) {
    $user_data = $jwt_validator->extract_user_info($result['payload']);
    echo "Welcome, " . $user_data['email'];
} else {
    echo "Invalid token: " . $result['error'];
}
```

### Check User Permissions
```php
$payload = $result['payload'];
if ($jwt_validator->has_permission($payload, 'monetization')) {
    // Enable monetization features
}
```

### Get Subscription Info
```php
$subscription = $jwt_validator->get_subscription_info($payload);
if ($subscription['active']) {
    echo "Plan: " . $subscription['plan'];
    echo "Expires: " . $subscription['expires'];
}
```

## Testing

### JWT Token Tester
The plugin includes a built-in JWT token tester accessible from:
**WordPress Admin → CrawlGuard → Settings → JWT Token Tester**

Features:
- Paste any JWT token to validate
- View decoded payload data
- Generate sample tokens for testing
- Real-time validation feedback

### Sample Token Generation
```php
$jwt_validator = new CrawlGuard_JWT_Validator();
$sample_token = $jwt_validator->generate_sample_token(array(
    'email' => 'test@example.com',
    'subscription_plan' => 'enterprise'
));
```

## Error Handling

The implementation provides detailed error messages for various failure scenarios:

- **Invalid JWT format** - Token doesn't have 3 parts
- **Invalid encoding** - Base64 decoding failed
- **Invalid JSON** - Header/payload not valid JSON
- **Unsupported algorithm** - Algorithm not HS256
- **Invalid signature** - Signature verification failed
- **Token expired** - Current time > exp claim
- **Token not yet valid** - Current time < nbf claim
- **Future issued token** - iat claim > current time

## Migration from Legacy API Keys

The plugin automatically detects JWT tokens (starting with 'eyJ') vs legacy API keys (starting with 'cg_'). No migration is required - both formats work simultaneously.

### Recommended Migration Steps:
1. Generate JWT tokens in your dashboard
2. Test JWT tokens using the built-in tester
3. Replace legacy API keys with JWT tokens
4. Verify functionality in WordPress admin
5. Monitor for any validation issues

## Dashboard Integration Requirements

To fully utilize JWT authentication, your AI Crawler Guard dashboard should:

1. **Generate JWT tokens** with the required payload structure
2. **Use the same secret key** for signing (coordinate with WordPress)
3. **Set appropriate expiration times** (recommended: 30 days)
4. **Include all required user data** in the payload
5. **Provide token refresh/rotation** mechanism

## Troubleshooting

### Common Issues:

1. **"Invalid JWT signature"**
   - Ensure dashboard and WordPress use the same secret key
   - Check for token corruption during copy/paste

2. **"JWT token has expired"**
   - Generate a new token from the dashboard
   - Check system clock synchronization

3. **"Invalid JWT format"**
   - Ensure token has exactly 3 parts separated by dots
   - Check for whitespace or line breaks in token

4. **User data not displaying**
   - Verify payload contains required fields (email, subscription_plan, etc.)
   - Check token validation in the JWT tester

### Debug Mode:
Enable WordPress debug mode to see detailed JWT validation logs:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## Future Enhancements

Potential improvements for future versions:
- Token refresh mechanism
- Multiple algorithm support (RS256, ES256)
- Token blacklisting/revocation
- Rate limiting for validation attempts
- Integration with WordPress user system
- Encrypted payload support
