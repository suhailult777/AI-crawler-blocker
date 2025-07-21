<?php
/**
 * JWT Token Validator for CrawlGuard WP
 * 
 * Handles JWT token validation without requiring external libraries
 */

if (!defined('ABSPATH')) {
    exit;
}

class CrawlGuard_JWT_Validator {
    
    private $secret_key;
    private $algorithm = 'HS256';
    
    public function __construct() {
        // Use WordPress secret keys for JWT validation
        // In production, this should be the same secret used by your dashboard
        $this->secret_key = defined('AUTH_KEY') ? AUTH_KEY : 'crawlguard-default-secret';
    }
    
    /**
     * Validate JWT token and return payload
     */
    public function validate_token($token) {
        try {
            // Split the token into parts
            $parts = explode('.', $token);
            
            if (count($parts) !== 3) {
                return array(
                    'valid' => false,
                    'error' => 'Invalid JWT format - token must have 3 parts'
                );
            }
            
            list($header_encoded, $payload_encoded, $signature_encoded) = $parts;
            
            // Decode header
            $header = $this->base64url_decode($header_encoded);
            if (!$header) {
                return array(
                    'valid' => false,
                    'error' => 'Invalid JWT header encoding'
                );
            }
            
            $header_data = json_decode($header, true);
            if (!$header_data) {
                return array(
                    'valid' => false,
                    'error' => 'Invalid JWT header JSON'
                );
            }
            
            // Check algorithm
            if (!isset($header_data['alg']) || $header_data['alg'] !== $this->algorithm) {
                return array(
                    'valid' => false,
                    'error' => 'Unsupported or missing algorithm'
                );
            }
            
            // Decode payload
            $payload = $this->base64url_decode($payload_encoded);
            if (!$payload) {
                return array(
                    'valid' => false,
                    'error' => 'Invalid JWT payload encoding'
                );
            }
            
            $payload_data = json_decode($payload, true);
            if (!$payload_data) {
                return array(
                    'valid' => false,
                    'error' => 'Invalid JWT payload JSON'
                );
            }
            
            // Verify signature
            $signature = $this->base64url_decode($signature_encoded);
            $expected_signature = $this->sign($header_encoded . '.' . $payload_encoded);
            
            if (!hash_equals($expected_signature, $signature)) {
                return array(
                    'valid' => false,
                    'error' => 'Invalid JWT signature'
                );
            }
            
            // Check expiration
            if (isset($payload_data['exp']) && $payload_data['exp'] < time()) {
                return array(
                    'valid' => false,
                    'error' => 'JWT token has expired'
                );
            }
            
            // Check not before
            if (isset($payload_data['nbf']) && $payload_data['nbf'] > time()) {
                return array(
                    'valid' => false,
                    'error' => 'JWT token is not yet valid'
                );
            }
            
            // Check issued at
            if (isset($payload_data['iat']) && $payload_data['iat'] > time()) {
                return array(
                    'valid' => false,
                    'error' => 'JWT token issued in the future'
                );
            }
            
            return array(
                'valid' => true,
                'payload' => $payload_data,
                'header' => $header_data
            );
            
        } catch (Exception $e) {
            return array(
                'valid' => false,
                'error' => 'JWT validation error: ' . $e->getMessage()
            );
        }
    }
    
    /**
     * Create HMAC signature for JWT
     */
    private function sign($data) {
        return hash_hmac('sha256', $data, $this->secret_key, true);
    }
    
    /**
     * Base64 URL decode
     */
    private function base64url_decode($data) {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $data .= str_repeat('=', $padlen);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
    
    /**
     * Base64 URL encode
     */
    private function base64url_encode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Extract user information from JWT payload
     */
    public function extract_user_info($payload) {
        if (!is_array($payload)) {
            return array();
        }
        
        return array(
            'user_id' => $payload['user_id'] ?? null,
            'email' => $payload['email'] ?? null,
            'subscription_plan' => $payload['subscription_plan'] ?? null,
            'subscription_status' => $payload['subscription_status'] ?? null,
            'site_limit' => $payload['site_limit'] ?? null,
            'sites_used' => $payload['sites_used'] ?? null,
            'expires_at' => $payload['exp'] ?? null,
            'issued_at' => $payload['iat'] ?? null,
            'permissions' => $payload['permissions'] ?? array(),
            'features' => $payload['features'] ?? array()
        );
    }
    
    /**
     * Check if user has specific permission
     */
    public function has_permission($payload, $permission) {
        if (!is_array($payload) || !isset($payload['permissions'])) {
            return false;
        }
        
        return in_array($permission, $payload['permissions']);
    }
    
    /**
     * Check if user has access to specific feature
     */
    public function has_feature($payload, $feature) {
        if (!is_array($payload) || !isset($payload['features'])) {
            return false;
        }
        
        return in_array($feature, $payload['features']);
    }
    
    /**
     * Get subscription status information
     */
    public function get_subscription_info($payload) {
        if (!is_array($payload)) {
            return array(
                'active' => false,
                'plan' => 'unknown',
                'expires' => null
            );
        }
        
        return array(
            'active' => ($payload['subscription_status'] ?? '') === 'active',
            'plan' => $payload['subscription_plan'] ?? 'unknown',
            'expires' => isset($payload['exp']) ? date('Y-m-d H:i:s', $payload['exp']) : null,
            'site_limit' => $payload['site_limit'] ?? 0,
            'sites_used' => $payload['sites_used'] ?? 0
        );
    }
    
    /**
     * Validate token format without full validation
     */
    public function is_jwt_format($token) {
        if (empty($token) || !is_string($token)) {
            return false;
        }
        
        // JWT tokens start with 'eyJ' (base64 encoded '{"')
        return strpos($token, 'eyJ') === 0 && substr_count($token, '.') === 2;
    }
    
    /**
     * Set custom secret key for validation
     */
    public function set_secret_key($secret) {
        $this->secret_key = $secret;
    }

    /**
     * Generate a sample JWT token for testing (development only)
     */
    public function generate_sample_token($user_data = array()) {
        $header = array(
            'typ' => 'JWT',
            'alg' => $this->algorithm
        );

        $default_payload = array(
            'user_id' => 123,
            'email' => 'test@example.com',
            'subscription_plan' => 'pro',
            'subscription_status' => 'active',
            'site_limit' => 10,
            'sites_used' => 3,
            'permissions' => array('bot_protection', 'monetization', 'analytics'),
            'features' => array('jwt_auth', 'advanced_detection', 'custom_rules'),
            'iat' => time(),
            'exp' => time() + (30 * 24 * 60 * 60), // 30 days
            'iss' => 'crawlguard-dashboard',
            'aud' => 'crawlguard-wp'
        );

        $payload = array_merge($default_payload, $user_data);

        $header_encoded = $this->base64url_encode(json_encode($header));
        $payload_encoded = $this->base64url_encode(json_encode($payload));

        $signature = $this->sign($header_encoded . '.' . $payload_encoded);
        $signature_encoded = $this->base64url_encode($signature);

        return $header_encoded . '.' . $payload_encoded . '.' . $signature_encoded;
    }
}
