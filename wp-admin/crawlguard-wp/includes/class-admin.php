<?php
/**
 * Configuration Receiver for CrawlGuard WP
 * Handles API-based configuration from React dashboard
 */

if (!defined('ABSPATH')) {
    exit;
}

class CrawlGuard_Admin {

    private $jwt_validator;
    private $user_data = null;

    public function __construct() {
        // Initialize JWT validator
        $this->jwt_validator = new CrawlGuard_JWT_Validator();

        // Add REST API endpoint for configuration updates
        add_action('rest_api_init', array($this, 'register_rest_endpoints'));

        // Validate JWT token on init
        add_action('init', array($this, 'validate_jwt_token'));
    }

    /**
     * Register REST API endpoints for configuration
     */
    public function register_rest_endpoints() {
        register_rest_route('crawlguard/v1', '/configure', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_configuration_update'),
            'permission_callback' => array($this, 'verify_api_key_permission'),
            'args' => array(
                'apiKey' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'settings' => array(
                    'required' => true,
                    'type' => 'object',
                ),
            ),
        ));

        register_rest_route('crawlguard/v1', '/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_plugin_status'),
            'permission_callback' => array($this, 'verify_api_key_permission'),
        ));
    }

    /**
     * Verify API key permission for REST endpoints
     */
    public function verify_api_key_permission($request) {
        $api_key = $request->get_param('apiKey') ?? $request->get_header('X-API-Key');

        if (empty($api_key)) {
            return new WP_Error('missing_api_key', 'API key is required', array('status' => 401));
        }

        // For configuration endpoint, we'll validate the API key format and trust it
        // since it's coming from our own backend
        if (strpos($api_key, 'eyJ') === 0) {
            // JWT token format - validate locally
            if ($this->jwt_validator && method_exists($this->jwt_validator, 'validate_token')) {
                $validation_result = $this->jwt_validator->validate_token($api_key);
                if ($validation_result && isset($validation_result['valid']) && $validation_result['valid']) {
                    return true;
                }
            }
        } elseif (strpos($api_key, 'cg_') === 0 && strlen($api_key) === 35) {
            // Legacy API key format - basic validation
            return true;
        }

        // Fallback: try to validate against backend if API client is available
        if (class_exists('CrawlGuard_API_Client')) {
            try {
                $api_client = new CrawlGuard_API_Client();
                $api_client->set_api_key($api_key);
                $validation_result = $api_client->validate_api_key();

                if ($validation_result && isset($validation_result['success']) && $validation_result['success']) {
                    return true;
                }
            } catch (Exception $e) {
                error_log('CrawlGuard API validation error: ' . $e->getMessage());
            }
        }

        return new WP_Error('invalid_api_key', 'Invalid API key', array('status' => 403));
    }

    /**
     * Handle configuration updates from React dashboard
     */
    public function handle_configuration_update($request) {
        $api_key = $request->get_param('apiKey');
        $settings = $request->get_param('settings');

        // Update plugin options
        $current_options = get_option('crawlguard_options', array());
        $updated_options = array_merge($current_options, array(
            'api_key' => $api_key,
            'monetization_enabled' => $settings['monetizationEnabled'] ?? false,
            'pricing_per_request' => $settings['pricingPerRequest'] ?? 0.001,
            'allowed_bots' => $settings['allowedBots'] ?? array(),
            'bot_protection_enabled' => $settings['botProtectionEnabled'] ?? true,
            'last_updated' => current_time('timestamp'),
            'configured_from_dashboard' => true
        ));

        update_option('crawlguard_options', $updated_options);

        // Validate the new configuration
        $this->validate_jwt_token();

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Configuration updated successfully',
            'data' => array(
                'site_url' => get_site_url(),
                'plugin_version' => CRAWLGUARD_VERSION,
                'status' => 'configured'
            )
        ));
    }

    /**
     * Get plugin status for React dashboard
     */
    public function get_plugin_status($request) {
        $options = get_option('crawlguard_options', array());

        return rest_ensure_response(array(
            'success' => true,
            'data' => array(
                'site_url' => get_site_url(),
                'plugin_version' => CRAWLGUARD_VERSION,
                'is_configured' => !empty($options['api_key']),
                'monetization_enabled' => $options['monetization_enabled'] ?? false,
                'last_updated' => $options['last_updated'] ?? null,
                'configured_from_dashboard' => $options['configured_from_dashboard'] ?? false
            )
        ));
    }

    /**
     * Validate JWT token and extract user data
     */
    public function validate_jwt_token() {
        $options = get_option('crawlguard_options', array());
        $api_key = $options['api_key'] ?? '';

        if (empty($api_key)) {
            $this->user_data = null;
            return;
        }

        // Check if it's a JWT token (starts with 'eyJ')
        if (strpos($api_key, 'eyJ') === 0) {
            $validation_result = $this->jwt_validator->validate_token($api_key);

            if ($validation_result['valid']) {
                $this->user_data = $validation_result['payload'];
                // Cache the validation result for 1 hour
                set_transient('crawlguard_jwt_validation', $validation_result, 3600);
            } else {
                $this->user_data = null;
                // Store validation error for logging
                error_log('CrawlGuard JWT validation error: ' . $validation_result['error']);
            }
        } else {
            // Legacy API key format - maintain backward compatibility
            $this->user_data = array(
                'legacy_key' => true,
                'api_key' => $api_key
            );
        }
    }

    /**
     * Get user data from validated JWT
     */
    public function get_user_data() {
        return $this->user_data;
    }


}
