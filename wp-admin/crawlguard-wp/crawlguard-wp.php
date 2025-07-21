<?php
/**
 * Plugin Name: CrawlGuard WP Pro
 * Plugin URI: https://creativeinteriorsstudio.com
 * Description: AI content monetization and bot detection for WordPress. Turn AI bot traffic into revenue with intelligent content protection and full features.
 * Version: 2.0.0
 * Author: CrawlGuard Team
 * Author URI: https://creativeinteriorsstudio.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: crawlguard-wp
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('CRAWLGUARD_VERSION', '2.0.0');
define('CRAWLGUARD_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CRAWLGUARD_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('CRAWLGUARD_PLUGIN_FILE', __FILE__);

// Also define PRO constants for backward compatibility
define('CRAWLGUARD_PRO_VERSION', '2.0.0');
define('CRAWLGUARD_PRO_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CRAWLGUARD_PRO_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('CRAWLGUARD_PRO_PLUGIN_FILE', __FILE__);

// Main plugin class
class CrawlGuardWPPro {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('init', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        // Load text domain for translations
        load_plugin_textdomain('crawlguard-wp', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Initialize core components
        $this->load_dependencies();
        $this->init_hooks();
    }
    
    private function load_dependencies() {
        // Include all required files
        $includes = array(
            'class-jwt-validator.php',
            'class-admin.php',
            'class-api-client.php',
            'class-bot-detector.php',
            'class-frontend.php',
        );

        foreach ($includes as $filename) {
            $filepath = CRAWLGUARD_PLUGIN_PATH . 'includes/' . $filename;
            if (file_exists($filepath)) {
                require_once $filepath;
            }
        }
    }
    
    private function init_hooks() {
        // Initialize configuration receiver (always load for REST API endpoints)
        if (class_exists('CrawlGuard_Admin')) {
            new CrawlGuard_Admin();
        }

        // Initialize frontend protection
        if (class_exists('CrawlGuard_Frontend')) {
            new CrawlGuard_Frontend();
        }

        // Initialize bot detection
        add_action('wp', array($this, 'detect_bots'));
    }
    

    
    public function detect_bots() {
        if (class_exists('CrawlGuard_Bot_Detector')) {
            $bot_detector = new CrawlGuard_Bot_Detector();
            $bot_detector->process_request();
        }
    }
    
    public function activate() {
        // Create necessary database tables
        $this->create_tables();
        
        // Set default options
        $this->set_default_options();
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    public function deactivate() {
        // Clean up if needed
        flush_rewrite_rules();
    }
    
    private function create_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crawlguard_requests';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            request_time datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            ip_address varchar(45) NOT NULL,
            user_agent text NOT NULL,
            bot_detected tinyint(1) DEFAULT 0 NOT NULL,
            bot_name varchar(100),
            confidence_score int DEFAULT 0,
            page_url text,
            action_taken varchar(20) DEFAULT 'logged',
            revenue_amount decimal(10,6) DEFAULT 0.00,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function set_default_options() {
        $default_options = array(
            'api_key' => '',
            'monetization_enabled' => false,
            'pricing_per_request' => 0.001,
            'allowed_bots' => array(),
            'api_endpoint' => 'http://localhost:3001/api/v1'
        );
        
        add_option('crawlguard_options', $default_options);
    }
}

// Initialize the plugin
function crawlguard_wp_pro_init() {
    return CrawlGuardWPPro::get_instance();
}

// Start the plugin
add_action('plugins_loaded', 'crawlguard_wp_pro_init');
